<template>
  <section class="block promo" :class="[themeClass, { 'block--elevated': elevated }]">
    <PromoSticker
      class="promo__stamp"
      :src="displayStickerSrc"
      :rotate="rotate"
      size="lg"
      aria-label="20 % auf Deine erste Behandlung"
    />
    <div class="promo__body">
      <p v-if="eyebrow" class="promo__eyebrow">{{ eyebrow }}</p>
      <h2 v-if="headline" class="promo__heading">{{ headline }}</h2>
      <p v-if="text" class="promo__text">{{ text }}</p>
      <ul v-if="checks?.length" class="promo__checks" role="list">
        <li v-for="item in checks" :key="item">
          <IconCircleCheck :size="20" stroke="1.5" aria-hidden="true" />
          <span>{{ item }}</span>
        </li>
      </ul>
      <div v-if="primaryCta || secondaryCta" class="promo__cta">
        <button v-if="primaryCta" type="button" class="button button--primary button--lg button--fullWidth" @click="$emit('primary')">
          {{ primaryCta.label }}
        </button>
        <button v-if="secondaryCta" type="button" class="button button--tertiary button--lg button--fullWidth" @click="$emit('secondary')">
          {{ secondaryCta.label }}
        </button>
      </div>
      <p v-if="finePrint" class="promo__fine">{{ finePrint }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IconCircleCheck } from "@tabler/icons-vue";
import PromoSticker from "../ui/atom/PromoSticker.vue";
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import { mediaUrl } from "~/utils/landingBlockMedia";

interface CtaProp { label: string; to?: string }

const props = withDefaults(defineProps<{
  eyebrow?: string;
  headline?: string;
  text?: string;
  checks?: string[];
  primaryCta?: CtaProp;
  secondaryCta?: CtaProp;
  finePrint?: string;

  // sticker config
  stickerSrc?: string;
  stickerMedia?: StrapiMedia;
  rotate?: number;

  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
  eyebrow: "Nur für kurze Zeit",
  headline: "20 % Willkommens-rabatt für Neukunden.",
  text: "Sichere Dir Deine erste Behandlung mit exklusivem Vorteil. Code wird automatisch im Termin angewendet.",
  checks: () => ["Auf alle Erstbehandlungen", "Nur für Neukunden", "Bis 31.12. einlösbar"],
  primaryCta: () => ({ label: "Jetzt Termin sichern" }),
  secondaryCta: () => ({ label: "Code per E-Mail" }),
  finePrint: "Nicht mit anderen Aktionen kombinierbar. Mehrwertsteuer enthalten.",
  stickerSrc: "/img/promo/promo-sticker-20.jpg",
  rotate: -8,
});

defineEmits<{ primary: []; secondary: [] }>();

const displayStickerSrc = computed(() => mediaUrl(props.stickerMedia) ?? props.stickerSrc);
</script>

<style scoped>
@media (min-width: 900px) {
  .promo__layout { display: grid; grid-template-columns: 1.4fr 1fr; gap: var(--space-700); align-items: center; padding: var(--space-card-pad-lg, 32px); }
  .promo__heading { font-size: var(--font-4xl); line-height: var(--line-4xl); }
}
.block {
  position: relative;
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  padding: var(--space-card-pad);
  overflow: visible;
}
.block--elevated { box-shadow: var(--shadow-1); }
.promo {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
}
.promo__stamp {
  position: absolute;
  top: -16px;
  right: 16px;
  z-index: 2;
}
.promo__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  padding-top: var(--space-700);
}
.promo__eyebrow {
  margin: 0;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-light);
}
.promo__heading {
  margin: 0;
  font-size: var(--font-3xl);
  line-height: var(--line-3xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.01em;
  max-width: 18ch;
}
.promo__text {
  margin: 0;
  color: var(--color-text-light);
  font-size: var(--font-md);
  line-height: var(--line-md);
}
.promo__checks {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  font-size: var(--font-sm);
}
.promo__checks li {
  display: flex;
  align-items: center;
  gap: var(--space-300);
}
.promo__checks :deep(svg) {
  color: var(--color-text-light);
  flex-shrink: 0;
}
.promo__cta {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  margin-top: var(--space-200);
}
.promo__fine {
  margin: 0;
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  line-height: 1.5;
}
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
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s linear;
}
.button--fullWidth { width: 100%; }
.button--primary { background: var(--button-primary-color-bg, #000); color: var(--button-primary-color-text, #fff); }
.button--primary:hover { background: var(--button-primary-color-bg-hover, #292a2c); }
.button--tertiary { background: transparent; color: var(--button-tertiary-color-text, #000); border-color: var(--button-tertiary-color-border, #000); }
.button--tertiary:hover { background: rgba(0,0,0,0.04); }
.button:active { transform: scale(0.97); }
</style>
