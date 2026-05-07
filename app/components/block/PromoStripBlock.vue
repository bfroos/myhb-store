<template>
  <section class="block promo-strip">
    <PromoSticker
      class="promo-strip__stamp"
      :src="stickerSrc"
      size="sm"
      :rotate="-12"
      aria-label="20 % auf Deine erste Behandlung"
    />
    <div class="promo-strip__body">
      <strong class="promo-strip__title">{{ headline }}</strong>
      <span v-if="text" class="promo-strip__text">{{ text }}</span>
    </div>
    <button v-if="cta" type="button" class="button button--primary button--md" @click="$emit('cta')">
      {{ cta.label }}
    </button>
  </section>
</template>

<script setup lang="ts">
import PromoSticker from "../ui/atom/PromoSticker.vue";

interface CtaProp { label: string; to?: string }

withDefaults(defineProps<{
  headline?: string;
  text?: string;
  stickerSrc?: string;
  cta?: CtaProp;
}>(), {
  headline: "20 % Neukunden-Aktion",
  text: "Auf Deine erste Behandlung",
  stickerSrc: "/img/promo/promo-sticker-20.jpg",
  cta: () => ({ label: "Einlösen" }),
});

defineEmits<{ cta: [] }>();
</script>

<style scoped>
.block {
  position: relative;
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  box-shadow: var(--shadow-1);
}
.promo-strip {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-400);
  padding: var(--space-500) var(--space-card-pad);
}
.promo-strip__stamp { flex-shrink: 0; }
.promo-strip__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.promo-strip__title {
  font-size: var(--font-md);
  font-weight: var(--font-bold);
  letter-spacing: -0.01em;
}
.promo-strip__text {
  font-size: var(--font-sm);
  color: var(--color-text-light);
}
.button {
  height: var(--control-height-md);
  padding: 0 calc(var(--control-height-md) / 2);
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font: inherit;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.15s linear;
}
.button--primary { background: var(--button-primary-color-bg, #000); color: var(--button-primary-color-text, #fff); }
.button--primary:hover { background: var(--button-primary-color-bg-hover, #292a2c); }
.button:active { transform: scale(0.97); }
</style>
