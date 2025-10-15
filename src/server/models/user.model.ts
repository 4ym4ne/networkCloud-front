/**
 * User domain model (server-side)
 * Mirrors what we store in Redis session + enrich if needed
 */
export interface User {
    sub: string;
    username: string;
    email?: string;
    roles: string[];
    expiresAt: number;
}
