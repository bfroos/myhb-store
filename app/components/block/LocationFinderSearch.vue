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
              :model-value="cityInput"
              :suggestions="citySuggestions"
              :placeholder="t('blocks.locationFinder.searchPlaceholder')"
              option-label="label"
              :loading="cityLoading"
              fluid
              show-clear
              @focus="openFullscreen"
              @complete="onSearch?.($event)"
              @update:model-value="onInputUpdate"
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
            :model-value="cityInput"
            :suggestions="citySuggestions"
            :placeholder="t('blocks.locationFinder.searchPlaceholder')"
            option-label="label"
            :loading="cityLoading"
            fluid
            show-clear
            @complete="onSearch?.($event)"
            @update:model-value="onInputUpdate"
          />
        </IconField>
      </div>
      <span v-if="cityError" class="search__error">{{ cityError }}</span>
    </header>
    <div class="search__results">
      <UiMoleculeLocationSearchResults
        :locations="locations"
        :on-book="handleLocationBook"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconSearch, IconX } from "@tabler/icons-vue";
import AutoComplete from "primevue/autocomplete";
import type { MoleculeLocationItem } from "~/lib/ui/types";
import type { LocationDto } from "~/lib/strapi/dto/collections";
import type { CitySuggestion } from "~/composables/useGoogleCitySearch";

const props = defineProps<{
  locations: LocationDto[];
  citySuggestions: CitySuggestion[];
  cityLoading: boolean;
  cityError: string | null;
  cityInput: string | CitySuggestion | null;
  onSearch?: (event: { query: string }) => void;
  onSelect?: (event: { value: CitySuggestion | null }) => void;
  onCityInput?: (value: string | CitySuggestion | null) => void;
  onBook?: (location: MoleculeLocationItem) => void;
}>();

const { t } = useI18n();
const isFullscreen = ref(false);

const emit = defineEmits<{
  openFullscreen: [];
}>();

function onInputUpdate(val: string | CitySuggestion | null) {
  props.onCityInput?.(val);
  if (val != null && typeof val === "object" && "lat" in val && "lng" in val) {
    props.onSelect?.({ value: val as CitySuggestion });
  }
}

function handleLocationBook(location: MoleculeLocationItem) {
  props.onBook?.(location);
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
