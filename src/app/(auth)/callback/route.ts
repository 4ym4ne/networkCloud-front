import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/server/oidc";
import { createSession } from "@/server/session";
import { envServer as env } from "@/config/env.server";
import { generateCsrfToken } from "@/server/csrf";
import { SID_COOKIE, CSRF_COOKIE } from "@/lib/cookies";
import { redis } from "@/server/redis";
import { auditAuthEvent } from "@/server/audit";

/**
 * ✅ Callback Route — handles the Keycloak redirect (PKCE token exchange)
 * ----------------------------------------------------------------------
 * 1. Retrieves the authorization code & PKCE verifier
 * 2. Exchanges code for tokens via Keycloak
 * 3. Fetches user info
 * 4. Deletes any old Redis sessions for same user
 * 5. Creates a new Redis session
 * 6. Sets secure cookies (`sid` + `csrf_token`)
 * 7. Redirects to `/` (or any target)
 */

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined;
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");
        const state = url.searchParams.get("state");

        // 1️⃣ --- Error Handling ---
        if (error) {
            console.error("❌ OIDC error:", error);
            await auditAuthEvent({ type: "login_failure", ip, reason: String(error), meta: { state } });
            return NextResponse.json({ error }, { status: 400 });
        }

        if (!code) {
            await auditAuthEvent({ type: "login_failure", ip, reason: "Missing authorization code", meta: { state } });
            return NextResponse.json(
                { error: "Missing authorization code" },
                { status: 400 }
            );
        }

        if (!state) {
            await auditAuthEvent({ type: "login_failure", ip, reason: "Missing state" });
            return NextResponse.json({ error: "Missing state" }, { status: 400 });
        }

        // 2️⃣ --- Retrieve PKCE verifier & nonce from Redis using state ---
        const key = `oidc:pkce:${state}`;
        const raw = await redis.get(key);
        if (!raw) {
            await auditAuthEvent({ type: "login_failure", ip, reason: "Invalid or expired state", meta: { state } });
            return NextResponse.json({ error: "Invalid or expired state" }, { status: 400 });
        }

        let saved: { codeVerifier: string; nonce?: string };
        try {
            saved = JSON.parse(raw);
        } catch (e) {
            await redis.del(key).catch(() => {});
            await auditAuthEvent({ type: "login_failure", ip, reason: "Invalid PKCE state format", meta: { state } });
            return NextResponse.json({ error: "Invalid PKCE state format" }, { status: 400 });
        }

        const { codeVerifier, nonce } = saved;

        // 3️⃣ --- Exchange code for tokens (will validate id_token with nonce) ---
        let exchangeResult;
        try {
            exchangeResult = await exchangeCodeForTokens(code, codeVerifier, state, nonce);
        } catch (err) {
            console.error("❌ Token exchange error:", err);
            await auditAuthEvent({ type: "login_failure", ip, reason: "token_exchange_failed", meta: { state } });
            return NextResponse.json({ error: "Token exchange failed" }, { status: 500 });
        }

        const { tokens, idTokenClaims } = exchangeResult;

        // Remove PKCE state (single use)
        await redis.del(key).catch(() => {});

        // 4️⃣ --- Fetch user info (prefer id_token claims if available) ---
        const userInfo = idTokenClaims ?? (tokens.access_token ? { sub: "", preferred_username: undefined, email: undefined } : null);
        const userSub = (idTokenClaims && (idTokenClaims as any).sub as string) || (userInfo && (userInfo as any).sub) || "unknown";

        // 5️⃣ --- Create new Redis session ---
        const sid = await createSession({
            sub: userSub,
            username: (idTokenClaims && (idTokenClaims.preferred_username as string)) ?? (tokens?.preferred_username ?? (tokens?.email ?? "user")),
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            id_token: tokens.id_token,
            expires_at: Date.now() + (tokens.expires_in ?? 3600) * 1000,
            roles: (idTokenClaims && ((idTokenClaims as any).realm_access?.roles as string[])) ?? [],
        });

        // 6️⃣ --- Generate CSRF token ---
        const csrfToken = generateCsrfToken();

        // 7️⃣ --- Prepare redirect response ---
        const redirectUrl = new URL("/", req.url);
        const res = NextResponse.redirect(redirectUrl);

        // --- Set session cookie ---
        res.cookies.set(SID_COOKIE, sid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: env.SESSION_TTL ?? 60 * 60 * 24 * 7,
        });

        // --- Set CSRF token cookie (readable) ---
        res.cookies.set(CSRF_COOKIE, csrfToken, {
            httpOnly: false, // must be readable by frontend JS
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: Math.min(60 * 60 * 24, env.SESSION_TTL ?? 60 * 60 * 24), // at most 1 day
        });

        // Audit login success (pseudonymized)
        await auditAuthEvent({ type: "login_success", sub: userSub, username: (idTokenClaims && (idTokenClaims.preferred_username as string)) ?? (tokens?.preferred_username ?? undefined), sid, ip, outcome: "ok" });

        console.log(`✅ User ${userSub} logged in — new session: ${sid}`);
        return res;
    } catch (err) {
        console.error("❌ Callback processing failed:", err);
        await auditAuthEvent({ type: "login_failure", reason: "exception", ip: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined, meta: { message: String(err) } });
        return NextResponse.json({ error: "Token exchange failed" }, { status: 500 });
    }
}
