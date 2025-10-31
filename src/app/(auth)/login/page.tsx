"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function sanitizeRedirect(value: string | null): string | undefined {
    if (!value) return undefined;
    if (value.startsWith("/")) return value;
    try {
        const origin = typeof window !== "undefined" ? window.location.origin : undefined;
        const url = origin ? new URL(value, origin) : new URL(value);
        if (!origin || url.origin === origin) {
            return url.pathname + url.search + url.hash;
        }
    } catch {
        /* ignore invalid URLs */
    }
    return "/";
}

function LoginPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { status } = useSession();
    const [initiated, setInitiated] = useState(false);

    const redirect = useMemo(
        () => sanitizeRedirect(searchParams.get("redirect")),
        [searchParams]
    );

    useEffect(() => {
        if (status === "authenticated") {
            router.replace(redirect ?? "/");
            return;
        }

        if (status === "loading" || initiated) return;

        signIn("keycloak", redirect ? { callbackUrl: redirect } : undefined).catch(
            () => setInitiated(false)
        );
        setInitiated(true);
    }, [status, redirect, initiated, router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-card px-8 py-10 shadow-lg">
                <h1 className="text-2xl font-semibold">Redirecting to Keycloak…</h1>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                    If nothing happens, click the button below to continue to the secure sign-in.
                </p>
                <Button
                    onClick={() =>
                        signIn("keycloak", redirect ? { callbackUrl: redirect } : undefined)
                    }
                    disabled={status === "loading"}
                >
                    Continue to Login
                </Button>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen items-center justify-center">
                    <div className="flex flex-col items-center gap-4 rounded-lg border bg-card px-8 py-10 shadow-lg">
                        <h1 className="text-xl font-semibold">Preparing sign-in…</h1>
                        <p className="text-sm text-muted-foreground text-center max-w-xs">
                            Loading your session. If this message persists, refresh the page.
                        </p>
                    </div>
                </div>
            }
        >
            <LoginPageContent />
        </Suspense>
    );
}
