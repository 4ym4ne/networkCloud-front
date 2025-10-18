// src/app/api/session/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { envServer as env } from "@/config/env.server";
import { getSession, rotateSession, destroySession } from "@/server/session";
import { SID_COOKIE, CSRF_COOKIE } from "@/lib/cookies";
import { refreshToken as oidcRefresh } from "@/server/oidc";
import { validateCsrfToken, generateCsrfToken } from "@/server/csrf";
import { auditAuthEvent } from "@/server/audit";

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined;
        // CSRF protection: require header matching CSRF cookie
        const csrfCookie = req.cookies.get(CSRF_COOKIE)?.value;
        let csrfHeader = req.headers.get("x-csrf-token");

        // If header missing, try JSON body (common for SPA clients)
        if (!csrfHeader) {
            try {
                const contentType = req.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const body = await req.json();
                    if (body && (body.csrf_token || body.csrfToken)) {
                        csrfHeader = body.csrf_token ?? body.csrfToken;
                    }
                } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
                    // form submissions are unlikely for refresh but handle gracefully
                    try {
                        const form = await req.formData();
                        const field = form.get('csrf_token') ?? form.get('csrfToken');
                        if (typeof field === 'string') csrfHeader = field;
                    } catch (e) {
                        // ignore
                    }
                }
            } catch (e) {
                // ignore JSON/body parsing errors — fall through to validation and reject if missing
            }
        }

        // Same-origin fallback: if header missing but cookie exists and Origin/Referer matches, accept
        const originHeader = req.headers.get('origin');
        const refererHeader = req.headers.get('referer');
        const appOrigin = req.nextUrl.origin;
        const originMatches = originHeader === appOrigin || (refererHeader && refererHeader.startsWith(appOrigin));

        const csrfValid = validateCsrfToken(csrfCookie, csrfHeader) || (!!csrfCookie && !csrfHeader && originMatches);

        if (!csrfValid) {
            console.warn('CSRF validation failed for /api/session/refresh — details:', {
                cookiePresent: !!csrfCookie,
                headerPresent: !!csrfHeader,
                originHeader,
                refererHeader,
                appOrigin,
            });
            await auditAuthEvent({ type: 'refresh_failure', ip, reason: 'csrf_invalid', outcome: 'failed' });
            return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
        }

        const sid = req.cookies.get(SID_COOKIE)?.value;
        if (!sid) {
            await auditAuthEvent({ type: 'refresh_failure', ip, reason: 'missing_sid', outcome: 'failed' });
            return NextResponse.json({ error: "Missing session ID" }, { status: 401 });
        }

        const session = await getSession(sid);
        if (!session?.refresh_token) {
            console.warn(`⚠️ Invalid session ${sid} — missing refresh token`);
            await destroySession(sid);
            await auditAuthEvent({ type: 'refresh_failure', sid, username: session?.username, ip, reason: 'missing_refresh_token', outcome: 'failed' });
            return NextResponse.json({ error: "No valid session" }, { status: 401 });
        }

        // Use discovery-based refresh helper which validates id_token if present
        let refreshed;
        try {
            refreshed = await oidcRefresh(session.refresh_token);
        } catch (err) {
            console.error("❌ Token refresh failed:", err);
            await destroySession(sid); // Clean up invalid sessions
            await auditAuthEvent({ type: 'refresh_failure', sid, username: session?.username, ip, reason: 'token_refresh_failed', meta: { err: String(err) }, outcome: 'failed' });
            return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
        }

        const tokens = refreshed.tokens;

        const newSid = await rotateSession(sid, {
            sub: session.sub,
            username: session.username,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token ?? session.refresh_token,
            expires_at: Date.now() + (tokens.expires_in ?? 3600) * 1000,
            roles: session.roles,
        });

        console.log(`🔄 Session rotated for user ${session.username}: ${sid} → ${newSid}`);

        // Audit refresh success
        await auditAuthEvent({ type: 'refresh_success', sid: newSid, username: session.username, sub: session.sub, ip, outcome: 'ok' });

        const res = NextResponse.json({ message: "Session refreshed" });
        res.cookies.set(SID_COOKIE, newSid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: env.SESSION_TTL,
        });

        // Rotate CSRF token as a defense-in-depth
        try {
            const newCsrf = generateCsrfToken();
            res.cookies.set(CSRF_COOKIE, newCsrf, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: Math.min(60 * 60 * 24, env.SESSION_TTL ?? 60 * 60 * 24),
            });
        } catch (e) {
            // non-fatal
            console.warn('Failed to rotate CSRF token on refresh', e);
        }

        return res;
    } catch (err) {
        console.error("❌ Unexpected refresh error:", err);
        await auditAuthEvent({ type: 'refresh_failure', reason: 'exception', meta: { message: String(err) } });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}