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
  const status = query.status === 'published' ? 'published' : 'draft';

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

  // Ohne Bypass-Token sieht die Vorschau auf Vercel nur den ISR-Cache, und
  // ein Entwurf darf dort nie gerendert werden (server/utils/previewBypass.ts).
  // Lieber laut scheitern als eine Vorschau zeigen, die keine ist.
  const bypassToken = getPrerenderBypassToken();
  if (process.env.VERCEL && !bypassToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'VERCEL_BYPASS_TOKEN fehlt; ohne ihn kann die Vorschau den ISR-Cache nicht umgehen',
    });
  }

  // Vercel umgeht den ISR-Cache nur mit diesem Cookie und speichert das
  // Ergebnis dann auch nicht. httpOnly, weil es niemand im Browser lesen muss.
  if (bypassToken) {
    setCookie(event, PRERENDER_BYPASS_COOKIE, bypassToken, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      domain: '.myhealthandbeauty.com',
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

  // _preview_refresh steht seit TSEO-03 nicht mehr im Cache-Key und umgeht den
  // Cache nicht mehr; das erledigt das Bypass-Cookie. Der Parameter bleibt,
  // damit der Browser die Seite nicht aus seinem eigenen Cache nimmt.
  const redirectUrl = new URL(url, getRequestURL(event).origin);
  redirectUrl.searchParams.set('_preview_refresh', Date.now().toString());

  // Redirect to the preview URL
  return sendRedirect(
    event,
    `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`,
  );
});
