import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { envServer as env } from "@/core/config/env.server";
import { getAuthSession } from "@/features/auth/server";
import { logger } from "@/core/logging/logger";

function ensureGatewayUrl(): string {
  if (!env.API_GATEWAY_URL) {
    throw new Error("API_GATEWAY_URL is not configured");
  }
  return env.API_GATEWAY_URL.replace(/\/+$/, "");
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (session.error) {
      logger.warn("Notifications fetch blocked due to session error:", session.error);
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const secret = process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret: secret ?? undefined });
    const accessToken = token?.accessToken;

    if (!token || typeof accessToken !== "string") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const upstreamUrl = new URL(`${ensureGatewayUrl()}/api/notifications`);
    req.nextUrl.searchParams.forEach((value, key) => {
      upstreamUrl.searchParams.set(key, value);
    });

    const upstream = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      logger.warn("Notifications fetch failed", {
        status: upstream.status,
        body: text,
      });

      if (text) {
        try {
          const payload = JSON.parse(text);
          return NextResponse.json(payload, { status: upstream.status });
        } catch {
          // fallthrough
        }
      }

      return NextResponse.json(
        { error: "Failed to load notifications", details: text || undefined },
        { status: upstream.status },
      );
    }

    if (!text) {
      return NextResponse.json([], { status: 200 });
    }

    try {
      const payload = JSON.parse(text);
      return NextResponse.json(payload, { status: 200 });
    } catch {
      logger.warn("Gateway returned non JSON notifications response");
      return new NextResponse(text, {
        status: 200,
        headers: { "content-type": upstream.headers.get("content-type") ?? "text/plain" },
      });
    }
  } catch (error) {
    logger.error("Notifications proxy error", error);
    return NextResponse.json({ error: "Internal notifications proxy error" }, { status: 500 });
  }
}
