<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="finder">
        <div class="finder__search">
          <div ref="searchRef" class="finder__search-inner">
            <BlockLocationFinderSearch
              :locations="sortedLocations"
              :city-input="cityInput"
              :city-suggestions="citySuggestions"
              :city-loading="cityLoading"
              :city-error="cityError"
              :on-search="onSearch"
              :on-select="onSelect"
              :on-city-input="handleCityInputUpdate"
              :on-book="handleLocationBook"
            />
          </div>
        </div>
        <div class="finder__map">
          <div class="finder__map-inner">
            <UiMoleculeLocationMap
              :locations="mapLocations"
              :fit-bounds-locations="mapFitBoundsLocations"
            />
          </div>
        </div>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useDialog } from "primevue/usedialog";
import { ColorTheme } from "~/lib/strapi/dto/enums";
import type { CitySuggestion } from "~/composables/useGoogleCitySearch";
import type { MoleculeLocationItem } from "~/lib/ui/types";

const { t } = useI18n();
const dialog = useDialog();
const {
  fetchLocations,
  citySuggestions,
  cityLoading,
  cityError,
  cityInput,
  selectedCity,
  locations,
  sortedLocations,
  getThreeNearestLocations,
  onSearch,
  onSelect,
} = useLocationFinder();

const searchRef = ref<HTMLElement | null>(null);

const mapLocations = computed(() =>
  selectedCity.value
    ? getThreeNearestLocations(selectedCity.value) ?? []
    : locations.value ?? [],
);
const mapFitBoundsLocations = computed(() =>
  getThreeNearestLocations(selectedCity.value),
);
const cardSettings = { colorTheme: ColorTheme.STRONG };

function handleCityInputUpdate(val: string | CitySuggestion | null) {
  cityInput.value = val;
}

function handleLocationBook(location: MoleculeLocationItem) {
  if (!location.calendlyUrl) return;
  dialog.open(
    defineAsyncComponent(
      () => import("~/components/ui/organism/CalendlyDialog.vue"),
    ),
    {
      data: { url: location.calendlyUrl },
      props: {
        modal: true,
        draggable: false,
        header: t("dialogs.calendly.header"),
        style: {
          width: "600px",
          height: "90svh",
          maxHeight: "98svh",
          margin: "0",
          padding: "0",
        },
        contentStyle: {
          height: "100%",
          padding: "0",
        },
        breakpoints: {
          "960px": "100vw",
          "640px": "100vw",
        },
      },
    },
  );
}

function scrollSearchToTop() {
  nextTick(() => {
    setTimeout(() => {
      searchRef.value?.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  });
}

onMounted(async () => {
  await fetchLocations();
});

watch(selectedCity, (city) => {
  if (city) scrollSearchToTop();
});
</script>

<style scoped>
.finder {
  display: flex;
  flex-direction: column-reverse;
  width: 100%;
}

.finder__map {
  position: relative;
  padding: var(--space-card-figure-pad);
}

.finder__map-inner {
  width: 100%;
  height: 50vh;
  border-radius: var(--border-radius-card-figure);
  overflow: hidden;
}

.finder__map-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
  color: var(--color-text-light);
}

@media (min-width: 900px) {
  .finder {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--space-card-figure-pad);
    height: calc(100vh - 200px);
  }

  .finder__search {
    position: relative;
    height: 100%;
    overflow: hidden;
  }

  .finder__search-inner {
    height: 100%;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--color-white) var(--color-black);
  }

  .finder__search::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 20px;
    height: 20px;
    background: linear-gradient(
      to top,
      var(--color-card-bg-strong) 0%,
      transparent 100%
    );
    border-radius: 0 0 0 var(--border-radius-card-figure);
    pointer-events: none;
  }

  .finder__map-inner {
    height: 100%;
  }
}
</style>
