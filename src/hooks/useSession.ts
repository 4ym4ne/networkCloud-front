"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";

export type SessionUser = {
    sub?: string;
    username: string;
    email?: string;
    roles?: string[];
    avatarUrl?: string;
};

/**
 * Client hook for session state.
 * - Uses the existing `apiFetch` helper so it stays consistent with CSRF handling.
 * - Returns user, loading, error and simple helpers (refresh/login/logout).
 */
export function useSession() {
    const router = useRouter();
    const [user, setUser] = useState<SessionUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSession = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError(null);

        try {
            const res = await apiFetch("/api/session/validate", { method: "POST", signal });
            if (!res.ok) {
                // treat as unauthenticated
                setUser(null);
                return;
            }

            const validated = await res.json();

            if (!validated?.valid) {
                setUser(null);
                return;
            }

            // fetch user details
            const userRes = await apiFetch("/api/session/user", { method: "POST", signal });
            if (!userRes.ok) {
                setUser(null);
                return;
            }

            const data = await userRes.json();
            const username = data.username ?? data.sub ?? "unknown";

            setUser({
                sub: data.sub,
                username: String(username),
                email: data.email,
                roles: data.roles,
                avatarUrl: data.avatarUrl,
            });
        } catch (err: any) {
            if (err?.name === "AbortError") return;
            console.error("useSession: failed to load session", err);
            setError(err?.message ?? String(err ?? "Unknown error"));
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchSession(controller.signal);
        return () => controller.abort();
    }, [fetchSession]);

    const refresh = useCallback(() => fetchSession(), [fetchSession]);

    const login = useCallback((redirect?: string) => {
        const url = new URL("/login", window.location.origin);
        if (redirect) url.searchParams.set("redirect", redirect);
        router.push(url.toString());
    }, [router]);

    const logout = useCallback(() => {
        router.push("/logout");
    }, [router]);

    return { user, loading, error, refresh, login, logout } as const;
}

