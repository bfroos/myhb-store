/**
 * User geolocation via the browser API (navigator.geolocation).
 * No client-side call to the Google Geolocation API.
 * Fallback to the server endpoint only if browser geolocation is unavailable or denied.
 */

export type UserGeolocationResult = {
  lat: number;
  lng: number;
  accuracy: number;
};

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_AGE_MS = 60_000;

function isGeolocationSupported(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

/**
 * Requests the current position via the browser API.
 * @param options timeout and maxAge in ms
 * @returns { lat, lng, accuracy } or null on error/denial
 */
export function useUserGeolocation() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function requestLocation(options?: {
    timeout?: number;
    maxAge?: number;
  }): Promise<UserGeolocationResult | null> {
    if (!import.meta.client) return null;

    const timeout = options?.timeout ?? DEFAULT_TIMEOUT_MS;
    const maxAge = options?.maxAge ?? DEFAULT_MAX_AGE_MS;

    if (!isGeolocationSupported()) {
      error.value = "Geolocation is not supported by this browser.";
      return await fallbackGeolocate();
    }

    loading.value = true;
    error.value = null;

    try {
      const position = await new Promise<GeolocationPosition | null>(
        (resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve(p),
            () => resolve(null),
            { enableHighAccuracy: true, timeout, maximumAge: maxAge },
          );
        },
      );

      if (!position?.coords) {
        error.value = "Location could not be determined.";
        return await fallbackGeolocate();
      }

      const { latitude: lat, longitude: lng, accuracy } = position.coords;
      return { lat, lng, accuracy };
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Location failed.";
      return await fallbackGeolocate();
    } finally {
      loading.value = false;
    }
  }

  /** Only use if navigator.geolocation is unavailable or denied. */
  async function fallbackGeolocate(): Promise<UserGeolocationResult | null> {
    try {
      const res = await $fetch<{ location?: { lat: number; lng: number } }>(
        "/api/geolocate",
        {
          method: "POST",
          body: {},
        },
      );
      const loc = res?.location;
      if (
        loc &&
        typeof loc.lat === "number" &&
        typeof loc.lng === "number" &&
        Number.isFinite(loc.lat) &&
        Number.isFinite(loc.lng)
      ) {
        return {
          lat: loc.lat,
          lng: loc.lng,
          accuracy: 0,
        };
      }
    } catch {
      // Fallback failed – no further error set
    }
    return null;
  }

  return {
    loading,
    error,
    requestLocation,
    isSupported: isGeolocationSupported(),
  };
}
