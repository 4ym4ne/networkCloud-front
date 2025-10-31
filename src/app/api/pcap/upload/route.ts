import { NextRequest, NextResponse } from "next/server";
import { envServer as env } from "@/core/config/env.server";
import { getAuthSession } from "@/features/auth/server";
import { validateCsrfToken } from "@/server/csrf";
import { CSRF_COOKIE } from "@/core/security/cookies";
import { logger } from "@/core/logging/logger";
import { getToken } from "next-auth/jwt";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB safeguard until backend enforces its own limit

function ensureGatewayUrl(): string {
  if (!env.API_GATEWAY_URL) {
    throw new Error("API_GATEWAY_URL is not configured");
  }
  return env.API_GATEWAY_URL.replace(/\/+$/, "");
}

function getFileName(file: Blob): string {
  if ("name" in file && typeof (file as File).name === "string" && (file as File).name.trim().length > 0) {
    return (file as File).name.trim();
  }
  return "upload.pcap";
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (session.error) {
      logger.warn("PCAP upload blocked due to session error:", session.error);
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
    if (!validateCsrfToken(csrfCookie, csrfHeader)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const formData = await req.formData();
    const fileEntry = formData.get("file");
    if (!fileEntry || typeof fileEntry === "string") {
      return NextResponse.json({ error: "File payload missing" }, { status: 400 });
    }

    const file = fileEntry as File;
    const fileName = getFileName(file);
    const fileExt = fileName.split(".").pop()?.toLowerCase();
    if (fileExt !== "pcap") {
      return NextResponse.json({ error: "Only .pcap files are supported" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum allowed size is ${Math.floor(MAX_FILE_SIZE_BYTES / (1024 * 1024))}MB` },
        { status: 413 }
      );
    }

    const upstreamForm = new FormData();
    upstreamForm.set("file", file, fileName);

    const gatewayUrl = `${ensureGatewayUrl()}/api/pcap/upload`;

    const upstreamResponse = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: upstreamForm,
    });

    const contentType = upstreamResponse.headers.get("content-type") ?? "application/json";
    const responseBody = await upstreamResponse.text();

    if (!upstreamResponse.ok) {
      logger.warn("PCAP upload failed", {
        status: upstreamResponse.status,
        body: responseBody,
      });

      try {
        const payload = JSON.parse(responseBody);
        return NextResponse.json(payload, { status: upstreamResponse.status });
      } catch {
        return NextResponse.json(
          { error: "Gateway rejected the upload", details: responseBody || undefined },
          { status: upstreamResponse.status }
        );
      }
    }

    if (contentType.includes("application/json")) {
      try {
        const data = responseBody ? JSON.parse(responseBody) : {};
        return NextResponse.json(data, { status: upstreamResponse.status });
      } catch {
        // If gateway mislabels content, fall through to text response
        logger.warn("Gateway returned invalid JSON for PCAP upload response");
      }
    }

    // Fallback: return plain text if gateway did not send JSON
    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      headers: { "content-type": contentType },
    });
  } catch (error) {
    logger.error("PCAP upload proxy error", error);
    return NextResponse.json({ error: "Internal upload error" }, { status: 500 });
  }
}
