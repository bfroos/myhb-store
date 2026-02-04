<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface
      :card-settings="{
        colorTheme: ColorTheme.STRONG,
      }"
    >
      <div class="locationSearch">
        <div class="locationSearch__search">
          <BlockLocationFinderSearch
            :locations="locations"
            @fit-map-to-locations="onFitMapToLocations"
          />
        </div>
        <div class="locationSearch__map">
          <div class="locationSearch__mapInner">
            <ClientOnly>
              <UiMoleculeLocationMapMarkers
                :locations="locations"
                :fit-bounds-locations="fitBoundsLocations"
              />
              <template #fallback>
                <div class="locationSearch__mapPlaceholder">
                  {{ $t("blocks.locationFinder.mapLoading") }}
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

const fitBoundsLocations = ref<LocationDto[] | null>(null);

function onFitMapToLocations(locations: LocationDto[] | null) {
  fitBoundsLocations.value = locations;
}
</script>
<style scoped>
.locationSearch {
  display: flex;
  flex-direction: column-reverse;
}

.locationSearch__map {
  position: relative;
  padding: var(--space-card-figure-pad);
}

.locationSearch__mapInner {
  width: 100%;
  height: 50vh;
  border-radius: var(--border-radius-card-figure);
  overflow: hidden;
}

@media screen and (min-width: 900px) {
  .locationSearch {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--space-card-figure-pad);
    height: calc(100vh - 200px);
  }

  .locationSearch__search {
    position: relative;
    height: 100%;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--color-white) var(--color-black);
  }

  .locationSearch__mapInner {
    height: 100%;
  }
}
</style>
