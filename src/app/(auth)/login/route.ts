// **__ Login route — starts PKCE flow only if user truly not logged in __**

import { NextRequest, NextResponse } from "next/server";
import { createPkceSession, buildAuthorizationUrl, computeCodeChallenge } from "@/server/oidc";
import { getSession } from "@/server/session";
import { PKCE_COOKIE, SID_COOKIE } from "@/lib/cookies";

export async function GET(req: NextRequest) {
    try {
        // **__ Step 0: Check if there is an existing valid session via cookie __**
        const sid = req.cookies.get(SID_COOKIE)?.value;

        if (sid) {
            const existing = await getSession(sid);
            if (existing && Date.now() < existing.expires_at) {
                console.log(`✅ Already logged in as ${existing.username} — redirecting to /`);
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        // **__ Step 2: No valid session — start (or reuse) PKCE auth flow __**
        // If a PKCE verifier cookie already exists (for example due to Link prefetch or an earlier attempt), reuse it
        const existingVerifier = req.cookies.get(PKCE_COOKIE)?.value;

        let codeVerifier: string;
        let codeChallenge: string;

        if (existingVerifier) {
            codeVerifier = existingVerifier;
            codeChallenge = computeCodeChallenge(codeVerifier);
            console.log("🔑 Reusing existing PKCE verifier from cookie");
        } else {
            const pkce = createPkceSession();
            codeVerifier = pkce.codeVerifier;
            codeChallenge = pkce.codeChallenge;
            console.log("🔑 Starting new PKCE login flow (new verifier created)");
        }

        const authUrl = await buildAuthorizationUrl(codeChallenge);

        // **__ Step 3: Store PKCE verifier securely (5 min) if newly created __**
        const res = NextResponse.redirect(authUrl);
        if (!existingVerifier) {
            res.cookies.set(PKCE_COOKIE, codeVerifier, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 300,
            });
        } else {
            // refresh TTL on reuse to keep it valid for the redirect
            res.cookies.set(PKCE_COOKIE, codeVerifier, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 300,
            });
        }

        return res;
    } catch (err) {
        console.error("❌ Login redirect failed:", err);
        return NextResponse.json({ error: "Failed to start login flow" }, { status: 500 });
    }
}