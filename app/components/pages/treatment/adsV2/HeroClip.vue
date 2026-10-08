<template>
  <!--
    go.-Vorlage v2: stummer Behandlungsclip an der Stelle des Hero-Fotos.
    - Das Poster (vorgeladen, fetchpriority=high) ist das LCP-Element. Der
      Clip bekommt seine Quelle erst, wenn der erste Screen steht
      (whenFirstScreenDone); das erste Videobild ersetzt das Poster im selben
      Element, ohne neuen LCP-Kandidaten. Kein #t=1.
    - iPhone: muted + playsinline, sonst kein Autoplay in der Seite.
    - prefers-reduced-motion / Save-Data: kein Clip, nur das Foto.
    - Pause-Knopf (WCAG 2.2.2), Ausschnitt start..end als Schleife.
    - Die Huelle liegt im Fluss der Karte (kein absolutes inset) und schneidet
      Video und Knopf selbst ab: nichts ragt ueber den Kartenrand.
    - Bildausschnitt je Kartengroesse aus focusY/captionZones
      (heroObjectPositionY): Untertitel ganz drin oder ganz draussen.
  -->
  <div ref="boxRef" class="heroClip">
    <video
      ref="videoRef"
      class="heroClip__video"
      :style="{ objectPosition: `50% ${posY}%` }"
      :src="src"
      :poster="clip.posterUrl || undefined"
      muted
      playsinline
      loop
      autoplay
      preload="none"
      disablepictureinpicture
      aria-hidden="true"
      tabindex="-1"
      @playing="onPlaying"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onMeta"
    />
    <button
      v-if="visible"
      type="button"
      class="heroClip__toggle"
      data-track-placement="v2_hero_clip_pause"
      :aria-label="paused ? 'Video abspielen' : 'Video anhalten'"
      @click="toggle"
    >
      <IconPlayerPlayFilled v-if="paused" size="16" aria-hidden="true" />
      <IconPlayerPauseFilled v-else size="16" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-vue";
import { heroObjectPositionY, type AdsClip } from "#shared/adsClips";
import { whenFirstScreenDone } from "~/lib/firstScreen";

const props = defineProps<{ clip: AdsClip }>();

// Poster frueh und mit hoher Prioritaet laden: Es steht im ersten Screen.
useHead(() =>
  props.clip.posterUrl
    ? {
        link: [
          {
            rel: "preload",
            as: "image",
            href: props.clip.posterUrl,
            fetchpriority: "high",
          },
        ],
      }
    : {},
);

const videoRef = ref<HTMLVideoElement | null>(null);
const boxRef = ref<HTMLElement | null>(null);
// Vorgabe fuer das Server-Rendern: typische Handy-Karte (375 x 667), im
// Browser nach der echten Groesse neu berechnet.
const posY = ref(heroObjectPositionY(336, 200, props.clip));
let resizeObserver: ResizeObserver | null = null;

function updatePosition() {
  const el = boxRef.value;
  if (!el) return;
  const { width, height } = el.getBoundingClientRect();
  if (width > 0 && height > 0) posY.value = heroObjectPositionY(width, height, props.clip);
}
const src = ref<string | undefined>(undefined);
const visible = ref(false);
const paused = ref(false);
let userPaused = false;
let observer: IntersectionObserver | null = null;

function onMeta() {
  const v = videoRef.value;
  if (v && props.clip.start && v.currentTime < props.clip.start) {
    v.currentTime = props.clip.start;
  }
}

function onTimeUpdate() {
  const v = videoRef.value;
  if (!v || props.clip.end == null) return;
  if (v.currentTime >= props.clip.end) v.currentTime = props.clip.start ?? 0;
}

function onPlaying() {
  visible.value = true;
  paused.value = false;
}

function play() {
  const v = videoRef.value;
  if (!v) return;
  const p = v.play();
  if (p && typeof p.catch === "function") {
    // Autoplay abgelehnt (Stromsparmodus, WebView): Foto bleibt stehen.
    p.catch(() => {});
  }
}

function toggle() {
  const v = videoRef.value;
  if (!v) return;
  if (v.paused) {
    userPaused = false;
    play();
  } else {
    userPaused = true;
    v.pause();
    paused.value = true;
  }
}

onMounted(() => {
  updatePosition();
  if (typeof ResizeObserver !== "undefined" && boxRef.value) {
    resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(boxRef.value);
  }

  let allowed = true;
  try {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const saveData = !!(navigator as any).connection?.saveData;
    allowed = !reduced && !saveData;
  } catch {
    // bei Fehlern wie ohne Einschraenkung
  }
  if (!allowed) return;

  whenFirstScreenDone(() => {
    src.value = props.clip.url;
    nextTick(play);
  });

  const el = videoRef.value;
  if (!el || typeof IntersectionObserver === "undefined") return;
  // Aus dem Bild gescrollt: anhalten, zurueck: weiter (sofern nicht per Knopf
  // angehalten).
  observer = new IntersectionObserver((entries) => {
    const v = videoRef.value;
    if (!v || !src.value) return;
    const inView = entries.some((e) => e.isIntersecting);
    if (!inView && !v.paused) v.pause();
    else if (inView && v.paused && !userPaused) play();
  });
  observer.observe(el);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>

<style scoped>
.heroClip {
  position: relative;
  flex: 1 1 auto;
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: var(--border-radius-card-figure);
  /* Safari: abgerundete Ecken schneiden das Video sonst nicht zuverlaessig */
  isolation: isolate;
  background: var(--color-gray-200, #eee);
}

.heroClip__video {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
  background: transparent;
}

.heroClip__toggle {
  position: absolute;
  z-index: 1;
  right: var(--space-300);
  bottom: var(--space-300);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  cursor: pointer;
}
</style>
