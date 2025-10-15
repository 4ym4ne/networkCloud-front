// **__ Edge-safe global middleware for auth and session validation __**
import { NextRequest, NextResponse } from "next/server";

const publicPaths = [
    "/",
    "/login",
    "/callback",
    "/logout",
    "/favicon.ico",
    "/_next",
];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow public paths
    if (publicPaths.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // Extract session cookie
    const sid = req.cookies.get("sid")?.value;

    // No session → redirect to login
    if (!sid) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ✅ Validate session using API route (Node runtime)
    const validateUrl = `${req.nextUrl.origin}/api/session/validate`;
    const resp = await fetch(validateUrl, {
        method: "POST",
        headers: { Cookie: `sid=${sid}` },
    });

    const { valid, expired } = await resp.json();

    if (!valid || expired) {
        // Attempt silent refresh
        const refreshUrl = `${req.nextUrl.origin}/api/session/refresh`;
        const refreshResp = await fetch(refreshUrl, {
            method: "POST",
            headers: { Cookie: `sid=${sid}` },
        });

        if (!refreshResp.ok) {
            // Refresh failed → redirect to login
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|favicon.ico|api).*)"], // Don’t apply to API routes
};