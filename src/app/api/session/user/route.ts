import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/services/user.service";
import { SID_COOKIE } from "@/lib/cookies";

export async function POST(req: NextRequest) {
    try {
        const sid = req.cookies.get(SID_COOKIE)?.value;
        const user = await getAuthenticatedUser(sid);

        if (!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        return NextResponse.json({
            sub: user.sub,
            username: user.username,
            roles: user.roles,
            expiresAt: user.expiresAt,
        });
    } catch (err) {
        console.error("❌ Failed to fetch user:", err);
        return NextResponse.json({error: "Internal error"}, {status: 500});
    }
}
