export type CitySuggestion = {
  label: string;
  lat: number;
  lng: number;
  formattedAddress: string;
};

const DEBOUNCE_MS = 300;
const MIN_QUERY_LEN = 2;
const MAX_RESULTS = 8;
const COUNTRY = "de";

type GeocodeResponse = {
  status: string;
  results?: Array<{
    formatted_address: string;
    geometry: { location: { lat: number; lng: number } };
    address_components?: Array<{ long_name: string; types: string[] }>;
  }>;
};

export function useGoogleCitySearch() {
  const config = useRuntimeConfig();
  const apiKey = config.public.googleMapsKey as string | undefined;
  const { locale } = useI18n();

  const suggestions = ref<CitySuggestion[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let runId = 0; // helps ignore stale responses

  function clearResults() {
    suggestions.value = [];
  }

  function setError(message: string | null) {
    error.value = message;
  }

  function getLanguage(): string {
    return ((locale.value || "de").split("-")[0] ?? "de").toLowerCase();
  }

  function buildUrl(query: string): string {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", query);
    url.searchParams.set("key", apiKey as string);
    url.searchParams.set("language", getLanguage());
    url.searchParams.set("components", `country:${COUNTRY}`);
    return url.toString();
  }

  function toSuggestions(results: NonNullable<GeocodeResponse["results"]>): CitySuggestion[] {
    const seen = new Set<string>();

    const out: CitySuggestion[] = [];
    for (const r of results) {
      const locality =
        r.address_components?.find((c) => c.types.includes("locality"))?.long_name ??
        r.formatted_address.split(",")[0]?.trim() ??
        r.formatted_address;

      const key = `${locality}-${r.geometry.location.lat.toFixed(4)}-${r.geometry.location.lng.toFixed(4)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      out.push({
        label: locality,
        formattedAddress: r.formatted_address,
        lat: r.geometry.location.lat,
        lng: r.geometry.location.lng,
      });

      if (out.length >= MAX_RESULTS) break;
    }

    return out;
  }

  async function searchNow(query: string): Promise<void> {
    const q = query.trim();

    // early exits
    if (q.length < MIN_QUERY_LEN) {
      loading.value = false;
      clearResults();
      setError(null);
      return;
    }
    if (!apiKey) {
      loading.value = false;
      clearResults();
      setError("Google API Key fehlt.");
      return;
    }

    const myRun = ++runId;
    loading.value = true;
    setError(null);

    try {
      const data = await $fetch<GeocodeResponse>(buildUrl(q));

      // ignore stale results
      if (myRun !== runId) return;

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        setError(
          data.status === "REQUEST_DENIED" ? "Geocoding nicht erlaubt." : data.status,
        );
        clearResults();
        return;
      }

      suggestions.value = toSuggestions(data.results ?? []);
    } catch (e) {
      if (myRun !== runId) return;
      setError(e instanceof Error ? e.message : "Suche fehlgeschlagen.");
      clearResults();
    } finally {
      if (myRun === runId) loading.value = false;
    }
  }

  function search(query: string): void {
    const q = query?.trim() ?? "";

    if (debounceTimer) clearTimeout(debounceTimer);

    if (q.length < MIN_QUERY_LEN) {
      loading.value = false;
      clearResults();
      setError(null);
      return;
    }

    // show spinner immediately while user pauses typing
    loading.value = true;

    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      searchNow(q);
    }, DEBOUNCE_MS);
  }

  return {
    suggestions,
    loading,
    error,
    search,
  };
}
