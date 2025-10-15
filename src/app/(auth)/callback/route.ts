import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getUserInfo } from "@/server/oidc";
import { createSession } from "@/server/session";
import { envServer as env } from "@/config/env.server";
import { redis } from "@/server/redis";
import { generateCsrfToken } from "@/server/csrf";

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
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        // 1️⃣ --- Error Handling ---
        if (error) {
            console.error("❌ OIDC error:", error);
            return NextResponse.json({ error }, { status: 400 });
        }

        if (!code) {
            return NextResponse.json(
                { error: "Missing authorization code" },
                { status: 400 }
            );
        }

        // 2️⃣ --- Retrieve PKCE verifier from cookie ---
        const codeVerifier = req.cookies.get("pkce_verifier")?.value;
        if (!codeVerifier) {
            return NextResponse.json(
                { error: "Missing PKCE verifier" },
                { status: 400 }
            );
        }

        // 3️⃣ --- Exchange code for tokens ---
        const tokens = await exchangeCodeForTokens(code, codeVerifier);

        // 4️⃣ --- Fetch user info ---
        const userInfo = await getUserInfo(tokens.access_token);
        const userSub = userInfo.sub;

        // 5️⃣ --- Delete any existing sessions for the same user ---
        const existingSid = await redis.get(`user:${userSub}`);
        if (existingSid) {
            console.log(`♻️ Existing session for user ${userSub} → deleting ${existingSid}`);
            await redis.del(`sess:${existingSid}`);
            await redis.del(`user:${userSub}`);
        }

        // 6️⃣ --- Create new Redis session ---
        const sid = await createSession({
            sub: userSub,
            username: userInfo.preferred_username ?? userInfo.email ?? "user",
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Date.now() + tokens.expires_in * 1000,
            roles: userInfo.realm_access?.roles ?? [],
        });

        // 7️⃣ --- Generate CSRF token ---
        const csrfToken = generateCsrfToken();

        // 8️⃣ --- Prepare redirect response ---
        const redirectUrl = new URL("/", req.url);
        const res = NextResponse.redirect(redirectUrl);

        // --- Clean PKCE cookie ---
        res.cookies.delete("pkce_verifier");

        // --- Set session cookie ---
        res.cookies.set("sid", sid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: env.SESSION_TTL ?? 60 * 60 * 24 * 7, // 7 days
        });

        // --- Set CSRF token cookie (readable) ---
        res.cookies.set("csrf_token", csrfToken, {
            httpOnly: false, // must be readable by frontend JS
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        console.log(`✅ User ${userSub} logged in — new session: ${sid}`);
        return res;
    } catch (err) {
        console.error("❌ Callback processing failed:", err);
        return NextResponse.json({ error: "Token exchange failed" }, { status: 500 });
    }
}
