<template>
  <section class="block price" :class="[themeClass, { 'block--elevated': elevated }]">
    <header v-if="headline" class="price__header">
      <h2 class="price__heading">{{ headline }}</h2>
    </header>
    <ul class="price__grid" role="list">
      <li v-for="item in items" :key="item.label" class="price__cell">
        <span class="price__label">{{ item.label }}</span>
        <strong class="price__value">{{ priceFormat(item) }}</strong>
      </li>
    </ul>
    <button v-if="cta" type="button" class="button button--tertiary button--lg button--fullWidth" @click="$emit('cta')">
      {{ cta.label }}
    </button>
  </section>
</template>

<script setup lang="ts">
interface PriceItem { label: string; price: string; from?: boolean }
interface CtaProp { label: string; to?: string }

withDefaults(defineProps<{
  headline?: string;
  items?: PriceItem[];
  cta?: CtaProp;
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
  headline: "Botox Preise in Berlin",
  items: () => [
    { label: "Zornesfalte",  price: "199 €", from: true },
    { label: "Stirnfalten",  price: "249 €", from: true },
    { label: "Krähenfüße",   price: "199 €", from: true },
    { label: "Baby Botox",   price: "249 €", from: true },
  ],
  cta: () => ({ label: "Alle Preise ansehen", to: "/preise" }),
});

function priceFormat(p: PriceItem) { return p.from ? `ab ${p.price}` : p.price; }
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
.price__header { text-align: center; }
.price__heading {
  margin: 0;
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
}
.price__grid {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-300);
}
.price__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-200);
  padding: var(--space-500) var(--space-300);
  border: 1px solid var(--color-border-mute);
  border-radius: var(--border-radius-card-sm);
}
.price__label {
  font-size: var(--font-sm);
  color: var(--color-text-light);
}
.price__value {
  font-size: var(--font-md);
  font-weight: var(--font-bold);
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
@media (min-width: 900px) {
  .block { padding: var(--space-card-pad-lg, 32px); }
  .price__heading { font-size: var(--font-3xl); line-height: var(--line-3xl); }
  .price__grid { grid-template-columns: repeat(4, 1fr); gap: var(--space-400); }
  .price__cell { padding: var(--space-600) var(--space-400); }
  .button { width: auto; align-self: center; padding: 0 var(--space-700); }
}
</style>
