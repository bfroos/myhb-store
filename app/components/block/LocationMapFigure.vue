<template>
  <div class="locationMap__figure">
    <svg
      viewBox="0 0 347 471"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="locationMap__map"
      role="img"
      focusable="false"
      :aria-labelledby="`${svgTitleId} ${svgDescId}`"
    >
      <title :id="svgTitleId">
        {{ $t("blocks.locationMap.map.title") }}
      </title>
      <desc :id="svgDescId">
        {{ $t("blocks.locationMap.map.description") }}
      </desc>
      <g v-html="locationMapPaths"></g>
      <g id="locations" aria-hidden="true">
        <g v-for="p in locationPoints" :key="p.id">
          <title>{{ p.name }} — {{ $t(p.statusLabelKey) }}</title>
          <circle
            v-if="p.status === 'open'"
            :cx="p.x"
            :cy="p.y"
            :class="[
              'locationMap__marker',
              `locationMap__marker--${p.status}`,
            ]"
            :r="MARKER.circleR"
          />
          <rect
            v-else-if="p.status === 'openSoon'"
            :x="p.x - MARKER.squareSize / 2"
            :y="p.y - MARKER.squareSize / 2"
            :width="MARKER.squareSize"
            :height="MARKER.squareSize"
            :class="[
              'locationMap__marker',
              `locationMap__marker--${p.status}`,
            ]"
          />
          <polygon
            v-else
            :points="trianglePoints(p.x, p.y, MARKER.triangleSize)"
            :class="[
              'locationMap__marker',
              `locationMap__marker--${p.status}`,
            ]"
          />
        </g>
      </g>
    </svg>
    <ul
      v-if="locationPoints.length"
      class="locationMap__srOnly"
      :aria-label="$t('blocks.locationMap.map.listLabel')"
    >
      <li v-for="p in locationPoints" :key="p.id">
        {{ p.name }} — {{ $t(p.statusLabelKey) }}
      </li>
    </ul>
    <ul class="locationMap__legend">
      <li>
        <svg
          class="locationMap__legendIcon"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <circle
            cx="6"
            cy="6"
            r="3"
            class="locationMap__marker locationMap__marker--legend"
          />
        </svg>
        <span>{{ $t("blocks.locationMap.status.open") }}</span>
      </li>
      <li>
        <svg
          class="locationMap__legendIcon"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="3"
            width="6"
            height="6"
            class="locationMap__marker locationMap__marker--legend"
          />
        </svg>
        <span>{{ $t("blocks.locationMap.status.openSoon") }}</span>
      </li>
      <li>
        <svg
          class="locationMap__legendIcon"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <polygon
            points="6,2 10,10 2,10"
            class="locationMap__marker locationMap__marker--legend"
          />
        </svg>
        <span>{{ $t("blocks.locationMap.status.comingSoon") }}</span>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import type { LocationMapPoint } from "~/utils/locationMapProjection";
import {
  LOCATION_MAP_MARKER as MARKER,
  trianglePoints,
} from "~/utils/locationMapProjection";
import locationMapPaths from "~/assets/images/location-map-paths.svg?raw";

defineProps<{
  locationPoints: LocationMapPoint[];
  svgTitleId: string;
  svgDescId: string;
}>();
</script>
<style scoped>
.locationMap__map {
  max-height: 470px;
}

.locationMap__map path {
  fill: var(--locationMap-land-fill);
}

.locationMap__srOnly {
  position: absolute;

  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;

  border: 0;

  white-space: nowrap;

  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
}

.locationMap__legend {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-300) var(--space-500);
  padding: var(--space-100) var(--space-300);
  border-radius: var(--space-200);

  color: var(--color-gray-500);

  font-size: var(--font-xs);
}

.locationMap__legend > li {
  display: flex;
  align-items: center;
  gap: var(--space-200);
}

.locationMap__legendIcon {
  flex: 0 0 12px;
  height: 12px;
  width: 12px;
}

.locationMap__marker {
  vector-effect: non-scaling-stroke;
  stroke-width: 1.2;
}

.locationMap__marker--open {
  background: var(--color-black);
  fill: var(--color-black);
  stroke: var(--color-black);
}

.locationMap__marker--openSoon {
  background: var(--color-black);
  fill: var(--color-black);
  stroke: var(--color-black);
}

.locationMap__marker--comingSoon {
  background: var(--color-black);
  fill: var(--color-black);
  stroke: var(--color-black);
}

.locationMap__marker--legend {
  fill: var(--locationMap-legend-fill);
  stroke: var(--locationMap-legend-fill);
}
</style>
