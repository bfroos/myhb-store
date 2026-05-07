<template>
  <section class="block seo" :class="[themeClass, { 'block--elevated': elevated }]">
    <details
      v-for="(item, idx) in items"
      :key="item.heading"
      class="seo__item"
      :open="idx === 0 && openFirst"
    >
      <summary class="seo__summary">
        <span class="seo__title">{{ item.heading }}</span>
        <IconChevronDown :size="22" stroke="1.5" class="seo__chev" aria-hidden="true" />
      </summary>
      <div class="seo__body">
        <p v-if="item.text">{{ item.text }}</p>
        <slot :name="`body-${idx}`" :item="item" />
      </div>
    </details>
  </section>
</template>

<script setup lang="ts">
import { IconChevronDown } from "@tabler/icons-vue";

interface SeoItem { heading: string; text?: string }

withDefaults(defineProps<{
  items?: SeoItem[];
  openFirst?: boolean;
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
  openFirst: false,
  items: () => [
    { heading: "Ablauf der Behandlung", text: "Vor der Behandlung besprichst Du in einer kostenlosen Beratung Deine Wünsche mit unseren Ärzten. Der Eingriff selbst dauert 10–20 Minuten." },
    { heading: "Wirkung von Botox",     text: "Botox entspannt gezielt die mimische Muskulatur, die für die Faltenbildung verantwortlich ist." },
    { heading: "Nachsorge & Haltbarkeit", text: "Direkt nach der Behandlung kannst Du Deinen Alltag wie gewohnt fortsetzen. Ergebnisse halten 3–6 Monate." },
  ],
});
</script>

<style scoped>
.block {
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  padding: 0 var(--space-card-pad);
}
.block--elevated { box-shadow: var(--shadow-1); }
.seo__item { border-bottom: 1px solid var(--color-border-mute); }
.seo__item:last-child { border-bottom: 0; }
.seo__summary {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-400);
  padding: var(--space-500) 0;
  cursor: pointer;
  font-size: var(--font-md);
  font-weight: var(--font-bold);
  color: var(--color-text);
}
.seo__summary::-webkit-details-marker { display: none; }
.seo__chev {
  color: var(--color-text-light);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
details[open] .seo__chev { transform: rotate(180deg); }
.seo__body {
  padding: 0 0 var(--space-500);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}
.seo__body p { margin: 0; }
@media (min-width: 900px) {
  .block { padding: 0 var(--space-card-pad-lg, 32px); max-width: 1000px; margin-inline: auto; }
  .seo__summary { font-size: var(--font-lg); padding: var(--space-600) 0; }
}
</style>
