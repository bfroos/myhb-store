/// <reference types="google.maps" />
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

let loadPromise: Promise<typeof google> | null = null;
let optionsSet = false;

export function loadGoogleMaps(): Promise<typeof google> {
  if (!import.meta.client) {
    return Promise.reject(
      new Error("Google Maps ist nur im Browser verfügbar."),
    );
  }

  if (loadPromise) return loadPromise;

  const config = useRuntimeConfig();
  const apiKey = config.public.googleMapsKey as string | undefined;
  const mapId = config.public.googleMapsMapId as string | undefined;

  if (!apiKey) {
    return Promise.reject(
      new Error(
        "Missing runtimeConfig.public.googleMapsKey (set NUXT_PUBLIC_GOOGLE_MAPS_WEB_KEY)",
      ),
    );
  }

  if (!optionsSet) {
    setOptions({
      key: apiKey,
      v: "weekly",
      mapIds: mapId ? [mapId] : undefined,
    });
    optionsSet = true;
  }

  loadPromise = importLibrary("maps").then(() => window.google);

  return loadPromise;
}
