<template>
  <section class="block faq" :class="[themeClass, { 'block--elevated': elevated }]">
    <header v-if="headline" class="faq__header">
      <h2 class="faq__heading">{{ headline }}</h2>
    </header>
    <ul class="faq__list" role="list">
      <li v-for="item in items" :key="item.q">
        <details class="faq__item">
          <summary class="faq__summary">
            <span class="faq__q">{{ item.q }}</span>
            <IconChevronDown :size="22" stroke="1.5" class="faq__chev" aria-hidden="true" />
          </summary>
          <p class="faq__a">{{ item.a }}</p>
        </details>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { IconChevronDown } from "@tabler/icons-vue";

interface FaqItem { q: string; a: string }

withDefaults(defineProps<{
  headline?: string;
  items?: FaqItem[];
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
  headline: "Häufige Fragen zu Botox",
  items: () => [
    { q: "Tut Botox weh?", a: "Die Behandlung erfolgt mit sehr feinen Nadeln und ist meist gut verträglich." },
    { q: "Wie lange dauert die Behandlung?", a: "In der Regel 10–20 Minuten — auch in der Mittagspause möglich." },
    { q: "Wann sehe ich die ersten Ergebnisse?", a: "Erste Effekte zeigen sich nach 3–5 Tagen, das volle Ergebnis nach ca. 14 Tagen." },
    { q: "Wie lange hält das Ergebnis?", a: "Üblicherweise 3–6 Monate, abhängig von Stoffwechsel und Muskulatur." },
    { q: "Für wen ist Botox nicht geeignet?", a: "Während Schwangerschaft und Stillzeit sowie bei bestimmten Erkrankungen wird Botox nicht angewendet." },
  ],
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
  gap: var(--space-400);
}
.block--elevated { box-shadow: var(--shadow-1); }
.faq__header { text-align: center; }
.faq__heading {
  margin: 0;
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
}
.faq__list { margin: 0; padding: 0; list-style: none; }
.faq__item { border-top: 1px solid var(--color-border-mute); }
.faq__list > li:first-child .faq__item { border-top: 0; }
.faq__summary {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-400);
  padding: var(--space-500) 0;
  cursor: pointer;
  font-size: var(--font-md);
  color: var(--color-text);
}
.faq__summary::-webkit-details-marker { display: none; }
.faq__q { flex: 1; }
.faq__chev {
  color: var(--color-text-light);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
details[open] .faq__chev { transform: rotate(180deg); }
.faq__a {
  margin: 0;
  padding: 0 0 var(--space-500);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}
@media (min-width: 900px) {
  .block { display: grid; grid-template-columns: minmax(240px, 1fr) 2fr; gap: var(--space-700); padding: var(--space-card-pad-lg, 32px); }
  .faq__header { text-align: left; }
  .faq__heading { font-size: var(--font-4xl); line-height: var(--line-4xl); }
  .faq__list { grid-column: 2; }
}
</style>
