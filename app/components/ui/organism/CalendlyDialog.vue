<template>
  <CalendlyInlineWidget
    v-if="params.url"
    :url="params.url"
    class="calendlyDialog"
  />
  <template v-else>
    <div ref="contentRef" class="calendlyDialog__content">
      <div class="calendlyDialog__search">
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
            @complete="onSearch"
            @update:model-value="onInputUpdate"
          />
        </IconField>
      </div>
      <div class="calendlyDialog__results">
        <span v-if="cityError">{{ cityError }}</span>
        <UiMoleculeLocationSearchResults
          :locations="sortedLocations"
          :on-book="handleLocationBook"
          :on-navigate="handleLocationNavigate"
        />
      </div>
    </div>
  </template>
</template>
<script setup lang="ts">
import { IconSearch } from "@tabler/icons-vue";
import AutoComplete from "primevue/autocomplete";
import type { CitySuggestion } from "~/composables/useGoogleCitySearch";

const { t } = useI18n();
const dialogRef = inject("dialogRef") as any;
const params = ref<any>({});

function handleLocationBook(location: { calendlyUrl?: string }) {
  if (location.calendlyUrl) {
    params.value = { ...params.value, url: location.calendlyUrl };
  }
}

function handleLocationNavigate() {
  dialogRef.value.close();
}

const {
  citySuggestions,
  cityLoading,
  cityError,
  cityInput,
  selectedCity,
  sortedLocations,
  onSearch,
  onSelect,
  fetchLocations,
} = useLocationFinder();

const contentRef = ref<HTMLElement | null>(null);

function scrollContentToTop() {
  nextTick(() => {
    setTimeout(() => {
      contentRef.value?.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  });
}

function onInputUpdate(val: string | CitySuggestion | null) {
  cityInput.value = val;
  if (val != null && typeof val === "object" && "lat" in val && "lng" in val) {
    onSelect({ value: val as CitySuggestion });
  }
}

onMounted(() => {
  params.value = dialogRef.value.data;

  if (!params.value?.url) {
    fetchLocations();
  }
});

watch(selectedCity, (city) => {
  if (city) scrollContentToTop();
});
</script>
<style scoped>
.calendlyDialog {
  width: 100% !important;
  height: 100% !important;
  overflow: hidden;
}

.calendlyDialog__content {
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.calendlyDialog__search {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--color-card-bg-light);
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  padding: var(--space-400) var(--space-card-pad-xs);
  border-bottom: 1px var(--color-border-mute) solid;
  backdrop-filter: blur(10px);
}

.calendlyDialog__results {
  position: relative;
  padding: var(--space-400) var(--space-card-pad-xs) var(--space-card-pad-xs)
    var(--space-card-pad-xs);
}
</style>
