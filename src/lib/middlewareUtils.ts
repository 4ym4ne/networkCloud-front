import { NextRequest, NextResponse } from "next/server";
import { SID_COOKIE } from "@/lib/cookies";
import { getProtectedRule } from "@/config/protectedRoutes";
import { logger } from "@/lib/logger";

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

export type SessionValidationResult =
  | false
  | {
      valid: boolean;
      expired?: boolean;
      username?: string;
      roles?: string[];
    };

export async function validateSessionViaApi(req: NextRequest): Promise<SessionValidationResult> {
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
    // return the full payload so callers can check roles/username
    return payload as unknown as { valid: boolean; expired?: boolean; username?: string; roles?: string[] };
  } catch (err) {
    logger.warn("validateSessionViaApi error:", err);
    return false;
  }
}

// --- New helper: authorizeRequest ------------------------------------------------
// Centralize protected-path authorization logic so middleware uses a single function.
// Returns a NextResponse when the request should be responded to immediately
// (redirect to login or a 403 response). Returns null when the request should continue.

const sessionCache = new Map<string, { valid: boolean; exp: number }>();
const SESSION_CACHE_TTL_MS = 5_000; // 5 seconds

export async function authorizeRequest(req: NextRequest, pathname: string): Promise<NextResponse | null> {
  // Check if path is protected
  const rule = getProtectedRule(pathname);
  if (!rule) return null; // not protected

  // Extract sid
  const sid = req.cookies.get(SID_COOKIE)?.value;
  if (!sid) {
    return buildLoginRedirect(req, pathname);
  }

  // Check cache
  const now = Date.now();
  const cached = sessionCache.get(sid);
  if (cached && cached.exp > now) {
    if (!cached.valid) return buildLoginRedirect(req, pathname);
    return null; // allowed
  }

  // Validate via server API
  const validation = await validateSessionViaApi(req);
  if (!validation || !validation.valid) {
    const res = buildLoginRedirect(req, pathname);
    clearSidCookie(res);
    // cache negative result briefly
    sessionCache.set(sid, { valid: false, exp: now + SESSION_CACHE_TTL_MS });
    return res;
  }

  // cache success
  sessionCache.set(sid, { valid: true, exp: now + SESSION_CACHE_TTL_MS });

  // Enforce roles if rule requires
  if (typeof rule !== "string" && rule.roles && rule.roles.length > 0) {
    const userRoles = validation.roles ?? [];
    const hasRole = rule.roles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return null; // allowed
}
