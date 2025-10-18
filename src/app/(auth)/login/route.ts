// **__ Login route — starts PKCE flow only if user truly not logged in __**

import { NextRequest, NextResponse } from "next/server";
import { createPkceSession, buildAuthorizationUrl } from "@/server/oidc";
import { getSession } from "@/server/session";
import { SID_COOKIE } from "@/lib/cookies";
import { redis } from "@/server/redis";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
    try {
        // **__ Step 0: Check if there is an existing valid session via cookie __**
        const sid = req.cookies.get(SID_COOKIE)?.value;

        if (sid) {
            const existing = await getSession(sid);
            if (existing && Date.now() < existing.expires_at) {
                logger.info(`✅ Already logged in as ${existing.username} — redirecting to /`);
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        // **__ Step 1: create PKCE + state/nonce and persist server-side in Redis __**
        const pkce = createPkceSession();
        const { codeVerifier, codeChallenge, state, nonce, ttl } = pkce;

        const key = `oidc:pkce:${state}`;
        await redis.setEx(key, ttl, JSON.stringify({ codeVerifier, nonce }));

        const authUrl = await buildAuthorizationUrl(codeChallenge, state, nonce);

        // Redirect user to Keycloak auth endpoint
        return NextResponse.redirect(authUrl);
    } catch (err) {
        logger.error("❌ Login redirect failed:", err);
        return NextResponse.json({ error: "Failed to start login flow" }, { status: 500 });
    }
}