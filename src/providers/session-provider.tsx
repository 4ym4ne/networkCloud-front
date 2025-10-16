"use client";

import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";

export type SessionUser = {
    sub?: string;
    username: string;
    email?: string;
    roles?: string[];
    avatarUrl?: string;
};

export type SessionContextValue = {
    user: SessionUser | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    login: (redirect?: string) => void;
    logout: () => void;
    loginInProgress: boolean;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

// Module-level dedupe/cache so multiple mounts or re-renders don't re-fetch session.
let sharedSessionPromise: Promise<void> | null = null;
let sharedSessionLoaded = false;

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<SessionUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [loginInProgress, setLoginInProgress] = useState(false);

    const loginGuardRef = useRef(false);
    const mountedRef = useRef(false);

    const fetchSession = useCallback(async (opts?: { force?: boolean }) => {
        // If already loaded and not forced, skip
        if (sharedSessionLoaded && !opts?.force) return;

        // If there's an in-flight shared promise and not forcing, wait for it
        if (sharedSessionPromise && !opts?.force) {
            await sharedSessionPromise;
            return;
        }

        // Create a shared promise so concurrent mounts reuse the same request
        sharedSessionPromise = (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await apiFetch("/api/session/validate", { method: "POST" });
                if (!res.ok) {
                    setUser(null);
                    return;
                }
                const data = await res.json();
                if (!data?.valid) {
                    setUser(null);
                    return;
                }

                const userRes = await apiFetch("/api/session/user", { method: "POST" });
                if (!userRes.ok) {
                    setUser(null);
                    return;
                }

                const userData = await userRes.json();
                setUser({
                    sub: userData.sub,
                    username: userData.username,
                    roles: userData.roles,
                    avatarUrl: userData.avatarUrl,
                    email: userData.email,
                });

                sharedSessionLoaded = true;
            } catch (err: any) {
                console.error("SessionProvider: failed to load session", err);
                setError(err?.message ?? String(err ?? "Unknown error"));
                setUser(null);
            } finally {
                setLoading(false);
                sharedSessionPromise = null;
            }
        })();

        await sharedSessionPromise;
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        void fetchSession();
        return () => {
            mountedRef.current = false;
        };
    }, [fetchSession]);

    const refresh = useCallback(async () => {
        await fetchSession();
    }, [fetchSession]);

    const login = useCallback((redirect?: string) => {
        if (loginGuardRef.current) return;
        loginGuardRef.current = true;
        setLoginInProgress(true);

        const url = new URL("/login", window.location.origin);
        if (redirect) url.searchParams.set("redirect", redirect);
        try {
            const pushFn = router.push as unknown as (...args: any[]) => Promise<any> | void;
            const result = pushFn(url.toString());
            if (result && typeof (result as Promise<any>).finally === "function") {
                (result as Promise<any>).finally(() => {
                    loginGuardRef.current = false;
                    setLoginInProgress(false);
                });
            } else {
                setTimeout(() => {
                    loginGuardRef.current = false;
                    setLoginInProgress(false);
                }, 5000);
            }
        } catch (err) {
            console.error("SessionProvider.login failed", err);
            loginGuardRef.current = false;
            setLoginInProgress(false);
        }
    }, [router]);

    const logout = useCallback(() => {
        setUser(null);
        // Use a full navigation so the browser performs a top-level request and
        // applies Set-Cookie headers reliably. Client-side router.push can
        // trigger fetch-based navigations which may call the route handler
        // twice (one internal fetch + the final navigation) and cause confusing
        // logs where the sid appears undefined on the second invocation.
        if (typeof window !== "undefined") {
            window.location.href = "/logout";
        } else {
            // Fallback to router navigation in non-browser environments
            try {
                const pushFn = router.push as unknown as (...args: any[]) => Promise<any> | void;
                pushFn("/logout");
            } catch {
                /* ignore */
            }
        }
    }, [router]);

    const value = {
        user,
        loading,
        error,
        refresh,
        login,
        logout,
        loginInProgress,
    } as SessionContextValue;

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext() {
    const ctx = React.useContext(SessionContext);
    if (!ctx) throw new Error("useSessionContext must be used within SessionProvider");
    return ctx;
}
