<template>
  <div class="locationFinderSearch" :class="classes">
    <header>
      <h1>{{ $t("blocks.locationFinder.headline") }}</h1>
      <div class="locationFinderSearch__mobile">
        <div class="locationFinderSearch__mobileClose">
          <UiAtomBaseButton
            variant="tertiary"
            aria-label="Schließen"
            @click="closeFullscreenSearch"
          >
            <IconX size="16" />
          </UiAtomBaseButton>
        </div>
        <div class="locationFinderSearch__mobileInput">
          <IconField>
            <InputIcon>
              <IconSearch size="16" />
            </InputIcon>
            <AutoComplete
              v-model="cityInput"
              :suggestions="citySuggestions"
              :placeholder="$t('blocks.locationFinder.searchPlaceholder')"
              option-label="label"
              :loading="cityLoading"
              fluid
              showClear
              @complete="onCitySearch"
              @item-select="onCitySelect"
              @focus="onCityFocus"
            />
          </IconField>
        </div>
      </div>
      <div class="locationFinderSearch__desktop">
        <IconField>
          <InputIcon>
            <IconSearch size="16" />
          </InputIcon>
          <AutoComplete
            v-model="cityInput"
            :suggestions="citySuggestions"
            :placeholder="$t('blocks.locationFinder.searchPlaceholder')"
            option-label="label"
            :loading="cityLoading"
            fluid
            showClear
            @complete="onCitySearch"
            @item-select="onCitySelect"
          />
        </IconField>
      </div>
      <span v-if="cityError" class="locationFinderSearch__error">
        {{ cityError }}
      </span>
    </header>
    <div class="locationFinderSearch__results">
      <BlockLocationFinderSearchResults :locations="sortedLocations" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { IconSearch, IconX } from "@tabler/icons-vue";
import AutoComplete, {
  type AutoCompleteOptionSelectEvent,
} from "primevue/autocomplete";
import type { LocationDto } from "~/lib/strapi/dto/collections";
import type { CitySuggestion } from "~/composables/useGoogleCitySearch";

const props = defineProps<{
  locations: LocationDto[];
}>();

const classes = computed(() => {
  return {
    "locationFinderSearch--fullscreen": showFullscreenSearch.value,
  };
});

const sortedLocations = computed(() => {
  return (props.locations ?? [])
    .map((location) => {
      const getDistance = () => {
        if (!location.coordinates || !selectedCity.value) return undefined;
        return getLocationDistance(location.coordinates, {
          lat: selectedCity.value.lat,
          long: selectedCity.value.lng,
        });
      };

      return {
        ...location,
        distanceInKilometers: getDistance(),
      };
    })
    .sort((a, b) => {
      return (
        (a.distanceInKilometers ?? Infinity) -
        (b.distanceInKilometers ?? Infinity)
      );
    });
});

const emit = defineEmits<{
  (e: "citySelect", city: CitySuggestion | null): void;
  (e: "fitMapToLocations", locations: LocationDto[] | null): void;
}>();

const {
  suggestions: citySuggestions,
  loading: cityLoading,
  error: cityError,
  search: citySearch,
} = useGoogleCitySearch();

const cityInput = ref<string | null>(null);
const selectedCity = ref<CitySuggestion | null>(null);
const showFullscreenSearch = ref(false);

function onCitySearch(event: { query: string }) {
  citySearch(event.query);
}

function getFirstThreeWithCoordinates() {
  return sortedLocations.value
    .filter((l) => l.coordinates?.lat != null && l.coordinates?.long != null)
    .slice(0, 3);
}

function onCitySelect(event: AutoCompleteOptionSelectEvent) {
  selectedCity.value = event.value as CitySuggestion;
  emit("fitMapToLocations", getFirstThreeWithCoordinates());
}

function onCityFocus() {
  showFullscreenSearch.value = true;
}

function closeFullscreenSearch() {
  showFullscreenSearch.value = false;
}

watch(showFullscreenSearch, (isOpen) => {
  document.body.style.overflow = isOpen ? "hidden" : "";
});

watch(selectedCity, (city) => {
  if (!city) emit("fitMapToLocations", null);
});

onBeforeUnmount(() => {
  document.body.style.overflow = "";
});
</script>
<style scoped>
.locationFinderSearch {
  display: flex;
  flex-direction: column;
}

.locationFinderSearch header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  padding: var(--space-card-pad-xs) var(--space-card-pad) var(--space-card-pad);
}

.locationFinderSearch h1 {
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
}

.locationFinderSearch__results {
  display: none;
  padding: 0 var(--space-card-pad-xs) var(--space-card-pad-sm)
    var(--space-card-pad-sm);
}

.locationFinderSearch__error {
  font-size: var(--font-sm);
}

.locationFinderSearch__desktop,
.locationFinderSearch__mobileClose {
  display: none;
}

.locationFinderSearch__mobile {
  display: flex;
  align-items: center;
  gap: var(--space-400);
}

.locationFinderSearch__mobileInput {
  flex: 1;
}

@media screen and (max-width: 899px) {
  .locationFinderSearch--fullscreen {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background: var(--color-card-bg-strong);
  }

  .locationFinderSearch--fullscreen header {
    padding: var(--space-card-pad-sm) var(--space-card-pad-xs) var(--space-500)
      var(--space-card-pad-sm);
    background: linear-gradient(
      to top,
      transparent 0,
      var(--color-card-bg-strong) var(--space-400)
    );
  }

  .locationFinderSearch--fullscreen h1 {
    display: none;
  }

  .locationFinderSearch--fullscreen .locationFinderSearch__results,
  .locationFinderSearch--fullscreen .locationFinderSearch__mobileClose {
    display: block;
  }
}

@media screen and (min-width: 900px) {
  .locationFinderSearch__desktop {
    display: block;
  }

  .locationFinderSearch__mobile {
    display: none;
  }

  .locationFinderSearch header {
    padding: var(--space-card-pad-sm) var(--space-card-pad-xs) var(--space-500)
      var(--space-card-pad-sm);
    border-radius: var(--border-radius-card) 0 0 0;
    background: linear-gradient(
      to top,
      transparent 0,
      var(--color-card-bg-strong) var(--space-400)
    );
  }

  .locationFinderSearch__results {
    display: block;
  }
}
</style>
