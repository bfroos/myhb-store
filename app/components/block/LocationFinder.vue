<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface
      :card-settings="{
        colorTheme: ColorTheme.STRONG,
      }"
    >
      <div class="locationSearch">
        <div class="locationSearch__search">
          <BlockLocationFinderSearch :locations="locations" />
        </div>
        <div class="locationSearch__map">
          <div class="locationSearch__mapInner">
            <ClientOnly>
              <UiMoleculeLocationMapMarkers :locations="locations" />
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
  aspect-ratio: 16 / 9;
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
    aspect-ratio: unset;
    height: 100%;
  }
}
</style>
