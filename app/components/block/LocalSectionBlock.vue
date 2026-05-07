<template>
  <section class="block local" :class="[themeClass, { 'block--elevated': elevated }]">
    <h2 v-if="headline" class="local__heading">{{ headline }}</h2>
    <p v-if="text" class="local__text">{{ text }}</p>

    <ul v-if="checks?.length" class="local__checks" role="list">
      <li v-for="item in checks" :key="item" class="local__check">
        <IconCircleCheck :size="20" stroke="1.5" aria-hidden="true" />
        <span>{{ item }}</span>
      </li>
    </ul>

    <figure v-if="map" class="local__map">
      <img v-if="map.src" :src="map.src" :alt="map.alt ?? 'Karte'" />
      <span class="local__pin">
        <IconMapPin :size="18" stroke="2" aria-hidden="true" />
        {{ map.label ?? "Standort" }}
      </span>
    </figure>
  </section>
</template>

<script setup lang="ts">
import { IconCircleCheck, IconMapPin } from "@tabler/icons-vue";

interface MapProp { src?: string; alt?: string; label?: string }

withDefaults(defineProps<{
  headline?: string;
  text?: string;
  checks?: string[];
  map?: MapProp;
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
});
</script>

<style scoped>
.block {
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  padding: var(--space-card-pad);
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
}
.block--elevated { box-shadow: var(--shadow-1); }
.local__heading {
  margin: 0;
  font-size: var(--font-3xl);
  line-height: var(--line-3xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.01em;
}
.local__text {
  margin: 0;
  color: var(--color-text-light);
  font-size: var(--font-md);
  line-height: var(--line-md);
}
.local__checks { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: var(--space-300); }
.local__check {
  display: flex;
  align-items: center;
  gap: var(--space-300);
  font-size: var(--font-md);
}
.local__check :deep(svg) { color: var(--color-text-light); flex-shrink: 0; }
.local__map {
  margin: 0;
  position: relative;
  border-radius: var(--border-radius-card-figure);
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background:
    linear-gradient(to right, transparent 49.5%, rgba(0,0,0,0.06) 49.5%, rgba(0,0,0,0.06) 50.5%, transparent 50.5%),
    linear-gradient(to bottom, transparent 49.5%, rgba(0,0,0,0.06) 49.5%, rgba(0,0,0,0.06) 50.5%, transparent 50.5%),
    var(--color-gray-100);
}
.local__map img { width: 100%; height: 100%; object-fit: cover; display: block; }
.local__pin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  background: #fff;
  color: #000;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  padding: 8px 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: var(--space-200);
  box-shadow: var(--shadow-2);
  white-space: nowrap;
}
@media (min-width: 900px) {
  .block { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-600); align-items: center; padding: var(--space-card-pad-lg, 32px); }
  .local__map { grid-column: 2; grid-row: span 4; height: 100%; aspect-ratio: auto; min-height: 380px; }
  .local__heading { font-size: var(--font-4xl); line-height: var(--line-4xl); }
}
</style>
