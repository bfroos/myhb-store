// Strapi proxy with server-side caching (1h fresh, 24h stale-while-revalidate).
// Important: Cache key includes the ENTIRE query string (including locale),
// so /about-us-page?locale=en and ?locale=de are cached separately.
export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const incoming = getRequestURL(event);

    setHeader(event, "X-MyHB-Strapi-Proxy", "1");

    if (!config.public.strapiUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: "Strapi URL missing",
      });
    }

    const restPath = incoming.pathname.replace(/^\/api\/strapi/, "");
    const strapiBase = config.public.strapiUrl.replace(/\/+$/, "");
    const strapiUrl = `${strapiBase}/api${restPath}${incoming.search}`;

    try {
      return await $fetch(strapiUrl);
    } catch (error: any) {
      throw createError({
        statusCode: error?.statusCode || error?.status || 500,
        statusMessage:
          error?.statusMessage || error?.message || "Strapi API error",
      });
    }
  },
  {
    maxAge: 3600,
    staleMaxAge: 86400,
    getKey: (event) => {
      const url = getRequestURL(event);
      const path = url.pathname.replace(/^\/api\/strapi/, "");
      const params = new URLSearchParams(url.search);
      params.sort();
      return `strapi:${path}:${params.toString()}`;
    },
    shouldBypassCache: (event) => false,
    shouldInvalidateCache: (event) => false,
  },
);
