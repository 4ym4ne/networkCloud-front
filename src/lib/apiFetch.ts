export async function apiFetch(url: string, options: RequestInit = {}) {
    const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf_token="))
        ?.split("=")[1];

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            "x-csrf-token": csrfToken ?? "",
        },
    });
}