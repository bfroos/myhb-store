// Strapi proxy with server-side caching (1h fresh, 24h stale-while-revalidate).
// CRITICAL for preview: cache is COMPLETELY BYPASSED when __NUXT_PREVIEW=true
// This ensures live preview always gets fresh draft data, never stale cache.

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

    setHeader(event, "X-MyHB-Strapi-Proxy", "1");

    if (!config.public.strapiUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: "Strapi URL missing",
      });
    }

    const restPath = incoming.pathname.replace(/^\/api\/strapi/, "");
    const strapiBase = config.public.strapiUrl.replace(/\/+$/, "");

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
          // Enable content source maps in preview mode so Strapi
          // encodes field metadata for double-click-to-edit
          ...(preview ? { 'strapi-encode-source-maps': 'true' } : {}),
        },
      });
    } catch (error: any) {
      throw createError({
        statusCode: error?.statusCode || error?.status || 500,
        statusMessage:
          error?.statusMessage || error?.message || "Strapi API error",
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === "production" ? 60 : 0,
    staleMaxAge: process.env.NODE_ENV === "production" ? 240 : 0,
    getKey: (event) => {
      const url = getRequestURL(event);
      const path = url.pathname.replace(/^\/api\/strapi/, "");
      
      // CRITICAL: Include preview status in cache key
      // If __NUXT_PREVIEW=true, the cache key should reflect that
      const isPreview = getCookie(event, '__NUXT_PREVIEW') === 'true';
      const previewFlag = isPreview ? ':preview' : '';
      
      // Build query params (including status=draft if preview)
      let params = new URLSearchParams(url.search);
      if (isPreview && !params.get('status')) {
        params.set('status', 'draft');
      }
      params.sort();
      
      const config = useRuntimeConfig(event);
      const siteMode = config.siteMode || config.public.siteMode || "default";
      
      return `strapi:${path}:${params.toString()}:${siteMode}${previewFlag}`;
    },
    // Bypass cache entirely when in preview mode
    shouldBypassCache: (event) => isPreviewRequest(event),
    shouldInvalidateCache: (event) => false,
  },
);
