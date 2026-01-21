<template>
  <UiLayoutSectionBlock v-if="firstItem || secondItem">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div
        class="comparisonBlock"
        role="region"
        :aria-label="$t('common.comparison')"
      >
        <article v-if="firstItem" class="comparisonBlock__item">
          <div class="comparisonBlock__item_inner theme-light">
            <UiLayoutIconWrapper
              v-if="firstItem.icon && firstItem.icon.iconData"
              :size="56"
            >
              <g v-html="firstItem.icon.iconData" />
            </UiLayoutIconWrapper>
            <IconThumbUp v-else :size="56" stroke="1.5" aria-hidden="true" />
            <h2>{{ firstItem.heading }}</h2>
            <UiLayoutRichText :blocks="firstItem.content ?? []" />
          </div>
        </article>
        <article v-if="secondItem" class="comparisonBlock__item">
          <UiLayoutIconWrapper
            v-if="secondItem.icon && secondItem.icon.iconData"
            :size="56"
          >
            <g v-html="secondItem.icon.iconData" />
          </UiLayoutIconWrapper>
          <IconThumbDown v-else :size="56" stroke="1.5" aria-hidden="true" />
          <h2>{{ secondItem.heading }}</h2>
          <UiLayoutRichText :blocks="secondItem.content ?? []" />
        </article>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import { IconThumbUp, IconThumbDown } from "@tabler/icons-vue";
import type { BlockComparisonBlockDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockComparisonBlockDto>();
</script>
<style scoped>
.comparisonBlock {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.comparisonBlock__item,
.comparisonBlock__item_inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
  color: var(--color-text);
  padding: var(--space-card-pad);
}
.comparisonBlock__item:first-child {
  padding: var(--space-card-figure-pad) var(--space-card-figure-pad) 0
    var(--space-card-figure-pad);
}
.comparisonBlock__item_inner {
  padding: calc(var(--space-card-pad) - var(--space-card-figure-pad));
  border-radius: var(--border-radius-card-figure);
}
.comparisonBlock h2 {
  margin: 0 0 var(--space-300);
}

@media screen and (min-width: 900px) {
  .comparisonBlock {
    flex-direction: row;
  }
  .comparisonBlock__item {
    flex: 1 0 50%;
  }
  .comparisonBlock__item:first-child {
    padding: var(--space-card-figure-pad) 0 var(--space-card-figure-pad)
      var(--space-card-figure-pad);
  }
}
</style>
