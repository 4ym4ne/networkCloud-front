import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/session";
import { validateCsrfToken } from "@/server/csrf";
import { envServer as env } from "@/config/env.server";
import { SID_COOKIE, CSRF_COOKIE } from "@/lib/cookies";

/**
 * Secure API Proxy (Next.js BFF → Spring Cloud Gateway)
 * ----------------------------------------------------
 * - Reads user session from Redis (sid cookie)
 * - Injects Bearer token from session into Authorization header
 * - Validates CSRF for mutating requests (POST, PUT, PATCH, DELETE)
 * - Automatically refreshes token if about to expire
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

        // 1️⃣ --- Validate session cookie ---
        const sid = req.cookies.get(SID_COOKIE)?.value;
        if (!sid) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const session = await getSession(sid);
        if (!session) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        // 2️⃣ --- CSRF Protection ---
        if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
            const csrfCookie = req.cookies.get(CSRF_COOKIE)?.value;
            const csrfHeader = req.headers.get("x-csrf-token");
            const valid = validateCsrfToken(csrfCookie, csrfHeader);
            if (!valid) {
                return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
            }
        }

        // 3️⃣ --- Auto-refresh token if about to expire ---
        const expiresSoon = Date.now() > session.expires_at - 60_000;
        if (expiresSoon) {
            await fetch(`${req.nextUrl.origin}/api/session/refresh`, {
                method: "POST",
                headers: { Cookie: `${SID_COOKIE}=${sid}` },
            });
        }

        // 4️⃣ --- Build target URL for Spring Cloud Gateway ---
        const targetUrl = `${env.API_GATEWAY_URL}/${params.path.join("/")}${req.nextUrl.search}`;

        // 5️⃣ --- Prepare headers & body ---
        const headers: Record<string, string> = {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": req.headers.get("content-type") ?? "application/json",
            "X-User-Sub": session.sub,
            "X-User-Name": session.username,
        };

        const body =
            req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

        // 6️⃣ --- Forward request to backend ---
        const apiRes = await fetch(targetUrl, {
            method: req.method,
            headers,
            body,
        });

        // 7️⃣ --- Mirror backend response ---
        const contentType = apiRes.headers.get("content-type") ?? "application/json";
        return new NextResponse(apiRes.body, {
            status: apiRes.status,
            headers: { "content-type": contentType },
        });
    } catch (err) {
        console.error("❌ Proxy error:", err);
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