import { loadGoogleMaps } from "./useGoogleMaps";

export type CitySuggestion = {
  label: string;
  placeId: string;
  secondaryText: string;
  /** Keep the native prediction so we can call toPlace() (works with session token) */
  placePrediction: google.maps.places.PlacePrediction;
};

export type CityResolved = {
  label: string;
  placeId: string;
  formattedAddress: string;
  lat: number;
  lng: number;
};

const DEBOUNCE_MS = 500; // Increased from 300ms to reduce API calls
const MIN_QUERY_LEN = 2;
const MAX_RESULTS = 5; // Reduced from 8 to optimize UX (still sufficient)
const REGION = "DE";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_STORAGE_KEY = "myhb_google_places_cache";

let placesLib: google.maps.PlacesLibrary | null = null;
let sessionToken: google.maps.places.AutocompleteSessionToken | null = null;

// In-memory cache for resolved places
const placeCache = new Map<string, CityResolved>();

interface CachedPlace {
  data: CityResolved;
  timestamp: number;
}

// Load cache from localStorage on init
function loadCacheFromStorage() {
  if (!import.meta.client) return;
  
  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!stored) return;
    
    const cache: Record<string, CachedPlace> = JSON.parse(stored);
    const now = Date.now();
    
    Object.entries(cache).forEach(([placeId, cached]) => {
      if (now - cached.timestamp < CACHE_TTL_MS) {
        placeCache.set(placeId, cached.data);
      }
    });
  } catch (e) {
    console.warn("[Places Cache] Failed to load cache:", e);
  }
}

// Save cache to localStorage
function saveCacheToStorage() {
  if (!import.meta.client) return;
  
  try {
    const cache: Record<string, CachedPlace> = {};
    const now = Date.now();
    
    placeCache.forEach((data, placeId) => {
      cache[placeId] = {
        data,
        timestamp: now,
      };
    });
    
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("[Places Cache] Failed to save cache:", e);
  }
}

// Initialize cache
if (import.meta.client) {
  loadCacheFromStorage();
}

function getSessionToken(): google.maps.places.AutocompleteSessionToken {
  if (!placesLib) {
    throw new Error("Places library not loaded");
  }
  sessionToken ??= new placesLib.AutocompleteSessionToken();
  return sessionToken;
}

function resetSessionToken() {
  sessionToken = null;
}

export function useGoogleCitySearch() {
  const suggestions = ref<CitySuggestion[]>([]);
  const loading = ref(false);
  const resolving = ref(false);
  const error = ref<string | null>(null);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let runId = 0;

  async function ensurePlacesLib() {
    const g = await loadGoogleMaps();
    placesLib ??= (await g.maps.importLibrary(
      "places",
    )) as google.maps.PlacesLibrary;
  }

  function clearResults() {
    suggestions.value = [];
  }

  async function searchNow(query: string) {
    const q = query.trim();
    if (q.length < MIN_QUERY_LEN) {
      loading.value = false;
      clearResults();
      error.value = null;
      resetSessionToken();
      return;
    }

    const myRun = ++runId;
    loading.value = true;
    error.value = null;

    try {
      await ensurePlacesLib();

      // AutocompleteSuggestion is the supported API for new customers/keys.
      const req: google.maps.places.AutocompleteRequest = {
        input: q,
        includedRegionCodes: [REGION],
        // City-like results + postal codes.
        includedPrimaryTypes: [
          "locality",
          "administrative_area_level_3",
          "postal_code",
        ],
        sessionToken: getSessionToken(),
      };

      const { suggestions: raw } =
        await placesLib!.AutocompleteSuggestion.fetchAutocompleteSuggestions(
          req,
        );

      if (myRun !== runId) return;

      const placePreds = raw
        .map((s) => s.placePrediction)
        .filter((p): p is google.maps.places.PlacePrediction => !!p);

      suggestions.value = placePreds.slice(0, MAX_RESULTS).map((p) => ({
        label: p.mainText?.text ?? p.text?.toString() ?? "",
        placeId: p.placeId,
        secondaryText: p.secondaryText?.text ?? "",
        placePrediction: p,
      }));

      if (suggestions.value.length === 0) {
        // Keep this neutral; empty results can also happen with aggressive restrictions.
        error.value = null;
      }
    } catch (e) {
      if (myRun !== runId) return;
      error.value =
        e instanceof Error
          ? e.message
          : "Suche fehlgeschlagen (Places Autocomplete).";
      clearResults();
      // Token is potentially invalid after an error; start a fresh session.
      resetSessionToken();
    } finally {
      if (myRun === runId) loading.value = false;
    }
  }

  function search(query: string) {
    const q = (query ?? "").trim();

    if (debounceTimer) clearTimeout(debounceTimer);

    if (q.length < MIN_QUERY_LEN) {
      loading.value = false;
      clearResults();
      error.value = null;
      resetSessionToken();
      return;
    }

    loading.value = true;
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      searchNow(q);
    }, DEBOUNCE_MS);
  }

  async function resolveSuggestion(
    s: CitySuggestion,
  ): Promise<CityResolved | null> {
    // Check cache first (cost optimization: avoid expensive Place Details API call)
    if (placeCache.has(s.placeId)) {
      return placeCache.get(s.placeId)!;
    }

    resolving.value = true;
    error.value = null;

    try {
      await ensurePlacesLib();

      // Use the prediction's toPlace() + fetchFields(), which also closes the session.
      const place = s.placePrediction.toPlace();
      await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location"],
      });

      if (!place.location) return null;

      const lat = place.location.lat();
      const lng = place.location.lng();

      const resolved: CityResolved = {
        label: s.label,
        placeId: s.placeId,
        formattedAddress:
          place.formattedAddress ??
          `${s.label}${s.secondaryText ? ", " + s.secondaryText : ""}`,
        lat,
        lng,
      };

      // Cache result to avoid duplicate API calls
      placeCache.set(s.placeId, resolved);
      saveCacheToStorage();

      return resolved;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Auflösen fehlgeschlagen.";
      return null;
    } finally {
      resolving.value = false;
      // The session is concluded when fetchFields() is called; start fresh next time.
      resetSessionToken();
    }
  }

  return {
    suggestions,
    loading,
    resolving,
    error,
    search,
    resolveSuggestion,
    clearResults,
  };
}
