<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="locationMap">
        <h2 v-if="headline" class="locationMap__headline">{{ headline }}</h2>
        <BlockLocationMapFigure
          :location-points="locationPoints"
          :svg-title-id="svgTitleId"
          :svg-desc-id="svgDescId"
        />
        <div class="locationMap__cta">
          <ul class="locationMap__benefits">
            <li v-for="item in list" :key="item.id">
              <UiLayoutIconWrapper :size="40">
                <g v-html="item.icon?.iconData ?? ''" />
              </UiLayoutIconWrapper>
              {{ item.text }}
            </li>
          </ul>
          <UiMoleculeButtonGroup v-if="links && links.length > 0">
            <SharedButton v-for="link in links" :key="link.id" :button="link" />
          </UiMoleculeButtonGroup>
        </div>
      </div>
      <ul class="locationMap__footer">
        <li v-if="mapData.customersCount > 0">
          <strong>{{ mapData.customersCountLabel }}+</strong>
          <span>{{ $t(mapData.customersLabelKey.value) }}</span>
        </li>
        <li v-if="mapData.loungeCount > 0">
          <strong>{{ mapData.loungeCountLabel }}</strong>
          <span>{{ $t(mapData.loungesLabelKey.value) }}</span>
        </li>
        <li v-if="mapData.doctorCount > 0">
          <strong>{{ mapData.doctorCountLabel }}</strong>
          <span>{{ $t(mapData.doctorsLabelKey.value) }}</span>
        </li>
        <li v-if="mapData.clinicCount > 0">
          <strong>{{ mapData.clinicCountLabel }}</strong>
          <span>{{ $t(mapData.clinicLabelKey.value) }}</span>
        </li>
      </ul>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import type { BlockLocationMapDto } from "~/lib/strapi/dto/components";
import { getLocationMapPoints } from "~/utils/locationMapProjection";

defineProps<BlockLocationMapDto>();

const a11yIdBase = useId();
const svgTitleId = `${a11yIdBase}-title`;
const svgDescId = `${a11yIdBase}-desc`;

const mapData = await useLocationMapData();

const locationPoints = computed(() =>
  getLocationMapPoints(mapData.locations.value),
);
</script>
<style scoped>
.locationMap {
  --locationMap-legend-fill: var(--color-gray-900);
  --locationMap-land-fill: var(--color-gray-300);
  --locationMap-land-stroke: var(--color-card-bg-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-800);
  padding: var(--space-card-pad);
}

.locationMap__headline {
  max-width: 18ch;
  text-align: center;
}

.locationMap__cta :deep(button) {
  width: 100%;
}

.locationMap__benefits {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  margin-bottom: var(--space-700);

  font-size: var(--font-lg);
  line-height: var(--line-lg);
}

.locationMap__benefits > li {
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: center;
  gap: var(--space-400);
}

.locationMap__footer {
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
}

.locationMap__footer > li {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: var(--space-100);
  max-width: 100%;
  min-width: 140px;
  padding: var(--space-600) 0;
  border-top: var(--color-border-mute) 1px solid;
  border-left: var(--color-border-mute) 1px solid;
  margin-left: -1px;
}

.locationMap__footer > li > strong {
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
}

.locationMap__footer > li > span {
  color: var(--color-text-light);
}

.theme-soft .locationMap {
  --locationMap-land-fill: var(--color-gray-400);
  --locationMap-land-stroke: var(--color-card-bg-soft);
  --locationMap-legend-fill: var(--color-gray-900);
}

.theme-neutral .locationMap,
.theme-strong .locationMap {
  --locationMap-land-fill: var(--color-gray-200);
  --locationMap-land-stroke: var(--color-card-bg-strong);
  --locationMap-legend-fill: var(--color-gray-500);
}

.card--soft .locationMap {
  --locationMap-legend-fill: var(--color-gray-900);
}

.card--soft .locationMap__map {
  --locationMap-land-fill: var(--color-gray-400);
  --locationMap-land-stroke: var(--color-card-bg-soft);
}

.card--neutral .locationMap__map {
  --locationMap-land-fill: var(--color-gray-200);
  --locationMap-land-stroke: var(--color-card-bg-neutral);
}

.card--neutral .locationMap {
  --locationMap-legend-fill: var(--color-gray-300);
}

.card--strong .locationMap__map {
  --locationMap-land-fill: var(--color-gray-300);
  --locationMap-land-stroke: var(--color-card-bg-strong);
}

.card--strong .locationMap {
  --locationMap-legend-fill: var(--color-gray-400);
}

@media screen and (min-width: 900px) {
  .locationMap {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 2fr max-content 12fr;
  }

  .locationMap__headline {
    grid-area: 2 / 2 / 3 / 3;

    text-align: left;
  }

  .locationMap__cta {
    grid-area: 3 / 2 / 4 / 3;
    align-self: flex-start;
  }

  .locationMap__cta :deep(button) {
    width: auto;
  }

  .locationMap__figure {
    grid-area: 1 / 1 / 4 / 2;
    justify-self: center;
  }
}
</style>
