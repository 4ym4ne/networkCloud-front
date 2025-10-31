import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { envServer as env } from "@/core/config/env.server";
import { getAuthSession } from "@/features/auth/server";
import { logger } from "@/core/logging/logger";
import { validateCsrfToken } from "@/server/csrf";
import { CSRF_COOKIE } from "@/core/security/cookies";

function ensureGatewayUrl(): string {
  if (!env.API_GATEWAY_URL) {
    throw new Error("API_GATEWAY_URL is not configured");
  }
  return env.API_GATEWAY_URL.replace(/\/+$/, "");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
  }

  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (session.error) {
      logger.warn("Notification mutation blocked due to session error:", session.error);
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const secret = process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret: secret ?? undefined });
    const accessToken = token?.accessToken;

    if (!token || typeof accessToken !== "string") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const csrfCookie =
      req.cookies.get(CSRF_COOKIE)?.value ?? session.csrfToken ?? token?.csrfToken ?? undefined;
    const csrfHeader = req.headers.get("x-csrf-token");

    if (!validateCsrfToken(csrfCookie, csrfHeader ?? undefined)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const upstreamUrl = `${ensureGatewayUrl()}/api/notifications/${encodeURIComponent(id)}/read`;
    const bodyText = await req.text();

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": req.headers.get("content-type") ?? "application/json",
      },
      body: bodyText || JSON.stringify({ read: true }),
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      logger.warn("Notification mark-as-read failed", {
        id,
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
        { error: "Failed to mark notification as read", details: text || undefined },
        { status: upstream.status },
      );
    }

    if (!text) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    try {
      const payload = JSON.parse(text);
      return NextResponse.json(payload, { status: upstream.status });
    } catch {
      return new NextResponse(text, {
        status: upstream.status,
        headers: { "content-type": upstream.headers.get("content-type") ?? "text/plain" },
      });
    }
  } catch (error) {
    logger.error("Notification mark-as-read proxy error", error);
    return NextResponse.json({ error: "Internal notification mutation error" }, { status: 500 });
  }
}
