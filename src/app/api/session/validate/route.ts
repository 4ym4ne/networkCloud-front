// src/app/api/session/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession, destroySession } from "@/server/session";
import { SID_COOKIE } from "@/lib/cookies";

/**
 * POST /api/session/validate
 * Used by middleware or frontend to verify if sid cookie is still valid
 */
export async function POST(req: NextRequest) {
    try {
        const sid = req.cookies.get(SID_COOKIE)?.value;
        if (!sid) {
            return NextResponse.json({ valid: false, expired: false });
        }

        const session = await getSession(sid);
        if (!session) {
            console.warn("⚠️ Invalid session ID:", sid);
            return NextResponse.json({ valid: false, expired: false });
        }

        const expired = Date.now() > session.expires_at;
        console.log(
            `🧩 Session validation — sid: ${sid}, user: ${session.username}, expired: ${expired}`
        );

        return NextResponse.json({ valid: !expired, expired });
    } catch (err) {
        console.error("❌ Session validation error:", err);
        return NextResponse.json({ valid: false, expired: false });
    }
}

export async function GET(req: NextRequest) {
    try {
        const sid = req.cookies.get(SID_COOKIE)?.value;
        if (!sid) return NextResponse.json({ valid: false });

        const session = await getSession(sid);
        if (!session || !session.expires_at || Date.now() >= session.expires_at) {
            // cleanup stale session
            try {
                await destroySession(sid);
            } catch (e) {
                // ignore
            }
            return NextResponse.json({ valid: false });
        }

        return NextResponse.json({
            valid: true,
            expires_at: session.expires_at,
            username: session.username,
        });
    } catch (err) {
        console.error("/api/session/validate error:", err);
        return NextResponse.json({ valid: false }, { status: 500 });
    }
}
