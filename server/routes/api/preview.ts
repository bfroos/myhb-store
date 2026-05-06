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
  setCookie(event, '__NUXT_PREVIEW', 'true', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: 'lax',
  });

  // Store the preview status
  setCookie(event, '__NUXT_PREVIEW_STATUS', status || 'draft', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: 'lax',
  });

  // Redirect to the preview URL
  return sendRedirect(event, url);
});
