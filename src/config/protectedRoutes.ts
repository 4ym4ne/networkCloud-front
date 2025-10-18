// ...new file...
/**
 * Configurable list of protected routes.
 * Each entry supports simple patterns:
 * - Exact path:    "/account/settings"
 * - Prefix match:  "/dashboard" (matches "/dashboard" and "/dashboard/..." )
 * - Wildcard suffix:'/admin/*' (equivalent to prefix match for '/admin')
 * - Special '*' matches all routes
 *
 * Keep this list small and explicit. Use a prefix-style approach for clarity.
 */
export const protectedRoutes: string[] = [
  // Example: require auth for everything under /dashboard
  "/dashboard",
  // Add other protected prefixes here:
  // "/account",
  // "/admin",
];

export function isProtectedPath(pathname: string): boolean {
  if (!pathname) return false;
  // Normalize trailing slash for matching
  const p = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  for (const route of protectedRoutes) {
    if (route === "*") return true;
    if (route.endsWith("/*")) {
      const prefix = route.slice(0, -2);
      if (p === prefix || p.startsWith(prefix + "/")) return true;
    } else {
      // treat as prefix match (so "/dashboard" matches "/dashboard" and "/dashboard/..." )
      if (p === route || p.startsWith(route + "/")) return true;
    }
  }

  return false;
}

