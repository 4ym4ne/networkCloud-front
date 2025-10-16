// **__ Edge-safe global middleware for auth and session validation __**
import { NextRequest, NextResponse } from "next/server";
import { SID_COOKIE } from "@/lib/cookies";

const publicPaths = [
    "/",
    "/login",
    "/callback",
    "/logout",
    "/favicon.ico",
    "/_next",
];

function addSecurityHeaders(res: NextResponse) {
    // Common security headers recommended for production
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    res.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");
    res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

    // Only set HSTS and a conservative CSP in production to avoid breaking local dev/hot-reload
    if (process.env.NODE_ENV === "production") {
        // HSTS for one year
        res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

        // A conservative Content-Security-Policy that allows the app itself, images, and trusted CDNs when needed.
        // Adjust if your app loads scripts/styles from external CDNs.
        res.headers.set(
            "Content-Security-Policy",
            "default-src 'self'; img-src 'self' data: https:; connect-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:"
        );
    }

    return res;
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow public paths
    if (publicPaths.some((p) => pathname.startsWith(p))) {
        const res = NextResponse.next();
        return addSecurityHeaders(res);
    }

    // Extract session cookie
    const sid = req.cookies.get(SID_COOKIE)?.value;

    // If there's no session cookie we need the user to login
    if (!sid) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", pathname);
        const res = NextResponse.redirect(loginUrl);
        return addSecurityHeaders(res);
    }

    // Do not perform an expensive validation/refresh on every navigation here.
    // The SessionProvider on the client performs validation once at app load and
    // manages refresh attempts. This reduces server-side checks on each route change.

    const res = NextResponse.next();
    return addSecurityHeaders(res);
}

export const config = {
    matcher: ["/((?!_next|favicon.ico|api).*)"], // Don’t apply to API routes
};