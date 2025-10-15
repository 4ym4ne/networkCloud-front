// src/app/(auth)/logout/route.ts
// **__ Logout route — revokes session + redirects via Keycloak, cookie cleared on the returned response __**

import { NextRequest, NextResponse } from "next/server";
import { envServer as env } from "@/config/env.server";
import { destroySession, getSession } from "@/server/session";

export async function GET(req: NextRequest) {
    try {
        const sid = req.cookies.get("sid")?.value;

        // (Optional) revoke KC refresh token, and always drop Redis session
        if (sid) {
            const session = await getSession(sid);
            await destroySession(sid);

            if (session?.refresh_token) {
                const revokeUrl = `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/revoke`;
                await fetch(revokeUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        client_id: env.KEYCLOAK_CLIENT_ID,
                        client_secret: env.KEYCLOAK_CLIENT_SECRET ?? "",
                        token: session.refresh_token,
                        token_type_hint: "refresh_token",
                    }),
                }).catch((err) =>
                    console.warn("⚠️ Failed to revoke Keycloak refresh token:", err)
                );
            }
        }

        // ✅ Post-logout redirect must be a normal page (NOT the OIDC callback)
        const origin = req.nextUrl.origin;                // e.g. http(s)://localhost:3000
        const postLogout = `${origin}/`;                  // send user home (or a /logged-out page)

        // Make sure this URI is whitelisted in Keycloak:
        // Clients → <your client> → Settings:
        // - Valid Redirect URIs:         http://localhost:3000/*  https://localhost:3000/*
        // - Valid Post Logout Redirects: http://localhost:3000/*  https://localhost:3000/*

        const baseLogout = `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/logout`;
        const kcLogout = new URL(baseLogout);
        kcLogout.searchParams.set("client_id", env.KEYCLOAK_CLIENT_ID);
        kcLogout.searchParams.set("post_logout_redirect_uri", postLogout);

        // ✅ Build the single response we actually return:
        const res = NextResponse.redirect(kcLogout);

        // ✅ Clear cookies on the returned response (match path)
        // ✅ Delete cookies safely (Next.js 14+ compatible)
        res.cookies.set({
            name: "sid",
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        });

        res.cookies.set({
            name: "pkce_verifier",
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        });

        console.log(`🗑️ Cleared session cookie + Redis sid:${sid}`);

        console.log(`🗑️ Deleted session cookie + Redis sid:${sid}`);

        return res;
    } catch (err) {
        console.error("❌ Logout failed:", err);
        return NextResponse.json({ error: "Logout failed" }, { status: 500 });
    }
}