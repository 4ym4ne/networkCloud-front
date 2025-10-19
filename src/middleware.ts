// **__ Edge-safe global middleware for auth and session validation __**
import { NextRequest, NextResponse } from "next/server";
import { isPublicPath, addSecurityHeaders, authorizeRequest } from "@/server/middleware/utils";

// Keep middleware as a thin wrapper using authorizeRequest helper.

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow public paths: use helper (treats '/' as exact match)
    if (isPublicPath(pathname)) return addSecurityHeaders(NextResponse.next());

    // Authorization: central helper handles protected check, session validation, and role enforcement.
    const authDecision = await authorizeRequest(req, pathname);
    if (authDecision) return addSecurityHeaders(authDecision);

    return addSecurityHeaders(NextResponse.next());
}

export const config = {
    matcher: ["/((?!_next|favicon.ico|api).*)"], // Don’t apply to API routes
};
