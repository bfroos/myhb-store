type GooglePlaceReview = {
  author_name?: string;
  author_url?: string;
  language?: string;
  rating?: number;
  text?: string;
  time?: number;
};

type GooglePlaceDetailsResponse = {
  result?: {
    name?: string;
    url?: string;
    reviews?: GooglePlaceReview[];
  };
  status?: string;
  error_message?: string;
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = (config as any).googlePlacesApiKey as string | undefined;

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
        "Missing server runtimeConfig: googlePlacesApiKey (set NUXT_GOOGLE_PLACES_API_KEY)",
    });
  }

  // Places Details API (classic). Note: Google may limit number of returned reviews.
  const url = "https://maps.googleapis.com/maps/api/place/details/json";
  const res = await $fetch<GooglePlaceDetailsResponse>(url, {
    query: {
      place_id: placeId,
      fields: "name,url,reviews",
      language: language || undefined,
      key: apiKey,
    },
  });

  if (res?.status && res.status !== "OK") {
    throw createError({
      statusCode: 502,
      statusMessage: `Google Places API error: ${res.status}${
        res.error_message ? ` (${res.error_message})` : ""
      }`,
    });
  }

  const placeName = res?.result?.name ?? null;
  const placeUrl = res?.result?.url ?? null;
  const reviews = (res?.result?.reviews ?? []).map((r) => ({
    rating: r.rating ?? 5,
    author: r.author_name ?? "Google User",
    text: r.text ?? "",
    source: "google",
    // Prefer the place URL; fallback to author url if present.
    sourceUrl: placeUrl ?? r.author_url ?? undefined,
    // Helpful for consumers that want to show the place name.
    placeName,
    language: r.language ?? null,
    time: r.time ?? null,
  }));

  return {
    placeId,
    placeName,
    placeUrl,
    reviews,
  };
});
