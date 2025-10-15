// src/app/api/session/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/session";

/**
 * POST /api/session/validate
 * Used by middleware or frontend to verify if sid cookie is still valid
 */
export async function POST(req: NextRequest) {
    try {
        const sid = req.cookies.get("sid")?.value;
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