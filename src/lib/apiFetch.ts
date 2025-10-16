import { CSRF_COOKIE } from "@/lib/cookies";

function readCookie(name: string): string | undefined {
    if (typeof document === "undefined") return undefined;
    const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
    return match ? match.split("=")[1] : undefined;
}

export async function apiFetch(url: string, options: RequestInit = {}) {
    const csrfToken = readCookie(CSRF_COOKIE);

    // Merge headers in a safe way and ensure CSRF header is present
    const mergedHeaders: Record<string, string> = {};

    // copy existing headers from options (Headers, object, or undefined)
    if (options.headers instanceof Headers) {
        options.headers.forEach((v, k) => (mergedHeaders[k] = v));
    } else if (options.headers && typeof options.headers === "object") {
        Object.entries(options.headers as Record<string, string>).forEach(([k, v]) => {
            mergedHeaders[k] = v;
        });
    }

    if (csrfToken) mergedHeaders["x-csrf-token"] = csrfToken;

    const fetchOptions: RequestInit = {
        ...options,
        headers: mergedHeaders,
        // ensure cookies are sent for same-origin requests (session SID cookie)
        credentials: (options.credentials as RequestCredentials) ?? "same-origin",
    };

    return fetch(url, fetchOptions);
}