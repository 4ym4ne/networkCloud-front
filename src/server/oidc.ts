// src/server/oidc.ts
// **__ OIDC (Keycloak) client configuration — production-safe __**

import { discovery } from "openid-client";
import crypto from "crypto";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { envServer as env } from "@/config/env.server";
import { logger } from "@/lib/logger";

// ⚙️ DEV ONLY: allow self-signed HTTPS for localhost
if (process.env.NODE_ENV !== "production") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// Cache discovery/config and JWKS remote key fetchers
let keycloakConfigPromise: Promise<any> | null = null;
let jwksClientCache: { jwksUri?: string; jwks?: ReturnType<typeof createRemoteJWKSet> } = {};

export async function getKeycloakConfig() {
    if (!keycloakConfigPromise) {
        const issuerUrl = new URL(`${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}`);

        keycloakConfigPromise = discovery(issuerUrl, env.KEYCLOAK_CLIENT_ID)
            .then((cfg) => {
                if (!cfg.serverMetadata().authorization_endpoint) {
                    throw new Error("OIDC discovery missing authorization_endpoint");
                }
                return cfg;
            })
            .catch((err) => {
                logger.error("❌ Failed to discover Keycloak configuration:", err);
                throw err;
            });
    }

    return await keycloakConfigPromise;
}

function getRemoteJwks(jwksUri?: string) {
    if (!jwksUri) return undefined;
    if (jwksClientCache.jwks && jwksClientCache.jwksUri === jwksUri) return jwksClientCache.jwks;
    const jwks = createRemoteJWKSet(new URL(jwksUri));
    jwksClientCache = { jwksUri, jwks };
    return jwks;
}

// PKCE + state/nonce helpers
export function createPkceSession() {
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest().toString("base64url");
    const state = crypto.randomBytes(16).toString("base64url");
    const nonce = crypto.randomBytes(16).toString("base64url");
    const ttl = 300; // seconds
    return { codeVerifier, codeChallenge, state, nonce, ttl };
}

export async function buildAuthorizationUrl(codeChallenge: string, state?: string, nonce?: string) {
    const cfg = await getKeycloakConfig();

    const params = new URLSearchParams({
        client_id: env.KEYCLOAK_CLIENT_ID,
        response_type: "code",
        scope: "openid profile email",
        redirect_uri: env.OIDC_REDIRECT_URI,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
    });

    if (state) params.set("state", state);
    if (nonce) params.set("nonce", nonce);

    const baseUrl = cfg.serverMetadata().authorization_endpoint ?? `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/auth`;
    return `${baseUrl}?${params.toString()}`;
}

async function validateIdToken(idToken: string | undefined, cfg: any, expectedNonce?: string) {
    if (!idToken) return null;
    const jwksUri = cfg.serverMetadata().jwks_uri ?? cfg.serverMetadata().jwks_uri;
    const jwks = getRemoteJwks(jwksUri);
    if (!jwks) throw new Error("JWKS URI not available for id_token verification");

    const { payload } = await jwtVerify(idToken, jwks, {
        issuer: cfg.serverMetadata().issuer ?? `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}`,
        audience: env.KEYCLOAK_CLIENT_ID,
        clockTolerance: 5, // seconds
    });

    // check nonce
    if (expectedNonce && payload.nonce !== expectedNonce) {
        throw new Error("Invalid nonce in id_token");
    }

    return payload;
}

export async function exchangeCodeForTokens(code: string, codeVerifier: string, state?: string, nonce?: string) {
    const cfg = await getKeycloakConfig();
    const tokenEndpoint = cfg.serverMetadata().token_endpoint ?? `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: env.KEYCLOAK_CLIENT_ID,
        redirect_uri: env.OIDC_REDIRECT_URI,
        code,
        code_verifier: codeVerifier,
    });

    if (env.KEYCLOAK_CLIENT_SECRET) body.set("client_secret", env.KEYCLOAK_CLIENT_SECRET);

    const resp = await fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Token endpoint error (${resp.status}): ${text}`);
    }

    const tokens = await resp.json();

    // validate id_token if present
    const idTokenClaims = await validateIdToken(tokens.id_token, cfg, nonce).catch((err) => {
        throw new Error(`ID Token validation failed: ${err instanceof Error ? err.message : String(err)}`);
    });

    return { tokens, idTokenClaims };
}

export async function refreshToken(refreshTokenValue: string) {
    const cfg = await getKeycloakConfig();
    const tokenEndpoint = cfg.serverMetadata().token_endpoint ?? `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: env.KEYCLOAK_CLIENT_ID,
        refresh_token: refreshTokenValue,
    });

    if (env.KEYCLOAK_CLIENT_SECRET) body.set("client_secret", env.KEYCLOAK_CLIENT_SECRET);

    const resp = await fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Refresh token endpoint error (${resp.status}): ${text}`);
    }

    const tokens = await resp.json();

    // If there is an id_token (some providers rotate it on refresh), validate it (no nonce available here)
    const idTokenClaims = tokens.id_token ? await validateIdToken(tokens.id_token, cfg).catch((err) => {
        throw new Error(`ID Token validation failed on refresh: ${err instanceof Error ? err.message : String(err)}`);
    }) : null;

    return { tokens, idTokenClaims };
}
