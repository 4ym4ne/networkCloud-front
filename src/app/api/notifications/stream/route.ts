import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import WebSocket, { Data as WebSocketData } from "ws";

import { getAuthSession } from "@/features/auth/server";
import { logger } from "@/core/logging/logger";
import { envServer as env } from "@/core/config/env.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ensureGatewayWsUrl(): string {
  const base = process.env.NEXT_PUBLIC_NOTIFICATIONS_WS_URL ?? env.API_GATEWAY_URL;
  if (!base) {
    throw new Error("Notifications WebSocket URL is not configured");
  }
  const url = new URL(base);
  if (url.protocol !== "ws:" && url.protocol !== "wss:") {
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  }
  return url.toString();
}

function encodeSseChunk(data: string, event?: string) {
  const encoder = new TextEncoder();
  const prefix = event ? `event: ${event}\n` : "";
  return encoder.encode(`${prefix}data: ${data}\n\n`);
}

const RECOVERABLE_CLOSE_CODES = new Set([1000, 1001, 1005, 1012, 1013]);

function decodeCloseReason(reason: WebSocketData) {
  if (typeof reason === "string") return reason;
  if (reason instanceof ArrayBuffer) return Buffer.from(reason).toString("utf8");
  if (Buffer.isBuffer(reason)) return reason.toString("utf8");
  return "";
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (session.error) {
      logger.warn("Notifications stream blocked due to session error:", session.error);
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const secret = process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret: secret ?? undefined });
    const accessToken = token?.accessToken;

    if (!token || typeof accessToken !== "string") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const targetUrl = ensureGatewayWsUrl();

    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();

    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let heartbeatTimer: NodeJS.Timeout | null = null;
    let closed = false;
    let aborted = false;
    let reconnectAttempts = 0;

    const closeStream = async () => {
      if (closed) return;
      closed = true;
      aborted = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
      if (ws) {
        try {
          ws.removeAllListeners();
          ws.close();
        } catch {
          /* noop */
        }
        ws = null;
      }
      try {
        await writer.close();
      } catch {
        /* ignore close errors */
      }
    };

    const safeWrite = async (data: string, event?: string) => {
      if (closed) return;
      try {
        await writer.write(encodeSseChunk(data, event));
      } catch (err) {
        logger.warn("Notifications stream write failed", err);
        await closeStream();
      }
    };

    const scheduleReconnect = () => {
      if (closed || aborted) return;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      reconnectAttempts += 1;
      const delay = Math.min(1000 * reconnectAttempts, 10_000);
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectWebSocket();
      }, delay);
    };

    const connectWebSocket = () => {
      if (closed || aborted) return;
      if (ws) {
        try {
          ws.removeAllListeners();
          ws.close();
        } catch {
          /* noop */
        }
      }

      ws = new WebSocket(targetUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const current = ws;

      current.on("open", () => {
        reconnectAttempts = 0;
        void safeWrite(JSON.stringify({ status: "connected" }), "status");
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
        }
        heartbeatTimer = setInterval(() => {
          void safeWrite(JSON.stringify({ ts: Date.now() }), "heartbeat");
        }, 15_000);
      });

      current.on("message", (data) => {
        if (closed || aborted || current !== ws) return;
        try {
          const payload =
            typeof data === "string"
              ? data
              : Buffer.isBuffer(data)
              ? data.toString("utf-8")
              : JSON.stringify(data);
          void safeWrite(payload);
        } catch (err) {
          logger.error("Notifications stream serialization error", err);
        }
      });

      current.on("error", (error) => {
        if (closed || aborted || current !== ws) return;
        logger.error("Notifications stream websocket error", error);
        void safeWrite(
          JSON.stringify({
            status: "error",
            message: error instanceof Error ? error.message : String(error),
          }),
          "status",
        );
        current.close();
      });

      current.on("close", (code, reasonPayload) => {
        if (current !== ws) return;
        const reason = decodeCloseReason(reasonPayload);
        const context = { code, reason };
        logger.debug?.("Notifications stream closed", context);

        if (closed || aborted) {
          return;
        }

        if (RECOVERABLE_CLOSE_CODES.has(code)) {
          void safeWrite(
            JSON.stringify({
              status: "reconnecting",
              code,
              reason: reason || "Upstream closed connection; attempting to reconnect.",
            }),
            "status",
          );
          scheduleReconnect();
          return;
        }

        void safeWrite(
          JSON.stringify({
            status: "closed",
            code,
            reason: reason || "Notifications stream closed.",
          }),
          "status",
        ).finally(() => {
          void closeStream();
        });
      });
    };

    req.signal.addEventListener("abort", () => {
      aborted = true;
      void closeStream();
    });

    connectWebSocket();

    const headers = new Headers();
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache, no-transform");
    headers.set("Connection", "keep-alive");

    return new NextResponse(readable, {
      status: 200,
      headers,
    });
  } catch (error) {
    logger.error("Notifications stream proxy error", error);
    return NextResponse.json({ error: "Internal notifications stream error" }, { status: 500 });
  }
}
