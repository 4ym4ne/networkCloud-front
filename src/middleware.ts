// **__ Edge-safe global middleware for auth and session validation __**
import { NextRequest, NextResponse } from "next/server";
import { SID_COOKIE } from "@/lib/cookies";
import { isProtectedPath } from "@/config/protectedRoutes";
import { isPublicPath, addSecurityHeaders, authorizeRequest } from "@/lib/middlewareUtils";

// Note: do NOT import server-only modules (crypto, redis, etc.) in middleware — it runs in the Edge Runtime.
// For session validation we call a server-side API endpoint (/api/session/validate) below.

// Keep middleware as a thin wrapper using authorizeRequest helper.

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow public paths: use helper (treats '/' as exact match)
    if (isPublicPath(pathname)) return addSecurityHeaders(NextResponse.next());

    // Authorization: central helper handles protected check, session validation, cache, and role enforcement.
    const authDecision = await authorizeRequest(req, pathname);
    if (authDecision) return addSecurityHeaders(authDecision);

    return addSecurityHeaders(NextResponse.next());
}

export const config = {
    matcher: ["/((?!_next|favicon.ico|api).*)"], // Don’t apply to API routes
};