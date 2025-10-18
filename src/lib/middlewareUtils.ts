// ...new file...
import { NextRequest, NextResponse } from "next/server";
import { SID_COOKIE } from "@/lib/cookies";

export const defaultPublicPaths = [
  "/",
  "/login",
  "/callback",
  "/logout",
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

export function clearSidCookie(res: NextResponse) {
  res.cookies.set(SID_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/**
 * Validate session by calling server-side endpoint /api/session/validate
 * For middleware (Edge runtime) we must forward the cookie header.
 */
export async function validateSessionViaApi(req: NextRequest): Promise<boolean> {
  const validateUrl = new URL("/api/session/validate", req.nextUrl.origin).toString();
  const cookieHeader = req.headers.get("cookie") || "";
  try {
    const resp = await fetch(validateUrl, {
      method: "POST",
      headers: {
        cookie: cookieHeader,
        "x-from-middleware": "1",
      },
    });

    if (!resp.ok) return false;
    const payload = await resp.json();
    return !!(payload && payload.valid);
  } catch (err) {
    console.warn("validateSessionViaApi error:", err);
    return false;
  }
}

