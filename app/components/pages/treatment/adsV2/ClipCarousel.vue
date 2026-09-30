<template>
  <!--
    go.-Vorlage v2: Behandlungsclips statt Vorher/Nachher (Benjamin,
    30.09.2026). Wischbare Reihe 9:16 mit festem Seitenverhaeltnis (kein
    CLS). Quelle erst, wenn der Clip in die Naehe kommt; laeuft stumm und
    inline (iPhone: muted + playsinline), solange er sichtbar ist. Poster statt
    #t=1. Pause- und Ton-Knopf; bei prefers-reduced-motion kein Autoplay, der
    Clip startet erst auf Tippen.
    Von selbst laufen nur die geschnittenen Kurzclips (public/videos/go/,
    ~0,5 MB). Volle Strapi-Videos (2,5-8,5 MB) zeigen ihr Poster und laden
    erst, wenn jemand auf Abspielen tippt (preload=none, keine Quelle vorher).
  -->
  <ul class="clips" role="list">
    <li v-for="(clip, i) in clips" :key="clip.url + i" class="clips__item">
      <div class="clips__frame" :style="{ aspectRatio: String(clip.aspect ?? 9 / 16) }">
        <img
          v-if="clip.posterUrl"
          class="clips__poster"
          :src="clip.posterUrl"
          alt=""
          loading="lazy"
          decoding="async"
          width="360"
          height="640"
        />
        <video
          :ref="(el) => setVideo(i, el as HTMLVideoElement | null)"
          class="clips__video"
          :class="{ 'clips__video--on': state[i]?.started }"
          :src="state[i]?.src"
          :poster="clip.posterUrl || undefined"
          :aria-label="clip.caption || 'Behandlungsclip'"
          muted
          playsinline
          loop
          preload="none"
          disablepictureinpicture
          @playing="onPlaying(i)"
          @pause="onPause(i)"
          @timeupdate="onTimeUpdate(i)"
        />
        <!-- Volles Video: grosse Flaeche zum Antippen, bis es laeuft. -->
        <button
          v-if="!isShort(clip) && !state[i]?.started"
          type="button"
          class="clips__start"
          data-track-placement="v2_clip_play"
          :aria-label="`Video abspielen: ${clip.caption || 'Behandlungsclip'}`"
          @click="toggle(i)"
        >
          <span class="clips__startIcon" aria-hidden="true">
            <IconPlayerPlayFilled size="26" />
          </span>
        </button>
        <div v-else class="clips__controls">
          <button
            type="button"
            class="clips__btn"
            data-track-placement="v2_clip_play"
            :aria-label="state[i]?.playing ? 'Video anhalten' : 'Video abspielen'"
            @click="toggle(i)"
          >
            <IconPlayerPauseFilled v-if="state[i]?.playing" size="18" aria-hidden="true" />
            <IconPlayerPlayFilled v-else size="18" aria-hidden="true" />
          </button>
          <button
            v-if="state[i]?.started"
            type="button"
            class="clips__btn"
            data-track-placement="v2_clip_sound"
            :aria-label="state[i]?.muted === false ? 'Ton aus' : 'Ton an'"
            @click="toggleSound(i)"
          >
            <IconVolume v-if="state[i]?.muted === false" size="18" aria-hidden="true" />
            <IconVolumeOff v-else size="18" aria-hidden="true" />
          </button>
        </div>
      </div>
      <p v-if="clip.caption" class="clips__caption">{{ clip.caption }}</p>
    </li>
  </ul>
</template>

<script setup lang="ts">
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-vue";
import { adsClipIsShort, type AdsClip } from "#shared/adsClips";
import { whenFirstScreenDone } from "~/lib/firstScreen";

const props = defineProps<{ clips: AdsClip[] }>();

type ClipState = {
  src?: string;
  started: boolean;
  playing: boolean;
  muted: boolean;
  userPaused: boolean;
};

const state = reactive<ClipState[]>(
  props.clips.map(() => ({
    src: undefined,
    started: false,
    playing: false,
    muted: true,
    userPaused: false,
  })),
);
const videos: Array<HTMLVideoElement | null> = [];
let autoplay = true;
let firstScreen = false;
let observer: IntersectionObserver | null = null;
const visible = new Set<number>();

const isShort = adsClipIsShort;

function setVideo(i: number, el: HTMLVideoElement | null) {
  videos[i] = el;
}

function load(i: number) {
  const s = state[i];
  if (!s || s.src) return;
  s.src = props.clips[i]!.url;
}

function play(i: number) {
  load(i);
  nextTick(() => {
    const v = videos[i];
    if (!v) return;
    const start = props.clips[i]?.start;
    if (start && v.currentTime < start) v.currentTime = start;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  });
}

function onPlaying(i: number) {
  const s = state[i];
  if (!s) return;
  s.started = true;
  s.playing = true;
}

function onPause(i: number) {
  const s = state[i];
  if (s) s.playing = false;
}

function onTimeUpdate(i: number) {
  const v = videos[i];
  const clip = props.clips[i];
  if (!v || clip?.end == null) return;
  if (v.currentTime >= clip.end) v.currentTime = clip.start ?? 0;
}

function toggle(i: number) {
  const v = videos[i];
  const s = state[i];
  if (!s) return;
  if (v && !v.paused) {
    s.userPaused = true;
    v.pause();
  } else {
    s.userPaused = false;
    play(i);
  }
}

function toggleSound(i: number) {
  const v = videos[i];
  const s = state[i];
  if (!v || !s) return;
  v.muted = !v.muted;
  s.muted = v.muted;
  if (v.paused) play(i);
}

function autoplayVisible() {
  if (!autoplay || !firstScreen) return;
  for (const i of visible) {
    // volle Videos nie von selbst laden
    if (!adsClipIsShort(props.clips[i])) continue;
    if (!state[i]?.userPaused && videos[i]?.paused !== false) play(i);
  }
}

onMounted(() => {
  try {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const saveData = !!(navigator as any).connection?.saveData;
    autoplay = !reduced && !saveData;
  } catch {
    // wie ohne Einschraenkung
  }
  whenFirstScreenDone(() => {
    firstScreen = true;
    autoplayVisible();
  });
  if (typeof IntersectionObserver === "undefined") return;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const i = videos.indexOf(e.target as HTMLVideoElement);
        if (i < 0) continue;
        if (e.isIntersecting) visible.add(i);
        else {
          visible.delete(i);
          const v = videos[i];
          if (v && !v.paused) v.pause();
        }
      }
      autoplayVisible();
    },
    { threshold: 0.6 },
  );
  for (const v of videos) if (v) observer.observe(v);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<style scoped>
.clips {
  display: flex;
  gap: var(--space-400);
  margin: 0;
  padding: 0 0 var(--space-200);
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.clips__item {
  flex: 0 0 auto;
  width: min(62vw, 230px);
  scroll-snap-align: start;
}

.clips__frame {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--border-radius-card-figure, 16px);
  background: var(--color-gray-200);
}

.clips__poster,
.clips__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.clips__video {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.clips__video--on {
  opacity: 1;
}

.clips__controls {
  position: absolute;
  right: var(--space-300);
  bottom: var(--space-300);
  display: flex;
  gap: var(--space-200);
}

.clips__start {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.clips__startIcon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
}

.clips__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  cursor: pointer;
}

.clips__caption {
  margin: var(--space-200) 0 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

@media (min-width: 900px) {
  .clips {
    justify-content: center;
  }
}
</style>
