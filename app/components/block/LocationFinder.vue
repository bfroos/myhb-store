<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="finder">
        <div ref="searchRef" class="finder__search">
          <BlockLocationFinderSearch
            :locations="locations"
            @fit-map-to-locations="fitBoundsLocations = $event"
            @scroll-to-top="scrollSearchToTop"
          />
        </div>
        <div class="finder__map">
          <div class="finder__map-inner">
            <ClientOnly>
              <UiMoleculeLocationMapMarkers
                :locations="locations"
                :fit-bounds-locations="fitBoundsLocations"
              />
              <template #fallback>
                <div class="finder__map-placeholder">
                  {{ t("blocks.locationFinder.mapLoading") }}
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { ColorTheme } from "~/lib/strapi/dto/enums";
import type { LocationDto } from "~/lib/strapi/dto/collections";

const props = defineProps<{
  locations: LocationDto[];
}>();

const { t } = useI18n();

const fitBoundsLocations = ref<LocationDto[] | null>(null);
const searchRef = ref<HTMLElement | null>(null);

const hasContent = computed(() => (props.locations?.length ?? 0) > 0);

function scrollSearchToTop() {
  nextTick(() => {
    setTimeout(() => {
      searchRef.value?.scrollTo({ top: 0, behavior: "smooth" });
    }, 150);
  });
}

const cardSettings = { colorTheme: ColorTheme.STRONG };
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
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--color-white) var(--color-black);
  }

  .finder__map-inner {
    height: 100%;
  }
}
</style>
