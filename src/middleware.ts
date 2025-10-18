// **__ Edge-safe global middleware for auth and session validation __**
import { NextRequest, NextResponse } from "next/server";
import { SID_COOKIE } from "@/lib/cookies";
import { isProtectedPath } from "@/config/protectedRoutes";
import {
  isPublicPath,
  addSecurityHeaders,
  buildLoginRedirect,
  clearSidCookie,
  validateSessionViaApi,
} from "@/lib/middlewareUtils";

// Note: do NOT import server-only modules (crypto, redis, etc.) in middleware — it runs in the Edge Runtime.
// For session validation we call a server-side API endpoint (/api/session/validate) below.

// Small in-memory cache to reduce validate endpoint calls when the same sid is used repeatedly.
const sessionCache = new Map<string, { valid: boolean; exp: number }>();
const SESSION_CACHE_TTL_MS = 5_000; // 5 seconds

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

    // Allow public paths: use helper (treats '/' as exact match)
    if (isPublicPath(pathname)) {
        const res = NextResponse.next();
        return addSecurityHeaders(res);
    }

    // If the path is not configured as protected, allow through
    if (!isProtectedPath(pathname)) {
        const res = NextResponse.next();
        console.info(`middleware: path not protected, allowing ${pathname}`);
        return addSecurityHeaders(res);
    }

    // Extract session cookie
    const sid = req.cookies.get(SID_COOKIE)?.value;
    const maskedSid = sid ? `${sid.slice(0,6)}..${sid.slice(-2)}` : undefined;

    // If there's no session cookie we need the user to login
    if (!sid) {
        console.info(`middleware: unauthenticated access to ${pathname}, redirecting to login`);
        const res = buildLoginRedirect(req, pathname);
        return addSecurityHeaders(res);
    }

    // Check session cache
    const cached = sessionCache.get(sid);
    const now = Date.now();
    if (cached && cached.exp > now) {
        console.info(`middleware: session valid for ${maskedSid} (from cache)`);
    } else {
        // Validate session via helper that calls /api/session/validate
        const valid = await validateSessionViaApi(req);
        if (!valid) {
            console.info(`middleware: session invalid/expired for ${maskedSid}, redirecting to login`);
            const res = buildLoginRedirect(req, pathname);
            clearSidCookie(res);
            return addSecurityHeaders(res);
        }
        console.info(`middleware: session validated for ${maskedSid}`);
        sessionCache.set(sid, { valid: true, exp: now + SESSION_CACHE_TTL_MS });
    }

    console.info(`middleware: sid present for ${pathname} (sid=${maskedSid}), allowing`);

    // Do not perform an expensive validation/refresh on every navigation here.
    // The SessionProvider on the client performs validation once at app load and
    // manages refresh attempts. This reduces server-side checks on each route change.

    const res = NextResponse.next();
    return addSecurityHeaders(res);
}

export const config = {
    matcher: ["/((?!_next|favicon.ico|api).*)"], // Don’t apply to API routes
};