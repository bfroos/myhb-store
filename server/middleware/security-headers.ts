/**
 * Security headers (SEO audit 2026-07)
 *
 * Adds the headers the audit found missing. Deliberately NOT setting:
 *  - Content-Security-Policy → handled in csp-headers.ts (Strapi Live Preview
 *    needs frame-ancestors with the Strapi origin; do not override it here).
 *  - X-Content-Type-Options → already set via routeRules in nuxt.config.ts.
 */
export default defineEventHandler((event) => {
  setHeader(
    event,
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  setHeader(event, "Referrer-Policy", "strict-origin-when-cross-origin");
  setHeader(
    event,
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
});
