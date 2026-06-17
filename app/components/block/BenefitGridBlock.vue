<template>
  <section v-if="hasContent" class="block bg-grid" :class="[themeClass]">
    <ul class="bg__list" role="list">
      <li v-for="(item, index) in items" :key="item.heading ?? index" class="bg__cell">
        <UiLayoutIconWrapper
          v-if="item.icon?.iconData"
          :size="40"
          :icon="item.icon"
          class="bg__icon"
        >
          <g v-html="item.icon.iconData" />
        </UiLayoutIconWrapper>
        <strong class="bg__h">{{ item.heading }}</strong>
        <p class="bg__t">{{ item.text }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { SharedIconHeadingTextDto } from "~/lib/strapi/dto/components";

const props = withDefaults(defineProps<{
  items?: SharedIconHeadingTextDto[];
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  themeClass: "theme-light",
  items: () => [],
});

const hasContent = computed(() => (props.items?.length ?? 0) > 0);
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
