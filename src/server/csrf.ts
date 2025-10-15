import crypto from "crypto";

/**
 * Generates a secure random CSRF token.
 */
export function generateCsrfToken(): string {
    return crypto.randomBytes(32).toString("base64url");
}

/**
 * Validates CSRF token pair (cookie + header).
 */
export function validateCsrfToken(cookieToken?: string, headerToken?: string): boolean {
    return !!cookieToken && !!headerToken && cookieToken === headerToken;
}
