// src/app/(auth)/logout/route.ts
// **__ Logout route — revokes session + redirects via Keycloak, cookie cleared on the returned response __**

import { NextRequest, NextResponse } from "next/server";
import { envServer as env } from "@/config/env.server";
import { destroySession, getSession } from "@/server/session";
import { SID_COOKIE, PKCE_COOKIE, CSRF_COOKIE } from "@/lib/cookies";
import { validateCsrfToken } from "@/server/csrf";
import { auditAuthEvent } from "@/server/audit";
import { logger } from "@/lib/logger";

// GET /logout — serve a tiny page that auto-submits a POST with CSRF token populated
export async function GET(req: NextRequest) {
    // Silent server-side logout on GET: only allow when request is same-origin or provides a valid CSRF token.
    // This avoids serving any HTML and performs a silent local logout, redirecting the user back to the app home.
    try {
        const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined;
        const csrfCookie = req.cookies.get(CSRF_COOKIE)?.value;
        const csrfHeader = req.headers.get('x-csrf-token');

        const originHeader = req.headers.get('origin');
        const refererHeader = req.headers.get('referer');
        const appOrigin = req.nextUrl.origin;
        const originMatches = originHeader === appOrigin || (refererHeader && refererHeader.startsWith(appOrigin));

        const csrfValid = validateCsrfToken(csrfCookie, csrfHeader) || (!!csrfCookie && !csrfHeader && originMatches);
        if (!csrfValid) {
            logger.warn('GET /logout blocked: CSRF validation failed (silent logout requires same-origin or CSRF token)');
            await auditAuthEvent({ type: 'logout', ip, reason: 'csrf_invalid', outcome: 'failed' });
            return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
        }

        // Proceed with the same server-side logout logic as POST
        const sid = req.cookies.get(SID_COOKIE)?.value;
        let session = null as null | any;
        if (sid) {
            session = await getSession(sid);
            await destroySession(sid);

            if (session?.refresh_token || session?.access_token) {
                const revokeUrl = `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/revoke`;
                const revoke = async (token: string, hint: string) => {
                    try {
                        await fetch(revokeUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: new URLSearchParams({
                                client_id: env.KEYCLOAK_CLIENT_ID,
                                client_secret: env.KEYCLOAK_CLIENT_SECRET ?? '',
                                token,
                                token_type_hint: hint,
                            }),
                        });
                        // audit individual token revocation
                        await auditAuthEvent({ type: 'token_revoked', sid, ip, outcome: 'ok', meta: { hint } });
                    } catch (err) {
                        logger.warn('⚠️ Failed to revoke token at Keycloak:', err);
                        await auditAuthEvent({ type: 'token_revocation_failed', sid, ip, reason: String(err), meta: { hint } });
                    }
                };

                if (session.refresh_token) await revoke(session.refresh_token, 'refresh_token');
                if (session.access_token) await revoke(session.access_token, 'access_token');
            }
        }

        // Clear local cookies and redirect back home
        const postLogout = `${req.nextUrl.origin}/`;
        const res = NextResponse.redirect(postLogout);
        res.cookies.set({ name: SID_COOKIE, value: '', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
        res.cookies.set({ name: PKCE_COOKIE, value: '', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
        // CSRF cookie is readable by JS, so clear it with the same httpOnly:false flag
        res.cookies.set({ name: CSRF_COOKIE, value: '', httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });

        await auditAuthEvent({ type: 'logout', sid, ip, outcome: 'ok' });

        logger.info('Silent GET /logout completed, sid:', sid ?? '<missing>');
        return res;
    } catch (err) {
        logger.error('❌ Silent GET /logout failed:', err);
        await auditAuthEvent({ type: 'logout', reason: 'exception', outcome: 'failed', meta: { message: String(err) } });
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined;
        // CSRF protection: prefer header, fallback to form body or JSON body for non-AJAX logout
        const csrfCookie = req.cookies.get(CSRF_COOKIE)?.value;
        let csrfHeader = req.headers.get("x-csrf-token");

        if (!csrfHeader) {
            // try JSON body
            try {
                const contentType = req.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const body = await req.json();
                    if (body && (body.csrf_token || body.csrfToken)) {
                        csrfHeader = body.csrf_token ?? body.csrfToken;
                    }
                } else {
                    // try form body
                    try {
                        const form = await req.formData();
                        const field = form.get('csrf_token') ?? form.get('csrfToken');
                        if (typeof field === 'string') csrfHeader = field;
                    } catch (e) {
                        // ignore
                    }
                }
            } catch (e) {
                // ignore parsing errors
            }
        }

        // Same-origin fallback: if header missing but cookie exists and Origin/Referer matches, accept
        const originHeader = req.headers.get('origin');
        const refererHeader = req.headers.get('referer');
        const appOrigin = req.nextUrl.origin;
        const originMatches = originHeader === appOrigin || (refererHeader && refererHeader.startsWith(appOrigin));

        const csrfValid = validateCsrfToken(csrfCookie, csrfHeader) || (!!csrfCookie && !csrfHeader && originMatches);

        if (!csrfValid) {
            logger.warn('CSRF validation failed for /logout — details:', {
                cookiePresent: !!csrfCookie,
                headerPresent: !!csrfHeader,
                originHeader,
                refererHeader,
                appOrigin,
            });
            await auditAuthEvent({ type: 'logout', ip, reason: 'csrf_invalid', outcome: 'failed' });
            return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
        }

        const sid = req.cookies.get(SID_COOKIE)?.value;

        // (Optional) revoke KC refresh token, and always drop Redis session
        // Load session (if any) and then destroy Redis session
        let session = null as null | any;
        if (sid) {
            session = await getSession(sid);
            await destroySession(sid);

            if (session?.refresh_token || session?.access_token) {
                const revokeUrl = `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/revoke`;
                const revoke = async (token: string, hint: string) => {
                    try {
                        await fetch(revokeUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: new URLSearchParams({
                                client_id: env.KEYCLOAK_CLIENT_ID,
                                client_secret: env.KEYCLOAK_CLIENT_SECRET ?? "",
                                token,
                                token_type_hint: hint,
                            }),
                        });
                        await auditAuthEvent({ type: 'token_revoked', sid, ip, outcome: 'ok', meta: { hint } });
                    } catch (err) {
                        logger.warn("⚠️ Failed to revoke token at Keycloak:", err);
                        await auditAuthEvent({ type: 'token_revocation_failed', sid, ip, reason: String(err), meta: { hint } });
                    }
                };

                if (session.refresh_token) await revoke(session.refresh_token, "refresh_token");
                if (session.access_token) await revoke(session.access_token, "access_token");
            }
        }

        // ✅ Post-logout redirect must be a normal page (NOT the OIDC callback)
        const origin = req.nextUrl.origin; // e.g. http(s)://localhost:3000
        const postLogout = `${origin}/`; // send user home (or a /logged-out page)

        const baseLogout = `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/logout`;
        const kcLogout = new URL(baseLogout);
        kcLogout.searchParams.set("client_id", env.KEYCLOAK_CLIENT_ID);
        kcLogout.searchParams.set("post_logout_redirect_uri", postLogout);
        // If we have an ID token for the end-user session, include it as an id_token_hint
        // so Keycloak can identify the client session and perform a clean redirect back.
        if (session?.id_token) {
            try {
                kcLogout.searchParams.set("id_token_hint", session.id_token);
            } catch (e) {
                // ignore any issues setting the hint
            }
        }

        // Debug: log whether id_token_hint will be sent and the final logout URL (do not log entire id_token)
        try {
            const hasIdToken = !!session?.id_token;
            logger.info(`Logout: id_token_hint present=${hasIdToken}`);
            // log truncated id_token for debugging (first 10 chars) to avoid leaking sensitive token in full
            if (hasIdToken) logger.info(`Logout: id_token_hint startsWith=${session!.id_token!.slice(0,10)}...`);
            logger.info(`Logout: redirecting to Keycloak logout URL: ${kcLogout.toString()}`);
        } catch (e) {
            /* ignore logging errors */
        }

        // Build the response we return.
        // - AJAX callers get a JSON containing Keycloak logout URL so SPA can continue SSO logout if desired.
        // - Non-AJAX callers: we perform a silent local logout (server-side revoke + session destroy) and redirect
        //   immediately to the app home. This is a UX-first approach: the user is logged out locally without
        //   being taken to Keycloak's confirmation page. Note: this does NOT clear Keycloak's SSO cookie in the browser
        //   (only a redirect to Keycloak logout with id_token_hint will), so SSO session may persist across other clients.
        const isAjax = req.headers.get('x-requested-with') === 'XMLHttpRequest' || req.headers.get('accept')?.includes('application/json');

        if (isAjax) {
            const res = NextResponse.json({ logoutUrl: kcLogout.toString() });
            // Clear cookies for AJAX response as well
            res.cookies.set({ name: SID_COOKIE, value: "", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
            res.cookies.set({ name: PKCE_COOKIE, value: "", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
            res.cookies.set({ name: CSRF_COOKIE, value: "", httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
            await auditAuthEvent({ type: 'logout', sid, ip, outcome: 'ok' });
            return res;
        }

        // Non-AJAX: silent local logout — redirect user back to home immediately after clearing cookies.
        const res = NextResponse.redirect(postLogout);
        res.cookies.set({ name: SID_COOKIE, value: "", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
        res.cookies.set({ name: PKCE_COOKIE, value: "", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
        res.cookies.set({ name: CSRF_COOKIE, value: "", httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });

        const sidLabel = sid ?? "<missing>";
        logger.info(`🗑️ Cleared session cookie + Redis sid:${sidLabel}`);
        logger.info(`🗑️ Deleted session cookie + Redis sid:${sidLabel}`);

        await auditAuthEvent({ type: 'logout', sid, ip, outcome: 'ok' });

        return res;
    } catch (err) {
        logger.error("❌ Logout failed:", err);
        await auditAuthEvent({ type: 'logout', reason: 'exception', outcome: 'failed', meta: { message: String(err) } });
        return NextResponse.json({ error: "Logout failed" }, { status: 500 });
    }
}