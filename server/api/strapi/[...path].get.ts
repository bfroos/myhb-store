export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const incoming = getRequestURL(event);

  // Prevent browser + CDN caching (fixes locale mixups caused by 304/HIT responses)
  setHeader(
    event,
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0",
  );
  setHeader(event, "Pragma", "no-cache");
  setHeader(event, "Expires", "0");
  // Some CDNs respect these additional headers
  setHeader(event, "Surrogate-Control", "no-store");
  setHeader(event, "CDN-Cache-Control", "no-store");

  setHeader(event, "X-MyHB-Strapi-Proxy", "1");

  if (!config.public.strapiUrl) {
    throw createError({ statusCode: 500, statusMessage: "Strapi URL missing" });
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
});
