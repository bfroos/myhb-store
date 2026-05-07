<template>
  <section class="block awards" :class="[themeClass, { 'block--elevated': elevated }]">
    <header class="awards__header">
      <p v-if="eyebrow" class="awards__eyebrow">{{ eyebrow }}</p>
      <h2 v-if="headline" class="awards__heading">{{ headline }}</h2>
    </header>
    <ul class="awards__list" role="list">
      <li v-for="a in items" :key="a.label" class="awards__item">
        <span class="awards__medal" aria-hidden="true">
          <IconAward :size="28" stroke="1.5" />
        </span>
        <strong class="awards__year">{{ a.year }}</strong>
        <span class="awards__label">{{ a.label }}</span>
        <span v-if="a.source" class="awards__source">{{ a.source }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { IconAward } from "@tabler/icons-vue";

interface Award { year: string; label: string; source?: string }

withDefaults(defineProps<{
  eyebrow?: string;
  headline?: string;
  items?: Award[];
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
  eyebrow: "Auszeichnungen",
  headline: "Mehrfach prämierte Behandlungsqualität",
  items: () => [
    { year: "2025", label: "Top Beauty Lounge", source: "Vogue Beauty Awards" },
    { year: "2024", label: "Beste Klinik DACH", source: "Focus Gesundheit" },
    { year: "2023", label: "Premium Service",   source: "Trusted Shops" },
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
  gap: var(--space-500);
}
.block--elevated { box-shadow: var(--shadow-1); }
.awards__header { text-align: center; }
.awards__eyebrow {
  margin: 0 0 var(--space-200);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text-light);
}
.awards__heading {
  margin: 0;
  font-size: var(--font-xl);
  line-height: var(--line-xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.01em;
  max-width: 26ch;
  margin-inline: auto;
}
.awards__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-300);
}
.awards__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  padding: var(--space-500) var(--space-300);
  border: 1px solid var(--color-border-mute);
  border-radius: var(--border-radius-card-sm);
}
.awards__medal {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-100);
  color: var(--color-text);
  margin-bottom: var(--space-200);
}
.theme-neutral .awards__medal, .theme-strong .awards__medal { background: rgba(255,255,255,0.08); }
.awards__year {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  letter-spacing: 0.02em;
}
.awards__label { font-size: var(--font-sm); }
.awards__source { font-size: var(--font-xs); color: var(--color-text-muted); }
</style>
