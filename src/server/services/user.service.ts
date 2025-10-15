import { findUserBySid } from "@/server/repositories/session.repository";
import type { User } from "@/server/models/user.model";

/**
 * Business logic for user identity
 */
export async function getAuthenticatedUser(sid?: string): Promise<User | null> {
    if (!sid) return null;

    const user = await findUserBySid(sid);
    if (!user) return null;

    // Example of future enrichment (fetch org data, OPA, etc.)
    // user.permissions = await opa.checkRoles(user.roles);

    return user;
}