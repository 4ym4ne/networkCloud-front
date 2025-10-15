// **__ Callback route — handles redirect from Keycloak (PKCE token exchange) __**

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getUserInfo } from "@/server/oidc";
import { createSession } from "@/server/session";
import { envServer as env } from "@/config/env.server";
import { createClient } from "redis";

// ⚙️ Initialize Redis (minimal one-liner client for de-duplication)
const redis = createClient({ url: env.REDIS_URL });
redis.connect().catch((err) =>
    console.error("❌ Redis connection failed in callback:", err)
);

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

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

        // **__ Step 1: Retrieve PKCE verifier from cookie __**
        const codeVerifier = req.cookies.get("pkce_verifier")?.value;
        if (!codeVerifier) {
            return NextResponse.json(
                { error: "Missing PKCE verifier" },
                { status: 400 }
            );
        }

        // **__ Step 2: Exchange code for tokens via Keycloak __**
        const tokens = await exchangeCodeForTokens(code, codeVerifier);

        // **__ Step 3: Fetch user info from Keycloak __**
        const userInfo = await getUserInfo(tokens.access_token);
        const userSub = userInfo.sub;

        // **__ Step 4: Find existing session(s) for same userSub and delete __**
        // This ensures one active session per user
        const allKeys = await redis.keys("sess:*");
        for (const key of allKeys) {
            const raw = await redis.get(key);
            if (raw && raw.includes(`"sub":"${userSub}"`)) {
                console.log(`♻️ Existing session for user ${userSub} → deleting old key ${key}`);
                await redis.del(key);
            }
        }

        // **__ Step 5: Create new Redis session __**
        const sid = await createSession({
            sub: userSub,
            username: userInfo.preferred_username ?? userInfo.email ?? "user",
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Date.now() + tokens.expires_in * 1000,
            roles: userInfo.realm_access?.roles ?? [],
        });

        // **__ Step 6: Clean up PKCE cookie and set new sid cookie __**
        const redirectUrl = new URL("/", req.url);
        const res = NextResponse.redirect(redirectUrl);
        res.cookies.delete("pkce_verifier");
        res.cookies.set("sid", sid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: env.SESSION_TTL ?? 60 * 60 * 24 * 7,
        });

        console.log(`✅ User ${userSub} logged in — new session: ${sid}`);
        return res;
    } catch (err) {
        console.error("❌ Callback processing failed:", err);
        return NextResponse.json({ error: "Token exchange failed" }, { status: 500 });
    }
}