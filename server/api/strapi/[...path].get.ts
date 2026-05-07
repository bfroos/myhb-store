// Strapi proxy with server-side caching.
// CRITICAL: When __NUXT_PREVIEW cookie is set (via /api/preview route),
// all requests include status=draft and cache is bypassed.

function isPreviewRequest(event: any): boolean {
  const cookie = getCookie(event, '__NUXT_PREVIEW');
  return cookie === 'true';
}

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig(event);
    const incoming = getRequestURL(event);
    const siteMode = config.siteMode || config.public.siteMode;
    const preview = isPreviewRequest(event);

    setHeader(event, 'X-MyHB-Strapi-Proxy', '1');

    if (!config.public.strapiUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Strapi URL missing',
      });
    }

    const restPath = incoming.pathname.replace(/^\/api\/strapi/, '');
    const strapiBase = config.public.strapiUrl.replace(/\/+$/, '');

    // In preview mode, add status=draft so Strapi returns draft content
    let search = incoming.search;
    if (preview && !search.includes('status=')) {
      search = search ? `${search}&status=draft` : '?status=draft';
    }

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
      const previewFlag = isPreview ? ':preview' : ':published';

      // Build query string
      let params = new URLSearchParams(url.search);
      if (isPreview && !params.get('status')) {
        params.set('status', 'draft');
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
