<template>
  <section v-if="hasContent" class="block qi" :class="[themeClass, { 'block--elevated': elevated }]">
    <header v-if="headline" class="qi__header">
      <h2 class="qi__heading">{{ headline }}</h2>
    </header>
    <ul class="qi__grid" role="list">
      <li v-for="(item, index) in items" :key="item.heading ?? index" class="qi__cell">
        <span v-if="item.icon?.iconData" class="qi__bubble">
          <UiLayoutIconWrapper :size="24" :icon="item.icon">
            <g v-html="item.icon.iconData" />
          </UiLayoutIconWrapper>
        </span>
        <strong class="qi__q">{{ item.heading }}</strong>
        <p v-if="item.text" class="qi__a">{{ item.text }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { SharedIconHeadingTextDto } from "~/lib/strapi/dto/components";

const props = withDefaults(defineProps<{
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
}
.block--elevated { box-shadow: var(--shadow-1); }
.qi__header { margin-bottom: var(--space-600); }
.qi__heading {
  margin: 0;
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
  text-align: center;
}
.qi__grid {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-400);
}
.qi__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-300);
  padding: var(--space-600) var(--space-400);
  text-align: center;
  background: var(--color-card-bg-light, #fff);
  border: 1px solid var(--color-border-mute);
  border-radius: var(--border-radius-card-sm);
}
.theme-soft .qi__cell { background: #fff; }
.theme-neutral .qi__cell, .theme-strong .qi__cell {
  background: rgba(255,255,255,0.04);
  border-color: var(--color-border-mute);
}
.qi__bubble {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-100);
  color: var(--color-text);
}
.theme-neutral .qi__bubble, .theme-strong .qi__bubble {
  background: rgba(255,255,255,0.08);
  color: var(--color-text);
}
.qi__q {
  font-size: var(--font-md);
  font-weight: var(--font-bold);
}
.qi__a {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}
@media (min-width: 900px) {
  .block { padding: var(--space-card-pad-lg, 32px); }
  .qi__heading { font-size: var(--font-3xl); line-height: var(--line-3xl); }
  .qi__grid { grid-template-columns: repeat(3, 1fr); gap: var(--space-500); }
  .qi__cell { padding: var(--space-700) var(--space-500); }
}
</style>
