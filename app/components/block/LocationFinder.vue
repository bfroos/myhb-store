<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="finder">
        <div class="finder__search">
          <div ref="searchRef" class="finder__search-inner">
            <BlockLocationFinderSearch
              :locations="locations"
              @fit-map-to-locations="fitBoundsLocations = $event"
              @scroll-to-top="scrollSearchToTop"
            />
          </div>
        </div>
        <div class="finder__map">
          <div class="finder__map-inner">
            <UiMoleculeLocationMap
              :locations="locations"
              :fit-bounds-locations="fitBoundsLocations"
            />
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
