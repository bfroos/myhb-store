/**
 * Strapi Preview Route Handler for Nuxt
 *
 * CRITICAL: We use BOTH cookie AND URL query parameter for preview mode.
 * - Cookie: For initial page load from Strapi (SameSite=none works here)
 * - URL param: For soft-reloads within the iframe (cookies not sent cross-domain)
 *
 * The frontend plugin extracts ?__preview=1 from URL and adds it back when refreshing.
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

  // Set preview mode cookie
  // sameSite: 'none' + secure: true is required so the cookie is sent when the
  // page is loaded inside Strapi's cross-origin preview iframe.
  setCookie(event, '__NUXT_PREVIEW', 'true', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: false,
    secure: true,
    sameSite: 'none',
  });

  // Store the preview status (server-side only, httpOnly is fine)
  setCookie(event, '__NUXT_PREVIEW_STATUS', status || 'draft', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  // Add preview mode as URL query parameter so soft-reloads within iframe preserve it
  const targetUrl = new URL(url, 'https://www.myhealthandbeauty.com');
  targetUrl.searchParams.set('__preview', '1');
  
  // Redirect to the preview URL with query param
  return sendRedirect(event, targetUrl.toString());
});
