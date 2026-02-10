type GooglePlaceDetailsResponse = {
  displayName?: {
    text?: string;
    languageCode?: string;
  };
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
};

const RATE_LIMIT_REQUESTS = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientId(event: import("h3").H3Event): string {
  const forwarded = getHeader(event, "x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const xRealIp = getHeader(event, "x-real-ip");
  if (xRealIp) return xRealIp;
  return "unknown";
}

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientId);
  if (!entry) {
    rateLimitMap.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }
  if (now >= entry.resetAt) {
    rateLimitMap.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_REQUESTS) return false;
  return true;
}

export default defineEventHandler(async (event) => {
  const clientId = getClientId(event);
  if (!checkRateLimit(clientId)) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too Many Requests",
    });
  }

  const config = useRuntimeConfig();
  const apiKey = config.googlePlacesApiKey as string | undefined;

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
        "Missing runtimeConfig.googlePlacesApiKey (set GOOGLE_PLACES_API_KEY)",
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
