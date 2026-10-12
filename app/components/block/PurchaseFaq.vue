<template>
  <!-- E24 #317: Fragen vor der Buchung (shared/purchaseFaq.ts) -->
  <UiLayoutSectionBlock v-if="faqs.length">
    <section class="pfaq" data-track-placement="purchase_faq">
      <h2 class="pfaq__title">{{ headline }}</h2>
      <details v-for="(f, i) in faqs" :key="f.question" class="pfaq__item" :open="i === 0">
        <summary class="pfaq__q">{{ f.question }}</summary>
        <p class="pfaq__a">{{ f.answer }}</p>
      </details>
    </section>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { PurchaseFaq } from "#shared/purchaseFaq";

defineProps<{ headline: string; faqs: PurchaseFaq[] }>();
</script>

<style scoped>
.pfaq {
  background: var(--color-card-bg-light, #fff);
  border-radius: var(--border-radius-card, 24px);
  padding: var(--space-card-pad);
}
.pfaq__title {
  margin: 0 0 var(--space-400);
  font-size: clamp(1.375rem, 1.1rem + 1vw, 1.875rem);
  font-weight: var(--font-bold);
  line-height: 1.2;
}
.pfaq__item {
  border-bottom: 1px solid var(--color-gray-200, #e5e5e5);
  padding: var(--space-400) 0;
}
.pfaq__q {
  cursor: pointer;
  font-weight: var(--font-bold);
  list-style: none;
  display: flex;
  justify-content: space-between;
  gap: var(--space-500);
}
.pfaq__q::-webkit-details-marker {
  display: none;
}
.pfaq__q::after {
  content: "+";
  font-weight: var(--font-regular);
  font-size: 1.25em;
  line-height: 1;
}
.pfaq__item[open] .pfaq__q::after {
  content: "–";
}
.pfaq__a {
  margin: var(--space-300) 0 0;
  line-height: 1.6;
}
</style>
