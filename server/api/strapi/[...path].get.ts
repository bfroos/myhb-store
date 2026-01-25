export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const incoming = getRequestURL(event);

  setHeader(event, "Cache-Control", "max-age=0, s-maxage=300, stale-while-revalidate=60");

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
