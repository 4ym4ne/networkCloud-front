import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/features/auth/server";
import { validateCsrfToken } from "@/server/csrf";
import { envServer as env } from "@/core/config/env.server";
import { CSRF_COOKIE } from "@/core/security/cookies";
import { logger } from "@/core/logging/logger";

/**
 * Secure API Proxy (Next.js BFF → Spring Cloud Gateway)
 * ----------------------------------------------------
 * - Reads user session via NextAuth JWT
 * - Injects Bearer token from session into Authorization header
 * - Validates CSRF for mutating requests (POST, PUT, PATCH, DELETE)
 * - Automatically leverages NextAuth refresh logic (handled in auth options)
 */

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

export async function handler(
    req: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        if (!ALLOWED_METHODS.includes(req.method)) {
            return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
        }

        // 1️⃣ --- Validate session via NextAuth ---
        const session = await getAuthSession();
        if (!session || !session.accessToken) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        if (session.error) {
            logger.warn("Proxy blocked due to session error:", session.error);
            return NextResponse.json({ error: "Session expired" }, { status: 401 });
        }

        // 2️⃣ --- CSRF Protection ---
        if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
            const csrfCookie =
                req.cookies.get(CSRF_COOKIE)?.value ?? session.csrfToken ?? undefined;
            const csrfHeader = req.headers.get("x-csrf-token");
            const valid = validateCsrfToken(csrfCookie, csrfHeader);
            if (!valid) {
                return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
            }
        }

        // 3️⃣ --- Build target URL for Spring Cloud Gateway ---
        const targetUrl = `${env.API_GATEWAY_URL}/${params.path.join("/")}${req.nextUrl.search}`;

        // 4️⃣ --- Prepare headers & body ---
        const headers: Record<string, string> = {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": req.headers.get("content-type") ?? "application/json",
            "X-User-Sub": session.user?.sub ?? "",
            "X-User-Name": session.user?.username ?? session.user?.email ?? "",
        };

        const body =
            req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

        // 5️⃣ --- Forward request to backend ---
        const apiRes = await fetch(targetUrl, {
            method: req.method,
            headers,
            body,
        });

        // 6️⃣ --- Mirror backend response ---
        const contentType = apiRes.headers.get("content-type") ?? "application/json";
        return new NextResponse(apiRes.body, {
            status: apiRes.status,
            headers: { "content-type": contentType },
        });
    } catch (err) {
        logger.error("❌ Proxy error:", err);
        return NextResponse.json({ error: "Internal proxy error" }, { status: 500 });
    }
}

// ✅ Export handlers for all methods
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
