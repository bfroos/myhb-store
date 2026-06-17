<template>
  <section
    v-if="hasContent"
    class="block awards"
    :class="[themeClass, { 'block--elevated': elevated }]"
  >
    <header v-if="eyebrow || headline" class="awards__header">
      <p v-if="eyebrow" class="awards__eyebrow">{{ eyebrow }}</p>
      <h2 v-if="headline" class="awards__heading">{{ headline }}</h2>
    </header>
    <ul class="awards__list" role="list">
      <li v-for="(item, index) in items" :key="item.heading ?? index" class="awards__item">
        <span v-if="item.icon?.iconData" class="awards__medal" aria-hidden="true">
          <UiLayoutIconWrapper :size="28" :icon="item.icon">
            <g v-html="item.icon.iconData" />
          </UiLayoutIconWrapper>
        </span>
        <strong v-if="item.heading" class="awards__label">{{ item.heading }}</strong>
        <span v-if="item.text" class="awards__year">{{ item.text }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SharedIconHeadingTextDto } from "~/lib/strapi/dto/components";

const props = withDefaults(defineProps<{
  eyebrow?: string;
  headline?: string;
  items?: SharedIconHeadingTextDto[];
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
  items: () => [],
});

const hasContent = computed(() => (props.items?.length ?? 0) > 0);
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
  box-sizing: border-box;
  max-width: 1200px;
  margin-inline: auto;
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
  grid-template-columns: 1fr;
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
  box-sizing: border-box;
  min-width: 0;
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
.awards__label {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
}
.awards__year {
  font-size: var(--font-xs);
  color: var(--color-text-light);
  letter-spacing: 0.02em;
}
@media (min-width: 600px) {
  .awards__list { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 900px) {
  .block { padding: var(--space-card-pad-lg, 32px); }
  .awards__heading { font-size: var(--font-2xl); line-height: var(--line-2xl); }
  .awards__list { grid-template-columns: repeat(3, 1fr); gap: var(--space-400); }
}
</style>
