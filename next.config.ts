import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,

    // Only expose non-secret variables
    env: {
        KEYCLOAK_URL: process.env.KEYCLOAK_URL,
        KEYCLOAK_REALM: process.env.KEYCLOAK_REALM,
        KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
        OIDC_REDIRECT_URI: process.env.OIDC_REDIRECT_URI,
    },
};

export default nextConfig;
