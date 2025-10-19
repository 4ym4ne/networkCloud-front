export interface UserProfile {
    sub: string;
    username: string;
    email?: string;
    roles: string[];
    avatarUrl?: string;
    locale?: string;
}

type MaybeString = string | null | undefined;

function normalizeString(value: MaybeString): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

function uniqueRoles(roles?: (string | null | undefined)[]): string[] {
    if (!roles) return [];
    const set = new Set<string>();
    for (const role of roles) {
        const normalized = role?.trim();
        if (normalized) set.add(normalized);
    }
    return Array.from(set);
}

export function buildUserProfile(input: {
    sub?: MaybeString;
    preferredUsername?: MaybeString;
    email?: MaybeString;
    name?: MaybeString;
    displayName?: MaybeString;
    roles?: (string | null | undefined)[];
    avatarUrl?: MaybeString;
    locale?: MaybeString;
    fallbackId?: string;
}): UserProfile {
    const sub = normalizeString(input.sub) ?? input.fallbackId ?? "unknown";
    const username =
        normalizeString(input.preferredUsername) ??
        normalizeString(input.displayName) ??
        normalizeString(input.name) ??
        normalizeString(input.email)?.split("@")[0] ??
        sub;

    return {
        sub,
        username,
        email: normalizeString(input.email),
        roles: uniqueRoles(input.roles),
        avatarUrl: normalizeString(input.avatarUrl),
        locale: normalizeString(input.locale),
    };
}

export function hasRole(profile: Pick<UserProfile, "roles">, role: string): boolean {
    return profile.roles.includes(role);
}

export function hasAnyRole(profile: Pick<UserProfile, "roles">, roles: string[]): boolean {
    return roles.some((role) => profile.roles.includes(role));
}

export function hasAllRoles(profile: Pick<UserProfile, "roles">, roles: string[]): boolean {
    return roles.every((role) => profile.roles.includes(role));
}

