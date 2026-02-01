<template>
  <div ref="mapEl" class="locationMapMarkers"></div>
</template>
<script setup lang="ts">
import markerClustererPkg from "@googlemaps/markerclusterer";
import type { Marker as ClusterMarker } from "@googlemaps/markerclusterer";
import { loadGoogleMaps } from "~/composables/useGoogleMaps";
import markerIcon from "~/assets/images/my-circle.svg";

type MarkerClustererType = InstanceType<typeof MarkerClusterer>;

export type Location = {
  id: string | number;
  name: string;
  slug: string;
  newOpeningDate?: string;
  coordinates?: { lat?: number | string; long?: number | string };
};

const { MarkerClusterer } = markerClustererPkg;

const props = defineProps<{
  locations: Location[];
  fitBoundsLocations?: Location[] | null;
  onMarkerClick?: (loc: Location) => void;
}>();

const emit = defineEmits<{
  (e: "markerClick", loc: Location): void;
}>();

const mapEl = ref<HTMLDivElement | null>(null);
const mapRef = shallowRef<google.maps.Map | null>(null);
const markersRef = shallowRef<ClusterMarker[]>([]);
const clustererRef = shallowRef<MarkerClustererType | null>(null);
const AdvancedMarkerRef = shallowRef<
  typeof google.maps.marker.AdvancedMarkerElement | null
>(null);

const config = useRuntimeConfig();
const mapId = config.public.googleMapsMapId as string | undefined;

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

function renderMarkers() {
  const map = mapRef.value;
  const AdvancedMarkerElement = AdvancedMarkerRef.value;
  if (!map || !AdvancedMarkerElement) return;

  cleanup();

  const bounds = new google.maps.LatLngBounds();
  const markers: ClusterMarker[] = [];

  for (const loc of props.locations) {
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
    marker.addListener("gmp-click", () => {
      props.onMarkerClick?.(loc);
      emit("markerClick", loc);
    });
    markers.push(marker);
    bounds.extend(position);
  }

  markersRef.value = markers;
  clustererRef.value = new MarkerClusterer({
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
        map.fitBounds(fitBounds, { top: 48, right: 48, bottom: 48, left: 48 });
      } else {
        map.fitBounds(bounds);
      }
    } else {
      map.fitBounds(bounds);
    }
  }
}

onMounted(async () => {
  if (!import.meta.client || !mapEl.value) return;

  if (!mapId) {
    console.warn("Google Maps: mapId fehlt");
  }

  await loadGoogleMaps();
  const markerLib = (await google.maps.importLibrary(
    "marker",
  )) as google.maps.MarkerLibrary;
  AdvancedMarkerRef.value = markerLib.AdvancedMarkerElement;

  mapRef.value = new google.maps.Map(mapEl.value, {
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
});

watch(
  () => [props.locations, props.fitBoundsLocations],
  () => renderMarkers(),
  { deep: true },
);

onUnmounted(() => {
  cleanup();
  mapRef.value = null;
});
</script>
<style scoped>
.locationMapMarkers {
  width: 100%;
  height: 100%;
}
</style>
