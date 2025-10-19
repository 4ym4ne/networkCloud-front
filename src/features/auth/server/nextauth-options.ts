import crypto from "crypto";
import KeycloakProvider from "next-auth/providers/keycloak";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { envServer as env } from "@/core/config/env.server";
import { auditAuthEvent } from "@/server/audit";
import { logger } from "@/core/logging/logger";
import { buildUserProfile } from "@/features/auth/shared/user-profile";
import type { UserProfile } from "@/features/auth/shared/user-profile";

const issuer = `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}`;
const tokenEndpoint = `${issuer}/protocol/openid-connect/token`;
const logoutEndpoint = `${issuer}/protocol/openid-connect/logout`;

type ExtendedToken = JWT & {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    idToken?: string;
    roles?: string[];
    username?: string;
    csrfToken?: string;
    error?: string;
    email?: string;
    userProfile?: UserProfile;
};

function extractRoles(profile: Record<string, any> | undefined): string[] {
    if (!profile) return [];
    const realmRoles = profile.realm_access?.roles;
    if (Array.isArray(realmRoles)) return realmRoles;
    const resourceRoles = profile.resource_access;
    if (resourceRoles && typeof resourceRoles === "object") {
        const all = Object.values(resourceRoles)
            .flatMap((entry) => (entry && Array.isArray(entry.roles) ? entry.roles : []))
            .filter((role): role is string => typeof role === "string");
        return all;
    }
    return [];
}

async function refreshAccessToken(token: ExtendedToken): Promise<ExtendedToken> {
    try {
        if (!token.refreshToken) {
            throw new Error("Missing refresh token");
        }

        const params = new URLSearchParams({
            client_id: env.KEYCLOAK_CLIENT_ID,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken,
        });

        if (env.KEYCLOAK_CLIENT_SECRET) {
            params.set("client_secret", env.KEYCLOAK_CLIENT_SECRET);
        }

        const response = await fetch(tokenEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Refresh token endpoint error (${response.status}): ${text}`);
        }

        const refreshed = await response.json();

        const expiresIn = refreshed.expires_in ?? 3600;
        const next: ExtendedToken = {
            ...token,
            accessToken: refreshed.access_token ?? token.accessToken,
            refreshToken: refreshed.refresh_token ?? token.refreshToken,
            idToken: refreshed.id_token ?? token.idToken,
            expiresAt: Date.now() + expiresIn * 1000,
            error: undefined,
        };

        await auditAuthEvent({
            type: "refresh_success",
            sub: token.sub as string | undefined,
            username: token.username as string | undefined,
            outcome: "ok",
        });

        return next;
    } catch (err) {
        logger.error("refreshAccessToken error:", err);

        await auditAuthEvent({
            type: "refresh_failure",
            sub: token.sub as string | undefined,
            username: token.username as string | undefined,
            outcome: "failed",
            reason: "token_refresh_failed",
            meta: { message: err instanceof Error ? err.message : String(err) },
        });

        return {
            ...token,
            error: "RefreshAccessTokenError",
            expiresAt: Date.now() - 60_000,
        };
    }
}

async function triggerKeycloakLogout(token: ExtendedToken) {
    if (!token.idToken) return;
    try {
        const params = new URLSearchParams({
            id_token_hint: token.idToken,
        });
        if (env.KEYCLOAK_CLIENT_ID) {
            params.set("client_id", env.KEYCLOAK_CLIENT_ID);
        }
        if (env.KEYCLOAK_CLIENT_SECRET) {
            params.set("client_secret", env.KEYCLOAK_CLIENT_SECRET);
        }
        await fetch(logoutEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
        });
    } catch (err) {
        logger.warn("Keycloak logout request failed:", err);
        await auditAuthEvent({
            type: "token_revocation_failed",
            sub: token.sub as string | undefined,
            username: token.username as string | undefined,
            outcome: "failed",
            reason: "keycloak_logout_failed",
            meta: { message: err instanceof Error ? err.message : String(err) },
        });
    }
}

export const authOptions: NextAuthOptions = {
    secret: env.SESSION_SECRET,
    session: {
        strategy: "jwt",
        maxAge: env.SESSION_TTL,
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        KeycloakProvider({
            clientId: env.KEYCLOAK_CLIENT_ID,
            clientSecret: env.KEYCLOAK_CLIENT_SECRET ?? "",
            issuer,
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            const extended = token as ExtendedToken;

            if (account && profile) {
                if (!account.access_token) {
                    logger.error("Keycloak account missing access_token");
                    await auditAuthEvent({
                        type: "login_failure",
                        sub: profile.sub as string | undefined,
                        username: (profile as any)?.preferred_username ?? undefined,
                        outcome: "failed",
                        reason: "missing_access_token",
                    });
                    throw new Error("Missing access token from Keycloak");
                }

                const expiresAt =
                    account.expires_at !== undefined
                        ? account.expires_at * 1000
                        : Date.now() + ((account as any).expires_in ?? 3600) * 1000;

                const roles = extractRoles(profile as Record<string, any>);
                const userProfile = buildUserProfile({
                    sub: (profile as any)?.sub ?? account.providerAccountId,
                    preferredUsername: (profile as any)?.preferred_username ?? (profile as any)?.preferredUsername,
                    email: (profile as any)?.email,
                    name: profile.name,
                    displayName: (profile as any)?.display_name,
                    roles,
                    avatarUrl: (profile as any)?.picture,
                    locale: (profile as any)?.locale,
                    fallbackId: account.providerAccountId,
                });

                const csrfToken = crypto.randomBytes(32).toString("base64url");

                return {
                    ...extended,
                    sub: userProfile.sub ?? extended.sub ?? account.providerAccountId,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token ?? extended.refreshToken,
                    idToken: account.id_token ?? extended.idToken,
                    expiresAt,
                    roles: userProfile.roles,
                    username: userProfile.username,
                    email: userProfile.email ?? extended.email,
                    csrfToken,
                    userProfile,
                    error: undefined,
                };
            }

            if (!extended.expiresAt || Date.now() < extended.expiresAt - 60_000) {
                return extended;
            }

            return refreshAccessToken(extended);
        },
        async session({ session, token }) {
            const extended = token as ExtendedToken;

            const profile = extended.userProfile
                ?? buildUserProfile({
                    sub: extended.sub as string | undefined,
                    preferredUsername: extended.username,
                    email: extended.email as string | undefined,
                    roles: extended.roles,
                });

            session.userProfile = profile;
            session.user = {
                ...(session.user ?? {}),
                sub: profile.sub,
                username: profile.username,
                roles: profile.roles,
                email: profile.email ?? session.user?.email,
                name: session.user?.name ?? profile.username,
                image: session.user?.image ?? profile.avatarUrl,
            };
            session.accessToken = extended.accessToken;
            session.refreshToken = extended.refreshToken;
            session.expiresAt = extended.expiresAt;
            session.csrfToken = extended.csrfToken;
            session.idToken = extended.idToken;
            session.error = extended.error;

            return session;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            try {
                const target = new URL(url);
                if (target.origin === baseUrl) return url;
            } catch (err) {
                logger.warn("Invalid redirect URL detected:", err);
            }
            return baseUrl;
        },
    },
    events: {
        async signIn(message) {
            await auditAuthEvent({
                type: "login_success",
                sub: message?.user?.id ?? (message?.profile as any)?.sub,
                username:
                    (message?.profile as any)?.preferred_username ??
                    message?.user?.name ??
                    message?.user?.email ??
                    undefined,
                outcome: "ok",
            });
        },
        async signOut(message) {
            const token = message.token as ExtendedToken | undefined;
            if (token) {
                await triggerKeycloakLogout(token);
                await auditAuthEvent({
                    type: "logout",
                    sub: token.sub as string | undefined,
                    username: token.username,
                    outcome: "ok",
                });
            }
        },
        async error(message) {
            logger.error("NextAuth error event:", message);
        },
    },
};
