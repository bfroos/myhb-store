<template>
  <section class="block ba" :class="[themeClass, { 'block--elevated': elevated }]">
    <header v-if="headline" class="ba__header">
      <h2 class="ba__heading">{{ headline }}</h2>
    </header>
    <div class="ba__viewport">
      <figure
        class="ba__figure"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <img class="ba__img ba__img--after" :src="current.afterSrc" :alt="current.afterAlt ?? 'Nachher'" />
        <div class="ba__before-wrap" :style="{ width: percent + '%' }">
          <img class="ba__img ba__img--before" :src="current.beforeSrc" :alt="current.beforeAlt ?? 'Vorher'" />
        </div>

        <span class="ba__label ba__label--before">Vorher</span>
        <span class="ba__label ba__label--after">Nachher</span>

        <button
          type="button"
          class="ba__handle"
          :style="{ left: percent + '%' }"
          aria-label="Vergleich verschieben"
          @keydown.left.prevent="percent = Math.max(0, percent - 5)"
          @keydown.right.prevent="percent = Math.min(100, percent + 5)"
        >
          <IconChevronLeft :size="16" stroke="2" />
          <IconChevronRight :size="16" stroke="2" />
        </button>
      </figure>
    </div>

    <ol v-if="pairs.length > 1" class="ba__dots" role="tablist">
      <li v-for="(_, i) in pairs" :key="i">
        <button
          type="button"
          :class="['ba__dot', { 'ba__dot--active': i === index }]"
          :aria-label="`Beispiel ${i + 1}`"
          @click="index = i"
        />
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-vue";

interface Pair { beforeSrc: string; afterSrc: string; beforeAlt?: string; afterAlt?: string }

const props = withDefaults(defineProps<{
  headline?: string;
  pairs?: Pair[];
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
  pairs: () => [],
});

const index = ref(0);
const percent = ref(50);
const current = computed(() => props.pairs[index.value] ?? { beforeSrc: "", afterSrc: "" });

let dragging = false;
function onPointerDown(e: PointerEvent) { dragging = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); update(e); }
function onPointerMove(e: PointerEvent) { if (dragging) update(e); }
function onPointerUp() { dragging = false; }
function update(e: PointerEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const x = e.clientX - rect.left;
  percent.value = Math.max(0, Math.min(100, (x / rect.width) * 100));
}
</script>

<style scoped>
.block {
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  padding: var(--space-card-figure-pad);
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}
.block--elevated { box-shadow: var(--shadow-1); }
.ba__header { padding: var(--space-300) var(--space-400) 0; text-align: center; }
.ba__heading {
  margin: 0;
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
}
.ba__viewport { position: relative; }
.ba__figure {
  position: relative;
  margin: 0 auto;
  max-width: 960px;
  width: 100%;
  border-radius: var(--border-radius-card-figure);
  overflow: hidden;
  aspect-ratio: 16 / 10;
  background: var(--color-gray-200);
  user-select: none;
  touch-action: none;
}
@media (min-width: 900px) {
  .ba__figure { aspect-ratio: 21 / 9; }
  .ba__heading { font-size: var(--font-3xl); line-height: var(--line-3xl); }
}
.ba__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}
.ba__before-wrap {
  position: absolute;
  inset: 0;
  width: 50%;
  overflow: hidden;
}
.ba__before-wrap .ba__img--before {
  width: 100vmax; /* maintain aspect — re-uses the same crop */
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ba__before-wrap { will-change: width; }
.ba__before-wrap .ba__img--before {
  /* override inherited width from above */
  width: 100%;
}
.ba__label {
  position: absolute;
  bottom: 12px;
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(13, 13, 14, 0.55);
  color: #fff;
  backdrop-filter: blur(8px);
}
.ba__label--before { left: 12px; }
.ba__label--after  { right: 12px; }
.ba__handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: #fff;
  color: #000;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  border: 0;
  box-shadow: var(--shadow-3);
  cursor: ew-resize;
}
.ba__handle::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 200vh;
  background: rgba(255,255,255,0.9);
  transform: translate(-50%, -50%);
  z-index: -1;
}
.ba__dots {
  list-style: none;
  margin: 0;
  padding: var(--space-200) 0 var(--space-200);
  display: flex;
  justify-content: center;
  gap: var(--space-200);
}
.ba__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--color-gray-300);
  border: 0;
  cursor: pointer;
  padding: 0;
  transition: background 0.15s linear;
}
.ba__dot--active { background: var(--color-text); }
@media (min-width: 900px) {
  .block { max-width: 1100px; margin-inline: auto; }
  .ba__figure { aspect-ratio: 21 / 9; }
}
</style>
