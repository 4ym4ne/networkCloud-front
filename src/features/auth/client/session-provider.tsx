"use client";

import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    SessionProvider as NextAuthSessionProvider,
    signIn,
    signOut,
    useSession as useNextAuthSession,
} from "next-auth/react";
import { CSRF_COOKIE } from "@/core/security/cookies";
import { logger } from "@/core/logging/logger";
import type { UserProfile } from "@/features/auth/shared/user-profile";
import { buildUserProfile } from "@/features/auth/shared/user-profile";

export type SessionUser = UserProfile;

export type SessionContextValue = {
    user: SessionUser | null;
    loading: boolean;
    error: string | null;
    accessToken: string | null;
    refresh: () => Promise<void>;
    login: (redirect?: string) => void;
    logout: () => void;
    loginInProgress: boolean;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

function coerceCallbackUrl(redirect?: string): string | undefined {
    if (!redirect) return undefined;
    if (redirect.startsWith("/")) return redirect;
    try {
        const url = new URL(redirect);
        return url.pathname + url.search + url.hash;
    } catch {
        return undefined;
    }
}

function setCsrfCookie(value?: string | null) {
    if (typeof document === "undefined") return;
    const base = `${CSRF_COOKIE}=`;
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    if (value) {
        document.cookie = `${base}${value}; Path=/; SameSite=Strict${secure}`;
    } else {
        document.cookie = `${base}; Path=/; SameSite=Strict${secure}; Max-Age=0`;
    }
}

function InternalSessionProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status, update } = useNextAuthSession();
    const [loginInProgress, setLoginInProgress] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loginGuardRef = useRef(false);

    useEffect(() => {
        if (session?.csrfToken) {
            setCsrfCookie(session.csrfToken);
        } else {
            setCsrfCookie(null);
        }
    }, [session?.csrfToken]);

    useEffect(() => {
        if (session?.error) {
            setError(session.error);
        } else {
            setError(null);
        }
    }, [session?.error]);

    const login = useCallback(
        (redirect?: string) => {
            if (loginGuardRef.current) return;
            loginGuardRef.current = true;
            setLoginInProgress(true);
            setError(null);

            const callbackUrl =
                coerceCallbackUrl(redirect) ??
                (typeof window !== "undefined"
                    ? window.location.pathname + window.location.search + window.location.hash
                    : undefined);

            signIn("keycloak", callbackUrl ? { callbackUrl } : undefined)
                .catch((err) => {
                    logger.error("SessionProvider.login failed", err);
                    setError(err instanceof Error ? err.message : String(err));
                })
                .finally(() => {
                    loginGuardRef.current = false;
                    setLoginInProgress(false);
                });
        },
        []
    );

    const logout = useCallback(() => {
        signOut({ callbackUrl: "/" }).catch((err) => {
            logger.error("SessionProvider.logout failed", err);
            setError(err instanceof Error ? err.message : String(err));
        });
    }, []);

    const refresh = useCallback(async () => {
        try {
            await update();
        } catch (err) {
            logger.error("SessionProvider.refresh failed", err);
            setError(err instanceof Error ? err.message : String(err));
        }
    }, [update]);

    const user = useMemo<SessionUser | null>(() => {
        if (session?.userProfile) return session.userProfile;
        if (session?.user) {
            return buildUserProfile({
                sub: session.user.sub,
                preferredUsername: session.user.username ?? session.user.name,
                email: session.user.email,
                roles: session.user.roles,
                avatarUrl: session.user.image,
            });
        }
        return null;
    }, [session?.userProfile, session?.user]);

    const value = useMemo<SessionContextValue>(
        () => ({
            user,
            loading: status === "loading",
            error,
            accessToken: session?.accessToken ?? null,
            refresh,
            login,
            logout,
            loginInProgress: loginInProgress || status === "loading",
        }),
        [user, status, error, session?.accessToken, refresh, login, logout, loginInProgress]
    );

    return (
        <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
    );
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextAuthSessionProvider>
            <InternalSessionProvider>{children}</InternalSessionProvider>
        </NextAuthSessionProvider>
    );
}

export function useSessionContext() {
    const ctx = React.useContext(SessionContext);
    if (!ctx) throw new Error("useSessionContext must be used within SessionProvider");
    return ctx;
}
