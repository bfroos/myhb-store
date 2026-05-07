<template>
  <section class="block loc" :class="['theme-strong', { 'block--elevated': elevated }]">
    <div class="loc__layout">
      <!-- MAP -->
      <div class="loc__map" ref="mapRoot">
        <div v-if="!mapReady && !mapError" class="loc__mapPlaceholder">
          <div class="loc__mapSkeleton" aria-hidden="true" />
          <span class="loc__pin">
            <span class="loc__pinDot">MY</span>
          </span>
        </div>
        <div v-if="mapError" class="loc__mapError">
          <IconAlertCircle :size="20" stroke="1.75" />
          <span>{{ mapError }}</span>
        </div>
        <div v-show="mapReady" ref="mapEl" class="loc__mapEl" />
      </div>

      <!-- CONTACT COLUMN -->
      <div class="loc__contact">
        <div class="loc__row">
          <span class="loc__icon">
            <IconMapPin :size="22" stroke="1.75" aria-hidden="true" />
          </span>
          <address class="loc__addr">
            <strong>{{ address.street }}</strong>
            <span>{{ address.zip }} {{ address.city }}</span>
          </address>
        </div>

        <div class="loc__row">
          <span class="loc__icon">
            <IconRoute :size="22" stroke="1.75" aria-hidden="true" />
          </span>
          <a class="loc__pill" :href="directionsUrl" target="_blank" rel="noopener">
            Wegbeschreibung
          </a>
        </div>

        <div v-if="phone" class="loc__row">
          <span class="loc__icon">
            <IconPhone :size="22" stroke="1.75" aria-hidden="true" />
          </span>
          <a class="loc__pill" :href="`tel:${phoneClean}`">
            {{ phone }}
          </a>
        </div>

        <div v-if="whatsapp" class="loc__row">
          <span class="loc__icon">
            <IconBrandWhatsapp :size="22" stroke="1.75" aria-hidden="true" />
          </span>
          <a class="loc__pill" :href="whatsapp" target="_blank" rel="noopener">
            WhatsApp Chat
          </a>
        </div>
      </div>

      <!-- HOURS COLUMN -->
      <div class="loc__hours">
        <div class="loc__hoursHead">
          <IconClock :size="22" stroke="1.75" aria-hidden="true" />
          <strong>{{ openStatus }}</strong>
        </div>
        <dl class="loc__hoursList">
          <template v-for="row in hourRows" :key="row.day">
            <dt :class="{ 'loc__today': row.isToday }">{{ row.day }}</dt>
            <dd :class="{ 'loc__today': row.isToday }">{{ row.value }}</dd>
          </template>
        </dl>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  IconMapPin, IconRoute, IconPhone, IconBrandWhatsapp,
  IconClock, IconAlertCircle,
} from "@tabler/icons-vue";

interface Address { street: string; zip: string; city: string }
interface DayHours { open: string | null; close: string | null } // "HH:MM" or null=closed
interface Hours {
  monday?: DayHours; tuesday?: DayHours; wednesday?: DayHours;
  thursday?: DayHours; friday?: DayHours; saturday?: DayHours; sunday?: DayHours;
}

const props = withDefaults(defineProps<{
  address: Address;
  /** WGS84 coords; if omitted, the map is centered via address geocoding (requires Geocoding API) */
  lat?: number;
  lng?: number;
  phone?: string;
  whatsapp?: string;
  hours?: Hours;
  /** Required for live Google Maps; without it, a styled placeholder is shown. */
  googleMapsApiKey?: string;
  /** Map zoom level */
  zoom?: number;
  elevated?: boolean;
  /** Optional Google Place ID — used to build a richer Directions URL. */
  placeId?: string;
}>(), {
  zoom: 16,
  elevated: true,
  hours: () => ({
    monday:    { open: "10:00", close: "20:00" },
    tuesday:   { open: "10:00", close: "20:00" },
    wednesday: { open: "10:00", close: "20:00" },
    thursday:  { open: "10:00", close: "20:00" },
    friday:    { open: "10:00", close: "20:00" },
    saturday:  { open: "10:00", close: "20:00" },
    sunday:    { open: null,    close: null    },
  }),
});

const mapEl = ref<HTMLElement | null>(null);
const mapRoot = ref<HTMLElement | null>(null);
const mapReady = ref(false);
const mapError = ref<string>("");

const phoneClean = computed(() => (props.phone ?? "").replace(/[^\d+]/g, ""));

const directionsUrl = computed(() => {
  if (props.placeId) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${props.address.street}, ${props.address.zip} ${props.address.city}`,
    )}&destination_place_id=${props.placeId}`;
  }
  if (props.lat != null && props.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${props.lat},${props.lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${props.address.street}, ${props.address.zip} ${props.address.city}`,
  )}`;
});

const DAY_LABELS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const DAY_KEYS: (keyof Hours)[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const todayIdx = computed(() => new Date().getDay());

const hourRows = computed(() => {
  // German week order: Mo .. So
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((idx) => {
    const key = DAY_KEYS[idx];
    const h = props.hours[key];
    const value = h && h.open && h.close ? `${h.open} – ${h.close}` : "Geschlossen";
    return { day: DAY_LABELS[idx], value, isToday: idx === todayIdx.value };
  });
});

const openStatus = computed(() => {
  const today = props.hours[DAY_KEYS[todayIdx.value]];
  if (!today || !today.open || !today.close) return "Heute geschlossen";
  const now = new Date();
  const [oh, om] = today.open.split(":").map(Number);
  const [ch, cm] = today.close.split(":").map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  if (mins < oh * 60 + om) return `Öffnet um ${today.open} Uhr`;
  if (mins >= ch * 60 + cm) return "Heute geschlossen";
  return `Jetzt geöffnet bis ${today.close} Uhr:`;
});

/* ---------- Google Maps loader ---------- */
let mapsScriptPromise: Promise<any> | null = null;
function loadGoogleMaps(apiKey: string) {
  if ((window as any).google?.maps) return Promise.resolve((window as any).google);
  if (mapsScriptPromise) return mapsScriptPromise;
  mapsScriptPromise = new Promise((resolve, reject) => {
    const cb = `__gm_cb_${Math.random().toString(36).slice(2)}`;
    (window as any)[cb] = () => resolve((window as any).google);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&callback=${cb}&libraries=marker&language=de&region=DE`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("Google Maps konnte nicht geladen werden."));
    document.head.appendChild(s);
  });
  return mapsScriptPromise;
}

async function initMap() {
  if (!props.googleMapsApiKey) return;
  if (!mapEl.value) return;
  try {
    const google = await loadGoogleMaps(props.googleMapsApiKey);
    let center: { lat: number; lng: number };
    if (props.lat != null && props.lng != null) {
      center = { lat: props.lat, lng: props.lng };
    } else {
      const geocoder = new google.maps.Geocoder();
      const res = await geocoder.geocode({
        address: `${props.address.street}, ${props.address.zip} ${props.address.city}`,
        region: "de",
      });
      const loc = res.results?.[0]?.geometry?.location;
      if (!loc) throw new Error("Adresse konnte nicht gefunden werden.");
      center = { lat: loc.lat(), lng: loc.lng() };
    }
    const map = new google.maps.Map(mapEl.value, {
      center,
      zoom: props.zoom,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "cooperative",
      backgroundColor: "#ececec",
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "simplified" }] },
      ],
    });
    // Custom MY pin
    const pin = document.createElement("div");
    pin.className = "myhb-gm-pin";
    pin.textContent = "MY";
    new google.maps.marker.AdvancedMarkerElement({
      map, position: center, content: pin, title: `${props.address.street}, ${props.address.city}`,
    });
    mapReady.value = true;
  } catch (e: any) {
    mapError.value = e?.message ?? "Karte konnte nicht geladen werden.";
  }
}

onMounted(initMap);
watch(() => [props.googleMapsApiKey, props.lat, props.lng], initMap);
</script>

<style scoped>
.block {
  border-radius: var(--border-radius-card);
  overflow: hidden;
  background: var(--card-color-bg, #0d0d0e);
  color: var(--color-text, #f5f5f5);
}
.block--elevated { box-shadow: var(--shadow-1); }

.loc__layout {
  display: grid;
  grid-template-columns: 1fr;
}

/* MAP */
.loc__map {
  position: relative;
  background: #ececec;
  aspect-ratio: 16 / 10;
  min-height: 220px;
}
.loc__mapEl, .loc__mapPlaceholder {
  position: absolute;
  inset: 0;
}
.loc__mapSkeleton {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, transparent 49.5%, rgba(0,0,0,0.06) 49.5%, rgba(0,0,0,0.06) 50.5%, transparent 50.5%),
    linear-gradient(to bottom, transparent 49.5%, rgba(0,0,0,0.06) 49.5%, rgba(0,0,0,0.06) 50.5%, transparent 50.5%),
    radial-gradient(circle at 30% 60%, rgba(0,0,0,0.05), transparent 40%),
    #ececec;
}
.loc__pin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
}
.loc__pinDot {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #0d0d0e;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(0,0,0,0.3);
}
.loc__mapError {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-200);
  color: #444;
  font-size: var(--font-sm);
  background: #ececec;
}
:deep(.myhb-gm-pin) {
  width: 36px; height: 36px;
  border-radius: 999px;
  background: #0d0d0e;
  color: #fff;
  font: 700 11px/1 var(--font-family-base, system-ui);
  letter-spacing: 0.06em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(0,0,0,0.3);
}

/* CONTACT */
.loc__contact {
  padding: var(--space-card-pad);
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}
.loc__row {
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: center;
  gap: var(--space-400);
}
.loc__icon {
  color: var(--color-text-light, #b6b6b9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.loc__addr {
  font-style: normal;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.loc__addr strong {
  font-size: var(--font-md);
  font-weight: var(--font-bold, 700);
}
.loc__addr span { font-size: var(--font-sm); color: var(--color-text-light, #b6b6b9); }

.loc__pill {
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-500);
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  color: #fff;
  font-size: var(--font-sm);
  font-weight: var(--font-bold, 700);
  text-decoration: none;
  border: 0;
  transition: background 0.15s linear, transform 0.1s linear;
  width: 100%;
  max-width: 280px;
}
.loc__pill:hover { background: rgba(255,255,255,0.14); }
.loc__pill:active { transform: scale(0.97); }

/* HOURS */
.loc__hours {
  padding: var(--space-card-pad);
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}
.loc__hoursHead {
  display: flex;
  align-items: center;
  gap: var(--space-300);
  color: #fff;
  font-size: var(--font-md);
}
.loc__hoursHead :deep(svg) { color: var(--color-text-light, #b6b6b9); }
.loc__hoursList {
  margin: 0;
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: var(--space-500);
  row-gap: 8px;
  font-size: var(--font-sm);
  color: var(--color-text-light, #b6b6b9);
  font-variant-numeric: tabular-nums;
}
.loc__hoursList dt { font-weight: var(--font-regular); }
.loc__hoursList dd { margin: 0; text-align: right; }
.loc__today { color: #fff; font-weight: var(--font-bold, 700); }

@media (min-width: 720px) {
  .loc__layout {
    grid-template-columns: 1.4fr 1fr 1fr;
  }
  .loc__map {
    aspect-ratio: auto;
    height: 100%;
    min-height: 280px;
  }
  .loc__contact, .loc__hours {
    border-top: 0;
    border-left: 1px solid rgba(255,255,255,0.08);
  }
  .loc__hoursList dd { text-align: left; }
}
</style>
