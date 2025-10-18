/**
 * Configurable protected routes with optional role requirements.
 * Each entry can be either:
 * - string: a path prefix (e.g. '/dashboard')
 * - object: { path: '/admin', roles: ['admin'] }
 *
 * Matching is prefix-based: '/admin' matches '/admin' and '/admin/...'
 */
export type ProtectedRouteRule =
  | string
  | {
      path: string;
      roles?: string[]; // if present, user must have at least one of these roles
    };

export const protectedRoutes: ProtectedRouteRule[] = [
  // Example: require auth for everything under /dashboard (no specific role)
  "/dashboard",
  // Example: require `admin` role for /admin
  { path: "/admin", roles: ["admin"] },
];

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
