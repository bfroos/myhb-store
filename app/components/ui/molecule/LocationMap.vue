<template>
  <div class="locationMap">
    <div v-if="!isReady && !didTimeout" class="locationMap__loading">
      <UiLayoutIconWrapper :size="40" rotate>
        <IconLoader />
      </UiLayoutIconWrapper>
    </div>

    <div
      v-else-if="(!isReady && didTimeout) || !hasPreferencesConsent"
      class="locationMap__consent"
    >
      <UiLayoutIconWrapper :size="40">
        <IconMapOff />
      </UiLayoutIconWrapper>
      <h3>
        {{ $t("googleMaps.consentRequired") }}
      </h3>
      <p>
        {{ $t("googleMaps.consentDescription") }}
      </p>
      <UiAtomBaseButton
        type="button"
        variant="link"
        size="sm"
        @click="openCookieSettings"
      >
        {{ $t("googleMaps.consentButton") }}
      </UiAtomBaseButton>
    </div>

    <div v-show="isReady && hasPreferencesConsent" ref="mapEl"></div>
  </div>
</template>
<script setup lang="ts">
import { IconLoader, IconMapOff } from "@tabler/icons-vue";
import type { Marker as ClusterMarker } from "@googlemaps/markerclusterer";
import { loadGoogleMaps } from "~/composables/useGoogleMaps";
import markerIcon from "~/assets/images/my-circle.svg";

export type Location = {
  id: string | number;
  name: string;
  slug: string;
  newOpeningDate?: string;
  coordinates?: { lat?: number | string; long?: number | string };
  city?: { slug: string };
};

type MarkerClustererInstance = InstanceType<
  typeof import("@googlemaps/markerclusterer").MarkerClusterer
>;

const props = defineProps<{
  locations: Location[];
  fitBoundsLocations?: Location[] | null;
  onMarkerClick?: (loc: Location) => void;
}>();

const { hasPreferencesConsent, openCookieSettings, isReady, didTimeout } =
  useCookiebot();

const emit = defineEmits<{
  (e: "markerClick", loc: Location): void;
}>();

const mapEl = ref<HTMLDivElement | null>(null);
const mapRef = shallowRef<google.maps.Map | null>(null);
const markersRef = shallowRef<ClusterMarker[]>([]);
const clustererRef = shallowRef<MarkerClustererInstance | null>(null);
const MarkerClustererClassRef = shallowRef<
  typeof import("@googlemaps/markerclusterer").MarkerClusterer | null
>(null);
const AdvancedMarkerRef = shallowRef<
  typeof google.maps.marker.AdvancedMarkerElement | null
>(null);

const config = useRuntimeConfig();
const mapId = config.public.googleMapsMapId as string | undefined;
const localePath = useLocalePath();
const router = useRouter();

function openLocation(loc: Location) {
  if (loc.city?.slug && loc.slug) {
    void router.push(
      localePath({
        name: "standorte-citySlug-locationSlug",
        params: { citySlug: loc.city.slug, locationSlug: loc.slug },
      }),
    );
  }
  props.onMarkerClick?.(loc);
  emit("markerClick", loc);
}

function toNum(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function createMarkerContent(): HTMLElement {
  const img = document.createElement("img");
  img.src =
    typeof markerIcon === "string"
      ? markerIcon
      : (markerIcon as { default?: string })?.default ?? "";
  img.alt = "";
  img.width = 32;
  img.height = 32;
  img.style.display = "block";
  img.style.cursor = "pointer";
  return img;
}

function createClusterContent(count: number): HTMLElement {
  const el = document.createElement("div");
  el.textContent = String(count);
  el.style.cssText = [
    "display:inline-flex",
    "align-items:center",
    "justify-content:center",
    "min-width:36px",
    "min-height:36px",
    "width:36px",
    "height:36px",
    "border-radius:50%",
    "background:#333",
    "background-color:#333",
    "color:#fff",
    "font-size:14px",
    "font-weight:700",
    "font-family:inherit",
    "line-height:1",
    "box-shadow:0 2px 6px rgba(0,0,0,0.35)",
    "cursor:pointer",
  ].join(";");
  return el;
}

function cleanup() {
  markersRef.value.forEach((m) => {
    if ("map" in m && m.map != null) {
      (m as google.maps.marker.AdvancedMarkerElement).map = null;
    }
  });
  markersRef.value = [];
  if (clustererRef.value) {
    clustererRef.value.clearMarkers();
    clustererRef.value = null;
  }
}

function teardownMap() {
  cleanup();
  mapRef.value = null;
  MarkerClustererClassRef.value = null;
  AdvancedMarkerRef.value = null;
  if (mapEl.value) {
    mapEl.value.innerHTML = "";
  }
}

function renderMarkers() {
  const map = mapRef.value;
  const AdvancedMarkerElement = AdvancedMarkerRef.value;
  const MarkerClustererClass = MarkerClustererClassRef.value;
  if (!map || !AdvancedMarkerElement || !MarkerClustererClass) return;

  cleanup();

  const bounds = new google.maps.LatLngBounds();
  const markers: ClusterMarker[] = [];

  for (const loc of props.locations ?? []) {
    const lat = toNum(loc.coordinates?.lat);
    const lng = toNum(loc.coordinates?.long);
    if (lat == null || lng == null) continue;

    const position = { lat, lng };
    const marker = new AdvancedMarkerElement({
      position,
      map,
      title: loc.name,
      content: createMarkerContent(),
    });
    marker.addListener("gmp-click", () => openLocation(loc));
    markers.push(marker);
    bounds.extend(position);
  }

  markersRef.value = markers;
  clustererRef.value = new MarkerClustererClass({
    map,
    markers,
    renderer: {
      render: (cluster) =>
        new AdvancedMarkerElement({
          position: cluster.position,
          content: createClusterContent(cluster.count),
        }),
    },
  });

  if (markers.length > 0) {
    if (markers.length === 1) {
      const first = (props.locations ?? []).find(
        (l) =>
          toNum(l.coordinates?.lat) != null &&
          toNum(l.coordinates?.long) != null,
      );
      if (first) {
        const lat = toNum(first.coordinates!.lat)!;
        const lng = toNum(first.coordinates!.long)!;
        map.setCenter({ lat, lng });
        map.setZoom(17);
      }
    } else {
      const boundsToFit =
        props.fitBoundsLocations?.length &&
        props.fitBoundsLocations.some(
          (l) =>
            toNum(l.coordinates?.lat) != null &&
            toNum(l.coordinates?.long) != null,
        )
          ? props.fitBoundsLocations
          : null;

      if (boundsToFit && boundsToFit.length > 0) {
        const fitBounds = new google.maps.LatLngBounds();
        for (const loc of boundsToFit) {
          const lat = toNum(loc.coordinates?.lat);
          const lng = toNum(loc.coordinates?.long);
          if (lat != null && lng != null) fitBounds.extend({ lat, lng });
        }
        if (!fitBounds.isEmpty()) {
          map.fitBounds(fitBounds, {
            top: 48,
            right: 48,
            bottom: 48,
            left: 48,
          });
        } else {
          map.fitBounds(bounds);
        }
      } else {
        map.fitBounds(bounds);
      }
    }
  }
}

async function initMap() {
  if (mapRef.value) return;

  const { MarkerClusterer } = await import("@googlemaps/markerclusterer");
  MarkerClustererClassRef.value = MarkerClusterer;

  await loadGoogleMaps();
  const markerLib = (await google.maps.importLibrary(
    "marker",
  )) as google.maps.MarkerLibrary;
  AdvancedMarkerRef.value = markerLib.AdvancedMarkerElement;

  mapRef.value = new google.maps.Map(mapEl.value!, {
    center: { lat: 51.1657, lng: 10.4515 },
    zoom: 5,
    mapId,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: true,
    rotateControl: false,
    scaleControl: false,
  });

  renderMarkers();
}

onMounted(async () => {
  if (!import.meta.client || !mapEl.value) return;

  if (!mapId) {
    console.warn("Google Maps: mapId fehlt");
  }

  if (!isReady.value) return;
  if (!hasPreferencesConsent.value) return;

  await initMap();
});

watch(
  () => [props.locations, props.fitBoundsLocations],
  () => renderMarkers(),
  { deep: true },
);

watch(hasPreferencesConsent, async (hasConsent) => {
  if (hasConsent) {
    await initMap();
  } else {
    teardownMap();
  }
});

watch(isReady, async (ready) => {
  if (!ready) return;
  // If consent was already granted before Cookiebot finished loading, init now.
  if (hasPreferencesConsent.value) {
    await initMap();
  }
});
</script>
<style scoped>
.locationMap,
.locationMap > div {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.locationMap__loading,
.locationMap__consent {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-400);
  padding: var(--space-600);
  text-align: center;
  color: var(--color-text-muted);
  background-color: var(--color-gray-900);
}

.locationMap__loading :deep(svg),
.locationMap__consent :deep(svg) {
  color: var(--color-text-muted);
}

.locationMap__loading h3,
.locationMap__consent h3 {
  margin: 0;
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
}

.locationMap__consent p {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  max-width: 60ch;
}
</style>
