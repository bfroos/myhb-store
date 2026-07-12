/**
 * Trailing-slash canonicalization (SEO audit 2026-07)
 *
 * /pfad/ and /pfad both resolved with HTTP 200 → duplicate content.
 * This middleware 301-redirects any path with trailing slash(es) to the
 * non-slash form, preserving the query string. Root "/" is excluded.
 *
 * Filename starts with "1." so Nitro runs it before the other middleware
 * (alphabetical order): the canonical URL then flows through redirects.ts.
 */
export default defineEventHandler((event) => {
  const method = event.method || "GET";
  if (method !== "GET" && method !== "HEAD") return;

  const { pathname, search } = getRequestURL(event);
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const target = pathname.replace(/\/+$/, "") || "/";
    return sendRedirect(event, `${target}${search || ""}`, 301);
  }
});
