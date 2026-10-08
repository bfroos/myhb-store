<template>
  <video
    ref="videoRef"
    class="mediaVideo"
    :src="boundSrc"
    :poster="posterSrc"
    :playsinline="normalizedVideoSettings?.playsInline || autoplayActive || undefined"
    :autoplay="autoplayActive"
    :muted="autoplayActive"
    :loop="autoplayActive"
    :controls="!autoplayActive"
    :preload="videoPreloadAttr"
    @error="onVideoError"
  />
</template>
<script setup lang="ts">
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import type { SharedVideoSettingsDto } from "~/lib/strapi/dto/components";
import { ImageFormat } from "~/lib/strapi/dto/enums";
import {
  buildVideoPosterUrl,
  buildTransformedVideoUrl,
  getMediaUrl,
  getMediaZoneOrigin,
} from "~/utils/media";
import { whenFirstScreenDone } from "~/lib/firstScreen";

/**
 * Ladeschema fuer Videos (#180).
 *
 * Gemessen am 30.09.2026 (Lighthouse mobil, go. Koeln Lippen): Die zwei
 * Ergebnis-Videos weiter unten holten mit `preload="metadata"` und
 * `fetchpriority="high"` sofort je ~1,6 MB — parallel zum Hero-Bild. Jetzt:
 *
 * - Ohne Autoplay: `preload="none"`, bis das Video auf 600 px an den Viewport
 *   herankommt UND der erste Screen steht (load + LCP); dann `metadata` (zeigt
 *   mit `#t=1` das erste Bild). Auf Koeln Lippen ragt das erste Video schon in
 *   den ersten Screen — ohne die zweite Bedingung liefe es wieder parallel zum
 *   Hero-Bild.
 * - Mit Autoplay (auch ein kuenftiger Hero-Clip): die `src` kommt erst unter
 *   denselben Bedingungen (Autoplay ignoriert `preload`). Bis dahin steht das
 *   Poster — das ist dann der LCP-Kandidat, nicht das Video. Fuer einen Clip
 *   oben auf der Seite `priority` setzen, damit das Poster vorlaedt.
 * - Kein Autoplay bei `prefers-reduced-motion: reduce` oder Save-Data: dann
 *   Poster plus Bedienelemente, geladen wird erst auf Tippen.
 * - `poster` geht durch die Cloudflare-Bildtransformation (AVIF/WebP, 760 px)
 *   statt als Originaldatei; `priority` laedt es vor wie ein Hero-Bild.
 */
const props = defineProps<{
  media: StrapiMedia;
  poster?: StrapiMedia;
  videoSettings?: SharedVideoSettingsDto;
  /** Oben auf der Seite: Poster frueh und mit hoher Prioritaet laden. */
  priority?: boolean;
}>();

const normalizedVideoSettings = computed<SharedVideoSettingsDto | undefined>(
  () => {
    const v = props.videoSettings as any;
    if (!v) return undefined;
    return Array.isArray(v) ? v[0] : v;
  },
);

// Track whether we should bypass Cloudflare media transformations and fall back to the original URL.
const forceOriginal = ref(false);

const hasAutoplay = computed<boolean>(
  () => !!normalizedVideoSettings.value?.autoplay,
);

/**
 * Darf sich hier etwas von selbst bewegen? Erst im Browser bekannt; bis dahin
 * (SSR, Hydrierung) gilt ja, damit Server und Client dasselbe zeichnen.
 */
const motionAllowed = ref(true);
const autoplayActive = computed(() => hasAutoplay.value && motionAllowed.value);

const originalVideoUrl = computed(() => props.media?.url ?? "");

const canUseTransformations = computed(() => {
  if (forceOriginal.value) return false;
  const src = originalVideoUrl.value;
  if (!src) return false;
  return !!getMediaZoneOrigin(src);
});

const videoSrc = computed(() => {
  const src = originalVideoUrl.value;
  if (!src) return "";

  let finalSrc = src;
  if (canUseTransformations.value) {
    finalSrc = buildTransformedVideoUrl(src, { audio: !hasAutoplay.value });
  }

  // iOS Safari: Add #t=1 fragment to show frame at 1 second as poster fallback
  // This is a native browser feature that works without JavaScript
  if (finalSrc && !props.poster?.url && !finalSrc.includes("#t=")) {
    return `${finalSrc}#t=1`;
  }

  return finalSrc;
});

const posterSrc = computed<string | undefined>(() => {
  if (props.poster?.url) {
    return getMediaUrl(props.poster, ImageFormat.MEDIUM) ?? props.poster.url;
  }

  const src = originalVideoUrl.value;
  if (!src) return undefined;
  if (!canUseTransformations.value) return undefined;

  return buildVideoPosterUrl(src) || undefined;
});

// Hero-Clip: Das Poster ist das, was im ersten Screen steht — es soll so frueh
// laden wie ein Hero-Bild. Ein `poster`-Attribut entdeckt der Browser erst
// spaet und mit niedriger Prioritaet.
useHead(() =>
  props.priority && posterSrc.value
    ? {
        link: [
          {
            rel: "preload",
            as: "image",
            href: posterSrc.value,
            fetchpriority: "high",
          },
        ],
      }
    : {},
);

function onVideoError() {
  // If the transformed video/poster fails (e.g. transformations disabled), fall back to the original URL.
  if (!forceOriginal.value) {
    forceOriginal.value = true;
  }
}

const videoRef = ref<HTMLVideoElement | null>(null);
const firstScreenDone = ref(false);
/**
 * Hoechstens 600 px ausserhalb des Viewports. Bewusst ohne "erst beim
 * Scrollen": Die Videos haben in Strapi keine Masse; ihre Hoehe steht erst mit
 * den Metadaten fest (gemessen: 150 px -> 660 px). Laedt das, waehrend jemand
 * darauf zuscrollt, springt der Inhalt darunter sichtbar (CLS). Nahe am
 * Viewport, aber noch darunter, faellt der Sprung nicht ins Gewicht.
 */
const isNearViewport = ref(false);
let nearObserver: IntersectionObserver | null = null;

onMounted(() => {
  try {
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const saveData = !!(navigator as any).connection?.saveData;
    motionAllowed.value = !reduced && !saveData;
  } catch {
    // matchMedia/connection fehlen: bei Autoplay bleiben
  }

  whenFirstScreenDone(() => {
    firstScreenDone.value = true;
  });

  const el = videoRef.value;
  if (!el || typeof IntersectionObserver === "undefined") {
    isNearViewport.value = true;
    return;
  }
  nearObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      isNearViewport.value = true;
      nearObserver?.disconnect();
      nearObserver = null;
    },
    { rootMargin: "600px 0px" },
  );
  nearObserver.observe(el);
});

onBeforeUnmount(() => {
  nearObserver?.disconnect();
  nearObserver = null;
});

const boundSrc = computed(() => {
  // Autoplay ignoriert `preload` und laedt sofort — deshalb gibt es die Quelle
  // erst, wenn sie gebraucht wird und das erste Bild steht.
  if (autoplayActive.value && !mayLoad.value) return undefined;
  return videoSrc.value || undefined;
});

/** Nah genug am Viewport und der erste Screen steht — erst dann laden. */
const mayLoad = computed(() => isNearViewport.value && firstScreenDone.value);

const videoPreloadAttr = computed<"none" | "metadata" | "auto">(() => {
  if (!mayLoad.value) return "none";
  if (autoplayActive.value) return "auto";
  // Ohne Autoplay mit Poster (auch bei reduzierter Bewegung): erst auf Tippen.
  if (posterSrc.value) return "none";
  return "metadata";
});

// preload none -> metadata startet das Laden nicht in jedem Browser von selbst;
// load() stoesst die Ressourcenauswahl neu an. Nur solange noch nichts geladen
// ist und nichts laedt (networkState 2 = NETWORK_LOADING), sonst gaebe es eine
// zweite Anfrage oder ein laufendes Video wuerde zurueckgesetzt.
watch(mayLoad, (ok) => {
  if (!ok) return;
  nextTick(() => {
    const el = videoRef.value;
    if (!el || autoplayActive.value) return;
    if (videoPreloadAttr.value !== "metadata") return;
    if (el.readyState === 0 && el.networkState !== 2 && el.paused) el.load();
  });
});
</script>
<style scoped>
.mediaVideo {
  object-fit: contain;
  background: var(--color-black);
}

.mediaVideo:fullscreen,
.mediaVideo:-webkit-full-screen,
.mediaVideo:-moz-full-screen,
.mediaVideo:-ms-fullscreen {
  object-fit: contain;
  background: var(--color-black);
}
</style>
