type GooglePlaceDetailsResponse = {
  displayName?: {
    text?: string;
    languageCode?: string;
  };
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.public.googleMapsKey as string | undefined;

  const query = getQuery(event);
  const placeId = (query.placeId as string | undefined)?.trim();
  const language = (query.language as string | undefined)?.trim();

  if (!placeId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing query param: placeId",
    });
  }

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage:
        "Missing runtimeConfig.public.googleMapsKey (set NUXT_PUBLIC_GOOGLE_MAPS_API_KEY)",
    });
  }

  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  try {
    const res = await $fetch<GooglePlaceDetailsResponse>(url, {
      query: {
        fields: "displayName,googleMapsUri,rating,userRatingCount",
        languageCode: language || undefined,
        key: apiKey,
      },
    });

    return {
      placeId,
      placeName: res?.displayName?.text ?? null,
      placeUrl: res?.googleMapsUri ?? null,
      rating: res?.rating ?? null,
      userRatingsTotal: res?.userRatingCount ?? null,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 502,
      statusMessage: `Google Places API error: ${
        error?.message || "Unknown error"
      }`,
    });
  }
});
