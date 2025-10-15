import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/server/session";
import {envServer as env} from "@/config/env.server";

/**
 * Unified proxy handler — forwards requests to Spring Cloud Gateway.
 * Tokens are stored server-side in Redis, identified by `sid` cookie.
 */

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

export async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
    if (!ALLOWED_METHODS.includes(req.method))
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });

    // 1️⃣ Validate session
    const sid = req.cookies.get("sid")?.value;
    if (!sid) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const session = await getSession(sid);
    if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    // 2️⃣ Auto-refresh token if close to expiry (optional)
    const expiresSoon = Date.now() > session.expires_at - 60_000;
    if (expiresSoon) {
        await fetch(`${req.nextUrl.origin}/api/session/refresh`, {
            method: "POST",
            headers: { Cookie: `sid=${sid}` },
        });
    }

    // 3️⃣ Build target URL for Spring Cloud Gateway
    const path = params.path.join("/");
    const target = `${env.API_GATEWAY_URL}/${path}${req.nextUrl.search}`;

    // 4️⃣ Prepare request body and headers
    const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": req.headers.get("content-type") ?? "application/json",
        "X-User-Sub": session.sub,
        "X-User-Name": session.username,
    };

    const body =
        req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

    // 5️⃣ Forward request to backend
    const apiRes = await fetch(target, {
        method: req.method,
        headers,
        body,
    });

    // 6️⃣ Mirror backend response to client
    const contentType = apiRes.headers.get("content-type") ?? "application/json";
    return new NextResponse(apiRes.body, {
        status: apiRes.status,
        headers: {
            "content-type": contentType,
        },
    });
}

// Export handlers for each HTTP method
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;