// src/server/oidc.ts
// **__ OIDC (Keycloak) client configuration — production-safe __**

import { discovery } from "openid-client";
import crypto from "crypto";
import { envServer as env } from "@/config/env.server";

// ⚙️ DEV ONLY: allow self-signed HTTPS for localhost
if (process.env.NODE_ENV !== "production") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// **__ Cache the discovered OIDC configuration __**
let keycloakConfigPromise: Promise<any> | null = null;

export async function getKeycloakConfig() {
    if (!keycloakConfigPromise) {
        const issuerUrl = new URL(`${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}`);

        keycloakConfigPromise = discovery(issuerUrl, env.KEYCLOAK_CLIENT_ID)
            .then((cfg) => {
                // 🧠 Verify discovery object has what we expect
                if (!cfg.serverMetadata().authorization_endpoint) {
                    throw new Error("OIDC discovery missing authorization_endpoint");
                }
                return cfg;
            })
            .catch((err) => {
                console.error("❌ Failed to discover Keycloak configuration:", err);
                throw err;
            });
    }

    return await keycloakConfigPromise;
}

// **__ PKCE helpers (using native Node crypto) __**
export function createPkceSession() {
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto
        .createHash("sha256")
        .update(codeVerifier)
        .digest()
        .toString("base64url");

    return { codeVerifier, codeChallenge };
}

// New helper: compute code_challenge for an existing verifier
export function computeCodeChallenge(codeVerifier: string) {
    return crypto.createHash("sha256").update(codeVerifier).digest().toString("base64url");
}

// **__ Build authorization URL for redirecting user to Keycloak __**
export async function buildAuthorizationUrl(codeChallenge: string) {
    const cfg = await getKeycloakConfig();

    const params = new URLSearchParams({
        client_id: env.KEYCLOAK_CLIENT_ID,
        response_type: "code",
        scope: "openid profile email",
        redirect_uri: env.OIDC_REDIRECT_URI,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
    });

    // ✅ Ensure we always return an absolute URL
    const baseUrl = cfg.serverMetadata().authorization_endpoint ?? `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/auth`;
    return `${baseUrl}?${params.toString()}`;
}

// **__ Exchange authorization code for tokens __**
export async function exchangeCodeForTokens(code: string, codeVerifier: string) {
    const cfg = await getKeycloakConfig();

    const tokenResponse = await fetch(cfg.serverMetadata().token_endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: env.KEYCLOAK_CLIENT_ID,
            client_secret: env.KEYCLOAK_CLIENT_SECRET ?? "",
            redirect_uri: env.OIDC_REDIRECT_URI,
            code,
            code_verifier: codeVerifier,
        }),
    });

    if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        throw new Error(`Token request failed (${tokenResponse.status}): ${errText}`);
    }

    return tokenResponse.json();
}

// **__ Fetch user info from Keycloak using access token __**
export async function getUserInfo(accessToken: string) {
    const cfg = await getKeycloakConfig();
    const endpoint =
        cfg.serverMetadata().userinfo_endpoint ??
        `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;

    const response = await fetch(endpoint, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Userinfo request failed (${response.status}): ${errText}`);
    }

    return response.json();
}
