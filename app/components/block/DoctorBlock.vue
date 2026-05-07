<template>
  <section class="block doc" :class="[themeClass, { 'block--elevated': elevated }]">
    <p v-if="eyebrow" class="doc__eyebrow">{{ eyebrow }}</p>
    <h2 v-if="headline" class="doc__heading">{{ headline }}</h2>
    <p v-if="text" class="doc__text">{{ text }}</p>

    <figure v-if="image" class="doc__figure">
      <img :src="image.src" :alt="image.alt ?? 'Arzt'" loading="lazy" />
    </figure>

    <ul v-if="checks?.length" class="doc__checks" role="list">
      <li v-for="item in checks" :key="item" class="doc__check">
        <IconCircleCheck :size="22" stroke="1.5" aria-hidden="true" />
        <span>{{ item }}</span>
      </li>
    </ul>

    <button v-if="cta" type="button" class="button button--tertiary button--lg button--fullWidth" @click="$emit('cta')">
      {{ cta.label }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { IconCircleCheck } from "@tabler/icons-vue";

interface ImageProp { src: string; alt?: string }
interface CtaProp { label: string; to?: string }

withDefaults(defineProps<{
  eyebrow?: string;
  headline?: string;
  text?: string;
  image?: ImageProp;
  checks?: string[];
  cta?: CtaProp;
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
});

defineEmits<{ cta: [] }>();
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
.doc__eyebrow {
  margin: 0;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-light);
}
.doc__heading {
  margin: 0;
  font-size: var(--font-3xl);
  line-height: var(--line-3xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.01em;
}
.doc__text {
  margin: 0;
  color: var(--color-text-light);
  font-size: var(--font-md);
  line-height: var(--line-md);
}
.doc__figure {
  margin: 0;
  border-radius: var(--border-radius-card-figure);
  overflow: hidden;
  background: var(--color-gray-200);
  aspect-ratio: 4 / 3;
}
.doc__figure img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
@media (min-width: 900px) {
  .block { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-600); align-items: center; padding: var(--space-card-pad-lg, 32px); }
  .doc__figure { grid-row: span 5; aspect-ratio: 4 / 5; height: 100%; }
  .doc__heading { font-size: var(--font-4xl); line-height: var(--line-4xl); }
  .button { width: auto; align-self: start; padding: 0 var(--space-700); }
}
.doc__checks {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}
.doc__check {
  display: flex;
  align-items: center;
  gap: var(--space-400);
  font-size: var(--font-md);
  color: var(--color-text);
}
.doc__check :deep(svg) {
  flex-shrink: 0;
  color: var(--color-text-light);
}
.button {
  height: var(--control-height-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 calc(var(--control-height-lg) / 2);
  border-radius: 999px;
  border: 2px solid var(--button-tertiary-color-border, #000);
  font: inherit;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  line-height: 1;
  cursor: pointer;
  background: transparent;
  color: var(--button-tertiary-color-text, #000);
  transition: all 0.15s linear;
}
.button--fullWidth { width: 100%; }
.button:hover { background: rgba(0,0,0,0.04); }
.button:active { transform: scale(0.97); }
</style>
