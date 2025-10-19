import { NextRequest, NextResponse } from "next/server";
import { getProtectedRule, resolvePolicyRoles } from "@/core/security/protected-routes";
import { getToken } from "next-auth/jwt";

export const defaultPublicPaths = [
  "/",
  "/login",
  "/favicon.ico",
  "/_next",
];

/**
 * Treat '/' as exact match; other entries as prefix matches.
 */
export function isPublicPath(pathname: string, publicPaths: string[] = defaultPublicPaths): boolean {
  for (const p of publicPaths) {
    if (p === "/") {
      if (pathname === "/") return true;
    } else {
      if (pathname.startsWith(p)) return true;
    }
  }
  return false;
}

export function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: https:; connect-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:"
    );
  }

  return res;
}

export function buildLoginRedirect(req: NextRequest, pathname: string): NextResponse {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", pathname);
  const res = NextResponse.redirect(loginUrl);
  return res;
}

export async function authorizeRequest(req: NextRequest, pathname: string): Promise<NextResponse | null> {
  // Check if path is protected
  const rule = getProtectedRule(pathname);
  if (!rule) return null; // not protected

  const secret = process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret: secret ?? undefined });
  if (!token) {
    return buildLoginRedirect(req, pathname);
  }

  // Enforce roles if rule requires
  const requiredRoles =
    typeof rule === "string" ? [] : resolvePolicyRoles(rule);

  if (requiredRoles.length > 0) {
    const userRoles = Array.isArray((token as any).roles) ? ((token as any).roles as string[]) : [];
    const hasRole = requiredRoles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return null; // allowed
}
