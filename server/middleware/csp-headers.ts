/**
 * CSP Headers Middleware for Strapi Preview
 *
 * Only sets the frame-ancestors directive (to allow Strapi to embed the frontend
 * in an iframe) without adding any other restrictive CSP rules that would block
 * normal tracking scripts (Cookiebot, Facebook Pixel, TikTok, etc.).
 *
 * Full CSP hardening should be done in nuxt.config.ts routeRules if needed.
 */

export default defineEventHandler((event) => {
  const strapiUrl = process.env.NUXT_PUBLIC_STRAPI_URL || 'https://striking-bear-e5a15ddc94.strapiapp.com';

  // Only set frame-ancestors — this is what allows Strapi to embed us in an iframe.
  // Do NOT set a full CSP here; that would block all tracking/analytics scripts
  // that are legitimately loaded on the frontend (Cookiebot, FB Pixel, etc.).
  setHeader(
    event,
    'Content-Security-Policy',
    `frame-ancestors 'self' ${strapiUrl} https://*.strapiapp.com`,
  );
});
