/**
 * CSP Headers Middleware for Strapi Preview
 * Allows the frontend to be embedded in iframes from Strapi admin
 */

export default defineEventHandler((event) => {
  // Get the Strapi backend URL from environment
  const strapiUrl = process.env.NUXT_PUBLIC_STRAPI_URL || 'https://striking-bear-e5a15ddc94.strapiapp.com';

  // Set CSP header to allow iframe embedding from Strapi admin
  setHeader(event, 'Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' ${strapiUrl} https://engine.myhealthandbeauty.com https://assets.calendly.com;
    style-src 'self' 'unsafe-inline' https://assets.calendly.com;
    img-src 'self' data: https:;
    font-src 'self' data: https:;
    connect-src 'self' https:;
    media-src 'self' https://media.myhealthandbeauty.app https:;
    frame-src 'self' https://calendly.com https://*.calendly.com;
    frame-ancestors 'self' ${strapiUrl};
    base-uri 'self';
    form-action 'self';
  `.replace(/\n/g, ' ').trim());
});
