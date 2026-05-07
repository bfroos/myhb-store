<template>
  <section class="block bg-grid" :class="[themeClass]">
    <ul class="bg__list" role="list">
      <li v-for="item in items" :key="item.heading" class="bg__cell">
        <component :is="item.icon ?? IconClock" :size="40" stroke="1.5" aria-hidden="true" class="bg__icon" />
        <strong class="bg__h">{{ item.heading }}</strong>
        <p class="bg__t">{{ item.text }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { IconClock, IconMoodSmile, IconShield, IconCalendar } from "@tabler/icons-vue";
import type { Component } from "vue";

interface BenefitItem { heading: string; text: string; icon?: Component }

withDefaults(defineProps<{
  items?: BenefitItem[];
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  themeClass: "theme-light",
  items: () => [
    { heading: "Schnelle Behandlung", text: "In nur 10–20 Minuten erledigt.", icon: IconClock },
    { heading: "Natürliches Ergebnis", text: "Keine Frozen-Face-Optik, natürlich & harmonisch.", icon: IconMoodSmile },
    { heading: "Keine Ausfallzeit", text: "Direkt danach wieder alltagsfähig.", icon: IconShield },
    { heading: "Lang anhaltend", text: "Ergebnisse halten i. d. R. 3–6 Monate.", icon: IconCalendar },
  ],
});
</script>

<style scoped>
.bg-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-400);
}
@media (min-width: 900px) {
  .bg-grid { grid-template-columns: repeat(4, 1fr); }
}
.bg__list {
  display: contents;
  list-style: none;
  margin: 0;
  padding: 0;
}
.bg__cell {
  background: var(--card-color-bg);
  border-radius: var(--border-radius-card-sm);
  padding: var(--space-card-pad-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-300);
  box-shadow: var(--shadow-1);
}
.bg__icon { color: var(--color-text-light); }
.bg__h {
  font-size: var(--font-md);
  font-weight: var(--font-bold);
  line-height: var(--line-md);
}
.bg__t {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}
</style>
