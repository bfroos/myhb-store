/**
 * Server-Fallback for Geolocation (Google Geolocation API).
 * Only use if navigator.geolocation is unavailable or denied.
 * Uses GOOGLE_GEOLOCATION_API_KEY (server-only).
 */

type GoogleGeolocateRequestBody = {
  considerIp?: boolean;
  wifiAccessPoints?: Array<{ macAddress?: string; signalStrength?: number }>;
  cellTowers?: Array<unknown>;
};

type GoogleGeolocateResponse = {
  location?: { lat: number; lng: number };
  accuracy?: number;
};

const RATE_LIMIT_REQUESTS = 30;
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
  setResponseHeader(event, "Cache-Control", "private, no-store");

  const clientId = getClientId(event);
  if (!checkRateLimit(clientId)) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too Many Requests",
    });
  }

  const config = useRuntimeConfig();
  const apiKey = config.googleGeolocationApiKey as string | undefined;

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage:
        "Geolocation fallback not configured (GOOGLE_GEOLOCATION_API_KEY)",
    });
  }

  let body: GoogleGeolocateRequestBody = {};
  try {
    const raw = await readBody(event);
    if (
      raw &&
      typeof raw === "object" &&
      (raw.wifiAccessPoints || raw.cellTowers)
    ) {
      body = {
        considerIp: raw.considerIp !== false,
        wifiAccessPoints: Array.isArray(raw.wifiAccessPoints)
          ? raw.wifiAccessPoints
          : undefined,
        cellTowers: Array.isArray(raw.cellTowers) ? raw.cellTowers : undefined,
      };
    } else {
      body = { considerIp: true };
    }
  } catch {
    body = { considerIp: true };
  }

  const url = "https://www.googleapis.com/geolocation/v1/geolocate";

  try {
    const res = await $fetch<GoogleGeolocateResponse>(url, {
      method: "POST",
      query: { key: apiKey },
      body,
    });
    return {
      location: res?.location ?? null,
      accuracy: res?.accuracy ?? null,
    };
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number })?.statusCode ?? 502;
    const message =
      (error as { message?: string })?.message ?? "Geolocation request failed";
    throw createError({
      statusCode,
      statusMessage: message,
    });
  }
});
