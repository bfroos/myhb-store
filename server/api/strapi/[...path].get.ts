// Strapi proxy with server-side caching.
// CRITICAL: When __NUXT_PREVIEW cookie is set (via /api/preview route),
// all requests include status=draft and cache is bypassed.

function isPreviewRequest(event: any): boolean {
  const cookie = getCookie(event, '__NUXT_PREVIEW');
  return cookie === 'true';
}

function getPreviewStatus(event: any): 'draft' | 'published' {
  return getCookie(event, '__NUXT_PREVIEW_STATUS') === 'published'
    ? 'published'
    : 'draft';
}

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig(event);
    const incoming = getRequestURL(event);
    const siteMode = config.siteMode || config.public.siteMode;
    const preview = isPreviewRequest(event);
    const previewStatus = getPreviewStatus(event);

    setHeader(event, 'X-MyHB-Strapi-Proxy', '1');
    if (preview) {
      setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate');
      setHeader(event, 'Pragma', 'no-cache');
      setHeader(event, 'Expires', '0');
    }

    if (!config.public.strapiUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Strapi URL missing',
      });
    }

    const restPath = incoming.pathname.replace(/^\/api\/strapi/, '');
    const strapiBase = config.public.strapiUrl.replace(/\/+$/, '');

    const params = new URLSearchParams(incoming.search);
    if (preview) {
      params.set('status', previewStatus);
    }
    const search = params.toString() ? `?${params.toString()}` : '';

    const strapiUrl = `${strapiBase}/api${restPath}${search}`;

    try {
      return await $fetch(strapiUrl, {
        headers: {
          ...(siteMode ? { 'x-site-mode': siteMode } : {}),
          // Enable content source maps in preview mode for double-click-to-edit
          ...(preview ? { 'strapi-encode-source-maps': 'true' } : {}),
        },
      });
    } catch (error: any) {
      throw createError({
        statusCode: error?.statusCode || error?.status || 500,
        statusMessage:
          error?.statusMessage || error?.message || 'Strapi API error',
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 60 : 0,
    staleMaxAge: process.env.NODE_ENV === 'production' ? 240 : 0,
    getKey: (event) => {
      const url = getRequestURL(event);
      const path = url.pathname.replace(/^\/api\/strapi/, '');

      // Include preview status in cache key so draft/published are cached separately
      const isPreview = isPreviewRequest(event);
      const previewStatus = getPreviewStatus(event);
      const previewFlag = isPreview ? `:preview:${previewStatus}` : ':published';

      // Build query string
      let params = new URLSearchParams(url.search);
      if (isPreview) {
        params.set('status', previewStatus);
      }
      params.sort();

      const config = useRuntimeConfig(event);
      const siteMode = config.siteMode || config.public.siteMode || 'default';

      return `strapi:${path}:${params.toString()}:${siteMode}${previewFlag}`;
    },
    // Bypass cache entirely when in preview mode (get latest draft data)
    shouldBypassCache: (event) => isPreviewRequest(event),
    shouldInvalidateCache: (event) => false,
  },
);
