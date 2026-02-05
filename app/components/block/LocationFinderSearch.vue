<template>
  <div class="search" :class="{ 'search--fullscreen': isFullscreen }">
    <header class="search__header">
      <h1 class="search__heading">{{ t("blocks.locationFinder.headline") }}</h1>
      <div class="search__mobile">
        <UiAtomBaseButton
          variant="tertiary"
          :aria-label="t('cta.close')"
          class="search__close"
          @click="closeFullscreen"
        >
          <IconX size="16" aria-hidden="true" />
        </UiAtomBaseButton>
        <div class="search__input search__input--mobile">
          <IconField>
            <InputIcon>
              <IconSearch size="16" aria-hidden="true" />
            </InputIcon>
            <AutoComplete
              v-model="cityInput"
              :suggestions="citySuggestions"
              :placeholder="t('blocks.locationFinder.searchPlaceholder')"
              option-label="label"
              :loading="cityLoading"
              fluid
              show-clear
              @complete="onSearch"
              @item-select="onSelect"
              @focus="openFullscreen"
            />
          </IconField>
        </div>
      </div>
      <div class="search__desktop">
        <IconField>
          <InputIcon>
            <IconSearch size="16" aria-hidden="true" />
          </InputIcon>
          <AutoComplete
            v-model="cityInput"
            :suggestions="citySuggestions"
            :placeholder="t('blocks.locationFinder.searchPlaceholder')"
            option-label="label"
            :loading="cityLoading"
            fluid
            show-clear
            @complete="onSearch"
            @item-select="onSelect"
          />
        </IconField>
      </div>
      <span v-if="cityError" class="search__error">{{ cityError }}</span>
    </header>
    <div class="search__results">
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
import { getLocationDistance } from "~/utils/locations";

const props = defineProps<{
  locations: LocationDto[];
}>();

const emit = defineEmits<{
  citySelect: [city: CitySuggestion | null];
  fitMapToLocations: [locations: LocationDto[] | null];
}>();

const { t } = useI18n();

const {
  suggestions: citySuggestions,
  loading: cityLoading,
  error: cityError,
  search: citySearch,
} = useGoogleCitySearch();

const cityInput = ref<string | null>(null);
const selectedCity = ref<CitySuggestion | null>(null);
const isFullscreen = ref(false);

const sortedLocations = computed(() => {
  const locs = props.locations ?? [];
  const city = selectedCity.value;
  if (!city) return locs;

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
});

function getLocationsForMapBounds(): LocationDto[] | null {
  if (!selectedCity.value) return null;
  return sortedLocations.value
    .filter((l) => l.coordinates?.lat != null && l.coordinates?.long != null)
    .slice(0, 3);
}

function onSearch(event: { query: string }) {
  citySearch(event.query);
}

function onSelect(event: AutoCompleteOptionSelectEvent) {
  selectedCity.value = event.value as CitySuggestion;
  emit("fitMapToLocations", getLocationsForMapBounds());
}

function openFullscreen() {
  isFullscreen.value = true;
}

function closeFullscreen() {
  isFullscreen.value = false;
}

watch(isFullscreen, (open) => {
  document.body.style.overflow = open ? "hidden" : "";
});

watch(selectedCity, (city) => {
  if (!city) emit("fitMapToLocations", null);
});

onBeforeUnmount(() => {
  document.body.style.overflow = "";
});
</script>

<style scoped>
.search {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.search__header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  padding: var(--space-card-pad-xs) var(--space-card-pad) var(--space-card-pad);
}

.search__heading {
  margin: 0;
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
}

.search__results {
  display: none;
  padding: 0 var(--space-card-pad-xs) var(--space-card-pad-sm)
    var(--space-card-pad-sm);
}

.search__error {
  font-size: var(--font-sm);
  color: var(--color-text-muted);
}

.search__desktop,
.search__close {
  display: none;
}

.search__mobile {
  display: flex;
  align-items: center;
  gap: var(--space-400);
}

.search__input--mobile {
  flex: 1;
  min-width: 0;
}

@media (max-width: 899px) {
  .search--fullscreen {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background: var(--color-card-bg-strong);
  }

  .search--fullscreen .search__header {
    padding: var(--space-card-pad-sm) var(--space-card-pad-xs) var(--space-500)
      var(--space-card-pad-sm);
    background: linear-gradient(
      to top,
      transparent 0,
      var(--color-card-bg-strong) var(--space-400)
    );
  }

  .search--fullscreen .search__heading {
    display: none;
  }

  .search--fullscreen .search__results,
  .search--fullscreen .search__close {
    display: block;
  }
}

@media (min-width: 900px) {
  .search__desktop {
    display: block;
  }

  .search__mobile {
    display: none;
  }

  .search__header {
    padding: var(--space-card-pad-sm) var(--space-card-pad-xs) var(--space-500)
      var(--space-card-pad-sm);
    border-radius: var(--border-radius-card) 0 0 0;
    background: linear-gradient(
      to top,
      transparent 0,
      var(--color-card-bg-strong) var(--space-400)
    );
  }

  .search__results {
    display: block;
  }
}
</style>
