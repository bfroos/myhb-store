<template>
  <section class="block hero" :class="[themeClass, { 'block--elevated': elevated }]">
    <div class="hero__body">
      <p v-if="eyebrow" class="hero__eyebrow">{{ eyebrow }}</p>
      <h1 v-if="headline" class="hero__title">{{ headline }}</h1>
      <p v-if="text" class="hero__text">{{ text }}</p>

      <ul v-if="checks?.length" class="hero__checks" role="list">
        <li v-for="item in checks" :key="item" class="hero__check">
          <IconCircleCheck :size="22" stroke="1.5" aria-hidden="true" />
          <span>{{ item }}</span>
        </li>
      </ul>

      <div class="hero__cta">
        <button v-if="primaryCta" type="button" class="button button--primary button--lg button--fullWidth" @click="$emit('primary')">
          {{ primaryCta.label }}
        </button>
        <button v-if="secondaryCta" type="button" class="button button--tertiary button--lg button--fullWidth" @click="$emit('secondary')">
          {{ secondaryCta.label }}
        </button>
        <p v-if="priceLabel" class="hero__price">{{ priceLabel }}</p>
      </div>
    </div>

    <figure v-if="displayImage" class="hero__figure">
      <img :src="displayImage.src" :alt="displayImage.alt ?? ''" loading="eager" />
    </figure>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IconCircleCheck } from "@tabler/icons-vue";
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import { mediaToLegacyImage } from "~/utils/landingBlockMedia";

interface CtaProp { label: string; to?: string }
interface ImageProp { src: string; alt?: string }

const props = withDefaults(defineProps<{
  eyebrow?: string;
  headline?: string;
  text?: string;
  checks?: string[];
  primaryCta?: CtaProp;
  secondaryCta?: CtaProp;
  priceLabel?: string;
  image?: ImageProp;
  imageMedia?: StrapiMedia;
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
});

defineEmits<{ primary: []; secondary: [] }>();

const displayImage = computed(() => mediaToLegacyImage(props.imageMedia) ?? props.image);
</script>

<style scoped>
.block {
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  overflow: hidden;
}
.block--elevated {
  box-shadow: var(--shadow-1);
}
.hero__body {
  padding: var(--space-card-pad);
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
}
.hero__eyebrow {
  margin: 0;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-light);
}
.hero__title {
  margin: 0;
  font-size: var(--font-4xl);
  line-height: var(--line-4xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.01em;
}
.hero__text {
  margin: 0;
  color: var(--color-text-light);
  font-size: var(--font-md);
  line-height: var(--line-md);
}
.hero__checks {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}
.hero__check {
  display: flex;
  align-items: center;
  gap: var(--space-400);
  font-size: var(--font-md);
  font-weight: var(--font-bold);
  color: var(--color-text);
}
.hero__check :deep(svg) {
  flex-shrink: 0;
  color: var(--color-text-light);
}
.hero__cta {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  margin-top: var(--space-300);
}
.hero__price {
  margin: 0;
  text-align: center;
  font-size: var(--font-sm);
  color: var(--color-text-light);
}
.hero__figure {
  margin: 0;
  padding: var(--space-card-figure-pad);
  padding-top: 0;
}
.hero__figure img {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  border-radius: var(--border-radius-card-figure);
}

/* Local pill-button rules so the SFC works without depending on a global .button stylesheet.
   The store's BaseButton already styles .button — these are intentionally compatible. */
.button {
  height: var(--control-height-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-200);
  padding: 0 calc(var(--control-height-md) / 2);
  border-radius: 999px;
  border: 2px solid transparent;
  font: inherit;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s linear;
  background: transparent;
  color: inherit;
}
.button--lg { height: var(--control-height-lg); padding-inline: calc(var(--control-height-lg) / 2); }
.button--fullWidth { width: 100%; }
.button--primary {
  background: var(--button-primary-color-bg, #000);
  color: var(--button-primary-color-text, #fff);
}
.button--primary:hover { background: var(--button-primary-color-bg-hover, #292a2c); }
.button--tertiary {
  background: transparent;
  color: var(--button-tertiary-color-text, #000);
  border-color: var(--button-tertiary-color-border, #000);
}
.button--tertiary:hover { background: rgba(0,0,0,0.04); }
.button:active:not(:disabled) { transform: scale(0.97); }

@media (min-width: 600px) {
  .hero__title { font-size: var(--font-5xl); line-height: var(--line-5xl); }
}
@media (min-width: 900px) {
  .block { display: flex; flex-direction: row-reverse; align-items: stretch; }
  .hero__body { flex: 1 0 50%; padding: var(--space-card-pad); justify-content: center; }
  .hero__figure { flex: 1 0 50%; padding: var(--space-card-figure-pad); padding-right: 0; }
  .hero__figure img { height: 100%; aspect-ratio: auto; min-height: 480px; }
  .hero__cta { flex-direction: row; flex-wrap: wrap; }
  .hero__cta .button { width: auto; flex: 0 1 auto; }
  .hero__price { flex-basis: 100%; text-align: left; }
}
</style>
