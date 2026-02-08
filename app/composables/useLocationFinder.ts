import type { LocationDto } from "~/lib/strapi/dto/collections";
import type { CitySuggestion } from "~/composables/useGoogleCitySearch";
import { getLocationDistance } from "~/utils/locations";

const locationsCache = ref<LocationDto[]>([]);
const locationsCacheLocale = ref<string | null>(null);

export function useLocationFinder() {
  const { locale, fallbackLocale } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;

  const {
    suggestions: citySuggestions,
    loading: cityLoading,
    error: cityError,
    search: citySearch,
  } = useGoogleCitySearch();

  const locations = locationsCache;
  const cityInput = ref<string | CitySuggestion | null>(null);
  const selectedCity = ref<CitySuggestion | null>(null);

  function sortLocationsByCity(
    city: CitySuggestion,
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
    city: CitySuggestion | null,
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

  function onSelect(event: { value: CitySuggestion | string | null }) {
    const val = event.value;
    if (
      val != null &&
      typeof val === "object" &&
      "lat" in val &&
      "lng" in val
    ) {
      selectedCity.value = val as CitySuggestion;
    }
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
    cityError,
    cityInput,
    selectedCity,
    sortedLocations,
    locations,
    getThreeNearestLocations,
    onSearch,
    onSelect,
    fetchLocations,
  };
}
