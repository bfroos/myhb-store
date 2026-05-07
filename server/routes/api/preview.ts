/**
 * Strapi Preview Route Handler
 * 
 * CRITICAL: This sets a SameSite=none cookie so that browsers will send it
 * even in cross-domain iframe contexts. This is the ONLY way to maintain
 * preview session across iframe-internal navigations.
 * 
 * The cookie domain is set to .myhealthandbeauty.com (with leading dot) so it's
 * sent for ALL subdomains and the root domain.
 * 
 * See: https://docs.strapi.io/cms/features/preview
 */

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const secret = query.secret as string;
  const url = query.url as string;
  const status = query.status as string;

  // Validate the secret
  const previewSecret = process.env.PREVIEW_SECRET;
  if (secret !== previewSecret) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid preview token',
    });
  }

  // Validate URL is provided
  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing URL parameter',
    });
  }

  // Set preview mode cookie with SameSite=none
  // This is CRITICAL for cross-domain iframe previews to work
  // Without SameSite=none, browsers won't send the cookie in iframe requests
  // Domain with leading dot (.myhealthandbeauty.com) is sent to ALL subdomains
  setCookie(event, '__NUXT_PREVIEW', 'true', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: false, // Must be false so client JS can read it
    secure: true,    // REQUIRED for SameSite=none to work
    sameSite: 'none', // REQUIRED for cross-domain iframe contexts
    path: '/',
    domain: '.myhealthandbeauty.com', // CRITICAL: With leading dot for all subdomains
  });

  // Also set the preview status (used for Strapi API queries)
  setCookie(event, '__NUXT_PREVIEW_STATUS', status || 'draft', {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    domain: '.myhealthandbeauty.com', // CRITICAL: With leading dot for all subdomains
  });

  // Redirect to the preview URL
  return sendRedirect(event, url);
});
