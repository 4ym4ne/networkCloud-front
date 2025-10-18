import crypto from "crypto";

/**
 * Generates a secure random CSRF token.
 */
export function generateCsrfToken(): string {
    return crypto.randomBytes(32).toString("base64url");
}

/**
 * Timing-safe compare helper for CSRF tokens.
 * - Enforces a minimum token length to reject trivial values.
 * - Uses crypto.timingSafeEqual to avoid timing attacks.
 */
export function validateCsrfToken(cookieToken?: string | undefined, headerToken?: string | null): boolean {
    const MIN_TOKEN_LENGTH = 16;
    if (!cookieToken || !headerToken) return false;
    if (cookieToken.length < MIN_TOKEN_LENGTH || headerToken.length < MIN_TOKEN_LENGTH) return false;

    const a = Buffer.from(cookieToken, "utf8");
    const b = Buffer.from(headerToken, "utf8");

    // If lengths differ, compare against zero-padded buffers to avoid leaking length via timing.
    if (a.length !== b.length) {
        const max = Math.max(a.length, b.length);
        const A = Buffer.alloc(max);
        const B = Buffer.alloc(max);
        a.copy(A);
        b.copy(B);
        return crypto.timingSafeEqual(A, B);
    }

    return crypto.timingSafeEqual(a, b);
}
