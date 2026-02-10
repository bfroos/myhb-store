import type { LocationDto } from "~/lib/strapi/dto/collections";
import type {
  CitySuggestion,
  CityResolved,
} from "~/composables/useGoogleCitySearch";
import { getLocationDistance } from "~/utils/locations";

const locationsCache = ref<LocationDto[]>([]);
const locationsCacheLocale = ref<string | null>(null);

export function useLocationFinder() {
  const { locale, fallbackLocale, t } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;

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

  async function fetchLocations() {
    if (
      locationsCacheLocale.value === currentLocale &&
      locationsCache.value.length > 0
    ) {
      return;
    }
    const response = await strapiFetch<{ data: LocationDto[] }>(
      "/locations/bookable",
      { query: { locale: currentLocale } },
    );
    const data = response?.data ?? [];
    locations.value = data;
    locationsCacheLocale.value = currentLocale;
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
