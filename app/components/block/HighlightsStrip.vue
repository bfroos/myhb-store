<template>
  <UiLayoutSectionBlock v-if="hasItems">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div
        class="highlightsStrip"
        :class="{ 'highlightsStrip--showDivider': showDivider }"
      >
        <h2 v-if="headline">{{ headline }}</h2>
        <ul class="highlightsStrip__list">
          <template v-if="type === BlockHighlightsStripType.ICONS">
            <li v-for="item in iconItems" :key="item.id ?? item.text">
              <UiLayoutIconWrapper
                v-if="item.icon && item.icon.iconData"
                :icon="item.icon"
                :size="72"
              >
                <g v-html="item.icon?.iconData ?? ''" />
              </UiLayoutIconWrapper>
              <IconCircleCheck
                v-else
                :size="72"
                stroke="1.25"
                aria-hidden="true"
              />
              <p>{{ item.text }}</p>
            </li>
          </template>
          <template v-else>
            <li v-for="item in numberItems" :key="item.key">
              <strong>{{ item.value }}</strong>
              <span>{{ item.key }}</span>
            </li>
          </template>
        </ul>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import type { BlockHighlightsStripDto } from "~/lib/strapi/dto/components";
import { IconCircleCheck } from "@tabler/icons-vue";
import { BlockHighlightsStripType } from "~/lib/strapi/dto/enums";
const props = defineProps<BlockHighlightsStripDto>();

const hasItems = computed(() => {
  return (
    (props.type === BlockHighlightsStripType.ICONS &&
      props.iconItems &&
      props.iconItems.length > 0) ||
    (props.type !== BlockHighlightsStripType.ICONS &&
      props.numberItems &&
      props.numberItems.length > 0)
  );
});
</script>
<style scoped>
.highlightsStrip {
  padding: var(--space-card-pad);
}
.highlightsStrip > h2 {
  margin: 0 0 var(--space-card-pad);
  text-align: center;
}
.highlightsStrip__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-400);
  row-gap: var(--space-800);
}
.highlightsStrip__list li {
  flex: 1 0 20ch;
  max-width: min(100%, 20ch);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-400);
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
}
.highlightsStrip__list strong {
  font-size: var(--font-4xl);
  line-height: var(--line-4xl);
  font-weight: var(--font-bold);
}
.highlightsStrip__list strong + span {
  font-weight: var(--font-regular);
  margin-top: calc(var(--space-200) * -1);
}

.highlightsStrip--showDivider .highlightsStrip__list {
  gap: 0;
}

.highlightsStrip--showDivider .highlightsStrip__list li:not(:last-child) {
  border-right: 1px solid var(--color-border-light);
}
</style>
