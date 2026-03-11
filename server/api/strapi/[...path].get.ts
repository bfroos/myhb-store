// Strapi proxy with server-side caching (1h fresh, 24h stale-while-revalidate).
// Important: Cache key includes the ENTIRE query string (including locale),
// so /about-us-page?locale=en and ?locale=de are cached separately.
export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig(event);
    const incoming = getRequestURL(event);
    const siteMode = config.siteMode || config.public.siteMode;

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
      return await $fetch(strapiUrl, {
        headers: siteMode
          ? {
              "x-site-mode": siteMode,
            }
          : undefined,
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
      const params = new URLSearchParams(url.search);
      params.sort();
      const config = useRuntimeConfig(event);
      const siteMode = config.siteMode || config.public.siteMode || "default";
      return `strapi:${path}:${params.toString()}:${siteMode}`;
    },
    shouldBypassCache: () => false,
    shouldInvalidateCache: (event) => false,
  },
);
