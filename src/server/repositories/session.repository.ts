import { getSession } from "@/server/session";
import type { User } from "@/server/models/user.model";

/**
 * Repository for fetching session data from Redis
 */
export async function findUserBySid(sid: string): Promise<User | null> {
    const session = await getSession(sid);
    if (!session) return null;

    return {
        sub: session.sub,
        username: session.username,
        roles: session.roles ?? [],
        expiresAt: session.expires_at,
    };
}
