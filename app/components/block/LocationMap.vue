<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="locationMap">
        <h2 v-if="headline" class="locationMap__headline">{{ headline }}</h2>
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
                  :r="MARKER_CIRCLE_R"
                />
                <rect
                  v-else-if="p.status === 'openSoon'"
                  :x="p.x - MARKER_SQUARE_SIZE / 2"
                  :y="p.y - MARKER_SQUARE_SIZE / 2"
                  :width="MARKER_SQUARE_SIZE"
                  :height="MARKER_SQUARE_SIZE"
                  :class="[
                    'locationMap__marker',
                    `locationMap__marker--${p.status}`,
                  ]"
                />
                <polygon
                  v-else
                  :points="trianglePoints(p.x, p.y, MARKER_TRIANGLE_SIZE)"
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
        <li v-if="customersCount > 0">
          <strong>{{ customersCountLabel }}+</strong>
          <span>{{ $t(customersLabelKey) }}</span>
        </li>
        <li v-if="loungeCount > 0">
          <strong>{{ loungeCountLabel }}</strong>
          <span>{{ $t(loungesLabelKey) }}</span>
        </li>
        <li v-if="doctorCount > 0">
          <strong>{{ doctorCountLabel }}</strong>
          <span>{{ $t(doctorsLabelKey) }}</span>
        </li>
        <li v-if="clinicCount > 0">
          <strong>{{ clinicCountLabel }}</strong>
          <span>{{ $t(clinicLabelKey) }}</span>
        </li>
      </ul>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import type { BlockLocationMapDto } from "~/lib/strapi/dto/components";
import locationMapPaths from "~/assets/images/location-map-paths.svg?raw";

const props = defineProps<BlockLocationMapDto>();

const a11yIdBase = useId();
const svgTitleId = `${a11yIdBase}-title`;
const svgDescId = `${a11yIdBase}-desc`;

const [globals, locationCounts, employeeCounts, locationsForMap] =
  await Promise.all([
    useGlobals(),
    useLocationCounts(),
    useEmployeeCounts(),
    useLocationsForMap(),
  ]);

const customersCount =
  Number(globals.value?.marketing?.customersCount ?? 0) || 0;
const loungeCount = Number(locationCounts.loungeCount ?? 0) || 0;
const clinicCount = Number(locationCounts.clinicCount ?? 0) || 0;
const doctorCount = Number(employeeCounts.doctorCount ?? 0) || 0;

const customersCountLabel = computed(() => customersCount.toString());
const loungeCountLabel = computed(() => loungeCount.toString());
const clinicCountLabel = computed(() => clinicCount.toString());
const doctorCountLabel = computed(() => doctorCount.toString());

const customersLabelKey = computed(() =>
  pluralKey("blocks.locationMap.footer.customers", 2),
);
const loungesLabelKey = computed(() =>
  pluralKey("blocks.locationMap.footer.lounges", loungeCount),
);
const doctorsLabelKey = computed(() =>
  pluralKey("blocks.locationMap.footer.doctors", doctorCount),
);
const clinicLabelKey = computed(() =>
  pluralKey("blocks.locationMap.footer.clinic", clinicCount),
);

// --- SVG Map Points (Lat/Lon -> SVG viewBox) ---
const VIEWBOX = {
  width: 347,
  height: 471,
} as const;

// Initial values for Germany
const GEO_BOUNDS = {
  minLon: 5.5,
  maxLon: 15.5,
  minLat: 47.0,
  maxLat: 55.5,
} as const;

function toNumber(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : null;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function projectLatLonToSvg(lat: number, lon: number) {
  // Equirectangular + Bounding-Box mapping
  const x =
    ((lon - GEO_BOUNDS.minLon) / (GEO_BOUNDS.maxLon - GEO_BOUNDS.minLon)) *
    VIEWBOX.width;
  const y =
    ((GEO_BOUNDS.maxLat - lat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat)) *
    VIEWBOX.height;

  return {
    x: clamp(x, 0, VIEWBOX.width),
    y: clamp(y, 0, VIEWBOX.height),
  };
}

type LocationStatus = "open" | "openSoon" | "comingSoon";

const toDisplayStatus = (
  status: ReturnType<typeof getLocationStatusRaw>,
): LocationStatus => (status === "openNewToday" ? "open" : status);

function statusLabelKey(status: LocationStatus) {
  return `blocks.locationMap.status.${status}`;
}

// --- Marker Shapes ---
const MARKER_CIRCLE_R = 3;
const MARKER_SQUARE_SIZE = 6 * 0.9; // -10%
const MARKER_TRIANGLE_SIZE = 4 * 0.8; // -20% (optisch etwas größer als der Kreis)

function trianglePoints(cx: number, cy: number, size: number) {
  // Upward-pointing triangle (tip at the top)
  const top = `${cx},${cy - size}`;
  const left = `${cx - size},${cy + size}`;
  const right = `${cx + size},${cy + size}`;
  return `${top} ${right} ${left}`;
}

const locationPoints = computed(() => {
  const locations = locationsForMap.locations ?? [];

  const points = locations.map((loc: any) => {
    const lat = toNumber(loc?.coordinates?.lat);
    const lon = toNumber(loc?.coordinates?.long);
    if (lat == null || lon == null) return null;

    const { x, y } = projectLatLonToSvg(lat, lon);
    const status = toDisplayStatus(
      getLocationStatusRaw(loc?.newOpeningDate ?? null),
    );

    return {
      id: loc?.id ?? `${loc?.slug ?? loc?.name ?? "location"}`,
      name: loc?.name ?? loc?.slug ?? "Location",
      x,
      y,
      status,
      statusLabelKey: statusLabelKey(status),
    };
  });

  return points.filter(
    (
      p,
    ): p is {
      id: string | number;
      name: string;
      x: number;
      y: number;
      status: LocationStatus;
      statusLabelKey: string;
    } => p !== null,
  );
});
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

.locationMap__map {
  max-height: 470px;
}

.locationMap__map path {
  fill: var(--locationMap-land-fill);
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
