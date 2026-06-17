<template>
  <section v-if="hasContent" class="block guarantees" :class="[themeClass, { 'block--elevated': elevated }]">
    <ul class="guar__list" role="list">
      <li v-for="(g, index) in items" :key="g.heading ?? index" class="guar__item" :class="{ 'guar__item--noicon': !g.icon?.iconData }">
        <span v-if="g.icon?.iconData" class="guar__icon">
          <UiLayoutIconWrapper :size="22" :icon="g.icon">
            <g v-html="g.icon.iconData" />
          </UiLayoutIconWrapper>
        </span>
        <div class="guar__body">
          <strong class="guar__label">{{ g.heading }}</strong>
          <span v-if="g.text" class="guar__text">{{ g.text }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { SharedIconHeadingTextDto } from "~/lib/strapi/dto/components";

const props = withDefaults(defineProps<{
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
.guar__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-500) var(--space-400);
}
.guar__item {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: var(--space-300);
  align-items: start;
}
.guar__item--noicon {
  grid-template-columns: 1fr;
}
.guar__icon {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: var(--color-gray-100);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
}
.theme-neutral .guar__icon, .theme-strong .guar__icon { background: rgba(255,255,255,0.08); }
.guar__body { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; }
.guar__label {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  letter-spacing: -0.005em;
}
.guar__text {
  margin-top: 2px;
  font-size: var(--font-xs);
  color: var(--color-text-light);
}
@media (max-width: 360px) {
  .guar__list { grid-template-columns: 1fr; }
}
</style>
