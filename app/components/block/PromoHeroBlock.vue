<template>
  <section class="block hero-promo" :class="[themeClass, { 'block--elevated': elevated }]">
    <div class="hero-promo__media">
      <img v-if="displayImage?.src" :src="displayImage.src" :alt="displayImage.alt ?? ''" />
      <PromoSticker
        class="hero-promo__sticker"
        :src="displayStickerSrc"
        size="xl"
        :rotate="-10"
        aria-label="20 % auf Deine erste Behandlung"
      />
    </div>
    <div class="hero-promo__body">
      <p v-if="eyebrow" class="hero-promo__eyebrow">{{ eyebrow }}</p>
      <h2 class="hero-promo__heading">{{ headline }}</h2>
      <p v-if="text" class="hero-promo__text">{{ text }}</p>
      <button type="button" class="button button--primary button--lg button--fullWidth" @click="$emit('cta')">
        {{ cta.label }}
      </button>
      <p v-if="finePrint" class="hero-promo__fine">{{ finePrint }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PromoSticker from "../ui/atom/PromoSticker.vue";
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import { mediaToLegacyImage, mediaUrl } from "~/utils/landingBlockMedia";

interface CtaProp { label: string; to?: string }
interface ImageProp { src: string; alt?: string }

const props = withDefaults(defineProps<{
  eyebrow?: string;
  headline?: string;
  text?: string;
  image?: ImageProp;
  imageMedia?: StrapiMedia;
  cta?: CtaProp;
  finePrint?: string;
  stickerSrc?: string;
  stickerMedia?: StrapiMedia;
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
  eyebrow: "Aktion für Neukunden",
  headline: "Starte mit 20 % auf Deine erste Behandlung.",
  text: "Egal ob Botox, Hyaluron oder Hautpflege — Dein Einstieg ist günstiger.",
  cta: () => ({ label: "Aktion einlösen" }),
  finePrint: "Nur einmalig pro Person, nicht kombinierbar.",
  stickerSrc: "/img/promo/promo-sticker-20.jpg",
});

defineEmits<{ cta: [] }>();

const displayImage = computed(() => mediaToLegacyImage(props.imageMedia) ?? props.image);
const displayStickerSrc = computed(() => mediaUrl(props.stickerMedia) ?? props.stickerSrc);
</script>

<style scoped>
.block {
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  overflow: hidden;
  position: relative;
}
.block--elevated { box-shadow: var(--shadow-1); }
.hero-promo__media {
  position: relative;
  aspect-ratio: 4/3;
  background: var(--color-gray-200);
}
.hero-promo__media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hero-promo__sticker {
  position: absolute;
  bottom: -36px;
  right: 16px;
  z-index: 2;
}
.hero-promo__body {
  padding: var(--space-card-pad);
  padding-top: calc(var(--space-card-pad) + 24px);
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}
.hero-promo__eyebrow {
  margin: 0;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-light);
}
.hero-promo__heading {
  margin: 0;
  font-size: var(--font-3xl);
  line-height: var(--line-3xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.01em;
}
.hero-promo__text { margin: 0; color: var(--color-text-light); font-size: var(--font-md); line-height: var(--line-md); }
.hero-promo__fine { margin: 0; font-size: var(--font-xs); color: var(--color-text-muted); }
.button {
  height: var(--control-height-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 calc(var(--control-height-lg) / 2);
  border-radius: 999px;
  border: 2px solid transparent;
  font: inherit;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: all 0.15s linear;
}
.button--fullWidth { width: 100%; }
.button--primary { background: var(--button-primary-color-bg, #000); color: var(--button-primary-color-text, #fff); }
.button--primary:hover { background: var(--button-primary-color-bg-hover, #292a2c); }
.button:active { transform: scale(0.97); }
@media (min-width: 900px) {
  .block { display: grid; grid-template-columns: 1fr 1fr; align-items: center; }
  .hero-promo__media { aspect-ratio: auto; height: 100%; min-height: 460px; }
  .hero-promo__sticker { bottom: auto; top: 24px; right: -36px; }
  .hero-promo__body { padding: var(--space-700); padding-top: var(--space-700); }
  .hero-promo__heading { font-size: var(--font-4xl); line-height: var(--line-4xl); }
  .button { width: auto; align-self: start; padding: 0 var(--space-700); }
}
</style>
