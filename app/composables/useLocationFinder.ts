import type { LocationDto } from "~/lib/strapi/dto/collections";
import type {
  CitySuggestion,
  CityResolved,
} from "~/composables/useGoogleCitySearch";
import { getLocationDistance } from "~/utils/locations";
import type { TreatmentType } from "~/lib/strapi/dto/enums";

export function useLocationFinder() {
  const { locale, fallbackLocale, t } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;

  // Request-isolierter State: modul-globale refs wären bei SSR über alle
  // gleichzeitigen Requests eines Server-Prozesses geteilt und würden sich
  // gegenseitig überschreiben (leere/fremde Standorte, die dann per ISR
  // eingefroren werden). useState kapselt den State pro Request und behält
  // client-seitig weiterhin das Caching über Navigationen bei.
  const locationsCache = useState<LocationDto[]>(
    "locationFinder:bookableLocations",
    () => [],
  );
  const locationsCacheKey = useState<string | null>(
    "locationFinder:bookableLocationsKey",
    () => null,
  );

  const {
    suggestions: citySuggestions,
    loading: cityLoading,
    resolving: cityResolving,
    error: cityError,
    search: citySearch,
    resolveSuggestion,
  } = useGoogleCitySearch();

  const {
    requestLocation,
    loading: geolocationLoading,
    error: geolocationError,
  } = useUserGeolocation();

  const locations = locationsCache;
  const cityInput = ref<string | CitySuggestion | null>(null);
  const selectedCity = ref<CityResolved | null>(null);

  function sortLocationsByCity(
    city: CityResolved,
    locs: LocationDto[],
  ): LocationDto[] {
    return [...locs]
      .map((loc) => ({
        ...loc,
        distanceInKilometers: loc.coordinates
          ? getLocationDistance(loc.coordinates, {
              lat: city.lat,
              long: city.lng,
            })
          : undefined,
      }))
      .sort(
        (a, b) =>
          (a.distanceInKilometers ?? Infinity) -
          (b.distanceInKilometers ?? Infinity),
      );
  }

  const sortedLocations = computed(() => {
    const locs = locations.value ?? [];
    const city = selectedCity.value;
    return city ? sortLocationsByCity(city, locs) : locs;
  });

  function getThreeNearestLocations(
    city: CityResolved | null,
  ): LocationDto[] | null {
    if (!city) return null;
    const locs = locations.value ?? [];
    return sortLocationsByCity(city, locs)
      .filter((l) => l.coordinates?.lat != null && l.coordinates?.long != null)
      .slice(0, 3);
  }

  function onSearch(event: { query: string }) {
    citySearch(event.query);
  }

  async function onSelect(event: { value: CitySuggestion | null }) {
    const suggestion = event.value;
    if (!suggestion) {
      selectedCity.value = null;
      return;
    }
    const resolved = await resolveSuggestion(suggestion);
    selectedCity.value = resolved ?? null;
    if (resolved) {
      cityInput.value = resolved.label;
    }
  }

  async function useMyLocation() {
    const result = await requestLocation();
    if (!result) return;
    const label = t("blocks.locationFinder.useMyLocation");
    const synthetic: CityResolved = {
      label,
      placeId: "",
      formattedAddress: label,
      lat: result.lat,
      lng: result.lng,
    };
    selectedCity.value = synthetic;
    cityInput.value = label;
  }

  async function fetchLocations(options?: {
    treatmentType?: TreatmentType;
    force?: boolean;
  }) {
    const cacheKey = `${currentLocale}::${options?.treatmentType ?? ""}`;
    if (!options?.force && locationsCacheKey.value === cacheKey && locationsCache.value.length > 0) {
      return;
    }
    try {
      const response = await strapiFetch<{ data: LocationDto[] }>(
        "/locations/bookable",
        {
          query: { locale: currentLocale, treatmentType: options?.treatmentType },
        },
      );
      const data = response?.data ?? [];
      // Erfolgreicher Response ist autoritativ (auch wenn leer). Nur ein
      // geworfener Fehler (siehe catch) darf den letzten guten Stand behalten,
      // damit ein transienter API-Ausfall keinen leeren Standorte-Block
      // erzeugt, der dann per ISR eingefroren wird.
      locations.value = data;
      locationsCacheKey.value = cacheKey;
    } catch (error) {
      // Fetch-Fehler dürfen weder den (SSR-)Render abbrechen noch einen bereits
      // gefüllten Stand auf [] kippen. Block bleibt mit letztem gültigen Stand.
      console.error(
        "[useLocationFinder] fetchLocations fehlgeschlagen, behalte letzten Stand:",
        error,
      );
    }
  }

  return {
    citySuggestions,
    cityLoading,
    cityResolving,
    cityError,
    cityInput,
    selectedCity,
    sortedLocations,
    locations,
    getThreeNearestLocations,
    onSearch,
    onSelect,
    useMyLocation,
    geolocationLoading,
    geolocationError,
    fetchLocations,
  };
}
