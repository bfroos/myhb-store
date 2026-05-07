/**
 * Strapi Preview Route Handler for Nuxt
 * Validates the preview secret and enables preview mode
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
  // httpOnly: false on the client-visible flag so the live-preview plugin can
  // read it; the secret itself is validated server-side above.
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

  // Redirect to the preview URL
  return sendRedirect(event, url);
});
