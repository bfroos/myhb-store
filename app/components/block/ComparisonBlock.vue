<template>
  <UiLayoutSectionBlock v-if="hasItems">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="comparison">
        <article
          v-for="(item, index) in comparisonItems"
          :key="index"
          class="comparison__item"
        >
          <div class="comparison__card" :class="{ 'theme-light': index === 0 }">
            <UiLayoutIconWrapper
              v-if="item.icon?.iconData"
              :size="56"
              class="comparison__icon"
            >
              <g v-html="item.icon.iconData" />
            </UiLayoutIconWrapper>
            <component
              :is="item.fallbackIcon"
              v-else
              :size="56"
              stroke="1.5"
              class="comparison__icon"
              aria-hidden="true"
            />
            <h2 class="comparison__heading">{{ item.heading }}</h2>
            <UiLayoutRichText :blocks="item.content ?? []" />
          </div>
        </article>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { IconThumbUp, IconThumbDown } from "@tabler/icons-vue";
import type { BlockComparisonBlockDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockComparisonBlockDto>();

const hasItems = computed(() => !!props.firstItem || !!props.secondItem);

const comparisonItems = computed(() => {
  const items: Array<
    (typeof props.firstItem | typeof props.secondItem) & {
      fallbackIcon: typeof IconThumbUp;
    }
  > = [];

  if (props.firstItem) {
    items.push({ ...props.firstItem, fallbackIcon: IconThumbUp });
  }
  if (props.secondItem) {
    items.push({ ...props.secondItem, fallbackIcon: IconThumbDown });
  }

  return items;
});
</script>

<style scoped>
.comparison {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.comparison__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
  color: var(--color-text);
  padding: var(--space-card-pad);
}

.comparison__item:first-child {
  padding-top: var(--space-card-figure-pad);
  padding-bottom: 0;
  padding-left: var(--space-card-figure-pad);
  padding-right: var(--space-card-figure-pad);
}

.comparison__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
  padding: calc(var(--space-card-pad) - var(--space-card-figure-pad));
  border-radius: var(--border-radius-card-figure);
  color: var(--color-text);
}

.comparison__icon {
  flex-shrink: 0;
}

.comparison__heading {
  margin: 0 0 var(--space-300);
}

@media (min-width: 900px) {
  .comparison {
    flex-direction: row;
  }

  .comparison__item {
    flex: 1 0 50%;
  }

  .comparison__item:first-child {
    padding: var(--space-card-figure-pad);
    padding-right: 0;
  }

  .comparison__item:nth-child(2) {
    padding: var(--space-card-figure-pad);
    padding-left: 0;
  }
}
</style>
