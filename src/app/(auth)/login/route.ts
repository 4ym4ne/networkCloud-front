// **__ Login route — starts PKCE flow only if user truly not logged in __**

import { NextRequest, NextResponse } from "next/server";
import { createPkceSession, buildAuthorizationUrl } from "@/server/oidc";
import { getSession } from "@/server/session";
import { redis } from "@/server/redis";

export async function GET(req: NextRequest) {
    try {
        // **__ Step 0: Check if there is an existing valid session via cookie __**
        const sid = req.cookies.get("sid")?.value;

        if (sid) {
            const existing = await getSession(sid);
            if (existing && Date.now() < existing.expires_at) {
                console.log(`✅ Already logged in as ${existing.username} — redirecting to /`);
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        // **__ Step 1: Check Redis for an existing user session mapping (if cookie missing) __**
        // Optional but helpful if user refreshes before cookie set
        const activeSessions = await redis.keys("sess:*");
        if (activeSessions.length > 0) {
            console.log("⚡ Active session found in Redis, skipping login flow.");
            return NextResponse.redirect(new URL("/", req.url));
        }

        // **__ Step 2: No valid session — start PKCE auth flow __**
        const { codeVerifier, codeChallenge } = createPkceSession();
        const authUrl = await buildAuthorizationUrl(codeChallenge);

        // **__ Step 3: Store PKCE verifier securely (5 min) __**
        const res = NextResponse.redirect(authUrl);
        res.cookies.set("pkce_verifier", codeVerifier, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            domain: "localhost",
            maxAge: 300,
        });

        console.log("🔑 Starting new PKCE login flow...");
        return res;
    } catch (err) {
        console.error("❌ Login redirect failed:", err);
        return NextResponse.json({ error: "Failed to start login flow" }, { status: 500 });
    }
}