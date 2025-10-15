// src/app/api/session/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { envServer as env } from "@/config/env.server";
import { getSession, rotateSession, destroySession } from "@/server/session";

export async function POST(req: NextRequest) {
    try {
        const sid = req.cookies.get("sid")?.value;
        if (!sid) {
            return NextResponse.json({ error: "Missing session ID" }, { status: 401 });
        }

        const session = await getSession(sid);
        if (!session?.refresh_token) {
            console.warn(`⚠️ Invalid session ${sid} — missing refresh token`);
            await destroySession(sid);
            return NextResponse.json({ error: "No valid session" }, { status: 401 });
        }

        const tokenUrl = `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                client_id: env.KEYCLOAK_CLIENT_ID,
                client_secret: env.KEYCLOAK_CLIENT_SECRET ?? "",
                refresh_token: session.refresh_token,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("❌ Token refresh failed:", text);
            await destroySession(sid); // 💥 Clean up invalid sessions
            return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
        }

        const tokens = await response.json();

        const newSid = await rotateSession(sid, {
            sub: session.sub,
            username: session.username,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token ?? session.refresh_token,
            expires_at: Date.now() + (tokens.expires_in ?? 3600) * 1000,
            roles: session.roles,
        });

        console.log(`🔄 Session rotated for user ${session.username}: ${sid} → ${newSid}`);

        const res = NextResponse.json({ message: "Session refreshed" });
        res.cookies.set("sid", newSid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: env.SESSION_TTL,
        });

        return res;
    } catch (err) {
        console.error("❌ Unexpected refresh error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}