import { NextResponse, type NextRequest } from "next/server";
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;

  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (session.error) {
      logger.warn("Security report fetch blocked due to session error:", session.error);
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const secret = process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret: secret ?? undefined });
    const accessToken = token?.accessToken;

    if (!token || typeof accessToken !== "string") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const gatewayUrl = `${ensureGatewayUrl()}/api/security-reports/${encodeURIComponent(fileId)}`;

    const upstream = await fetch(gatewayUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const bodyText = await upstream.text();

    if (!upstream.ok) {
      if (upstream.status === 404) {
        return NextResponse.json({ error: "Security report not found" }, { status: 404 });
      }

      logger.warn("Security report fetch failed", {
        status: upstream.status,
        body: bodyText,
      });

      try {
        const payload = bodyText ? JSON.parse(bodyText) : undefined;
        return NextResponse.json(
          payload ?? { error: "Failed to retrieve security report" },
          { status: upstream.status },
        );
      } catch {
        return NextResponse.json(
          { error: "Failed to retrieve security report", details: bodyText || undefined },
          { status: upstream.status },
        );
      }
    }

    if (!bodyText) {
      return NextResponse.json({ error: "Security report empty" }, { status: 404 });
    }

    try {
      const payload = JSON.parse(bodyText);
      return NextResponse.json(payload, { status: 200 });
    } catch {
      logger.warn("Gateway returned non JSON security report response");
      return new NextResponse(bodyText, {
        status: 200,
        headers: { "content-type": upstream.headers.get("content-type") ?? "text/plain" },
      });
    }
  } catch (error) {
    logger.error("Security report proxy error", error);
    return NextResponse.json({ error: "Internal security report error" }, { status: 500 });
  }
}
