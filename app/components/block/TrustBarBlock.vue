<template>
  <section
    v-if="hasContent"
    class="block trust"
    :class="[themeClass, { 'block--elevated': elevated }]"
  >
    <ul class="trust__grid" role="list">
      <li v-for="(item, index) in items" :key="item.heading ?? index" class="trust__cell">
        <UiLayoutIconWrapper
          v-if="item.icon?.iconData"
          :size="36"
          :icon="item.icon"
          class="trust__icon"
        >
          <g v-html="item.icon.iconData" />
        </UiLayoutIconWrapper>
        <strong class="trust__value">{{ item.heading }}</strong>
        <span class="trust__label">{{ item.text }}</span>
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
}
.block--elevated { box-shadow: var(--shadow-1); }
.trust__grid {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.trust__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-200);
  padding: var(--space-card-pad-sm);
  border-right: 1px solid var(--color-border-mute);
  border-bottom: 1px solid var(--color-border-mute);
}
.trust__cell:nth-child(2n) { border-right: none; }
.trust__cell:nth-last-child(-n+2) { border-bottom: none; }
.trust__icon { color: var(--color-text-light); }
.trust__value {
  font-size: var(--font-xl);
  line-height: var(--line-xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.01em;
}
.trust__label {
  font-size: var(--font-sm);
  color: var(--color-text-light);
}
@media (min-width: 600px) {
  .trust__grid { grid-template-columns: repeat(4, 1fr); }
  .trust__cell { border-bottom: none; }
  .trust__cell:nth-child(2n) { border-right: 1px solid var(--color-border-mute); }
  .trust__cell:last-child { border-right: none; }
}
</style>
