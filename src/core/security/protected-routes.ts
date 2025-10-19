/**
 * Configurable protected routes with optional role requirements.
 * Each entry can be either:
 * - string: a path prefix (e.g. '/dashboard')
 * - object: { path: '/admin', roles: ['admin'] }
 *
 * Matching is prefix-based: '/admin' matches '/admin' and '/admin/...'
 */
export const accessPolicies = {
  AdminOnly: ["admin"],
  DefaultAuthenticated: [] as string[],
} as const;

export type AccessPolicyName = keyof typeof accessPolicies;

export type ProtectedRouteRule =
  | string
  | {
      path: string;
      policy?: AccessPolicyName;
      roles?: string[]; // optional override/additional roles
    };

export const protectedRoutes: ProtectedRouteRule[] = [
  // Example: require auth for everything under /dashboard (no specific role)
  { path: "/dashboard", policy: "DefaultAuthenticated" },
  // Example: require `admin` role for /admin
  { path: "/admin", policy: "AdminOnly" },
];

export function resolvePolicyRoles(rule: { policy?: AccessPolicyName; roles?: string[] } | undefined): string[] {
  const policyRoles = rule?.policy ? accessPolicies[rule.policy] ?? [] : [];
  const extraRoles = rule?.roles ?? [];
  return Array.from(new Set([...policyRoles, ...extraRoles]));
}

/**
 * Returns the matching protected route rule for a pathname, or null if none.
 */
export function getProtectedRule(pathname: string): ProtectedRouteRule | null {
  if (!pathname) return null;
  const p = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  for (const rule of protectedRoutes) {
    const route = typeof rule === "string" ? rule : rule.path;
    if (route === "*") return rule;
    if (route.endsWith("/*")) {
      const prefix = route.slice(0, -2);
      if (p === prefix || p.startsWith(prefix + "/")) return rule;
    } else {
      if (p === route || p.startsWith(route + "/")) return rule;
    }
  }

  return null;
}

export function isProtectedPath(pathname: string): boolean {
  return getProtectedRule(pathname) !== null;
}
