// **__ Utility to decode and check roles from a JWT access token __**

export interface TokenPayload {
    exp: number;
    iat: number;
    email?: string;
    preferred_username?: string;
    realm_access?: { roles: string[] };
    resource_access?: Record<string, { roles: string[] }>;
    [key: string]: unknown;
}

// **__ Safely decode JWT payload (no verification, just decode) __**
export function decodeJwt(token: string): TokenPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        return JSON.parse(Buffer.from(parts[1], "base64").toString());
    } catch {
        return null;
    }
}

// **__ Check if the user has at least one of the required roles __**
export function hasRole(
    token: string | null,
    required: string[],
    clientId?: string
): boolean {
    if (!token) return false;
    const payload = decodeJwt(token);
    if (!payload) return false;

    // Combine realm + client roles
    const realmRoles = payload.realm_access?.roles ?? [];
    const clientRoles = clientId
        ? payload.resource_access?.[clientId]?.roles ?? []
        : [];

    const allRoles = new Set([...realmRoles, ...clientRoles]);
    return required.some((r) => allRoles.has(r));
}
