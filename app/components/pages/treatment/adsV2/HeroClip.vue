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
  -->
  <div class="heroClip">
    <video
      ref="videoRef"
      class="heroClip__video"
      :style="clip.focus ? { objectPosition: clip.focus } : undefined"
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
import type { AdsClip } from "#shared/adsClips";
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
});
</script>

<style scoped>
.heroClip {
  position: absolute;
  inset: 0;
}

.heroClip__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
  border-radius: var(--border-radius-card-figure);
  background: transparent;
}

.heroClip__toggle {
  position: absolute;
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
