<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="highlights" :class="{ 'highlights--divider': showDivider }">
        <header class="highlights__header">
          <h2 v-if="headline" class="highlights__heading">{{ headline }}</h2>
        </header>
        <ul class="highlights__list" role="list">
          <template v-if="isIconType">
            <li
              v-for="(item, index) in iconItems ?? []"
              :key="item.id ?? item.text ?? index"
              class="highlights__item"
            >
              <UiLayoutIconWrapper
                v-if="item.icon?.iconData"
                :icon="item.icon"
                :size="72"
                :stroke-width="1"
              >
                <g v-html="item.icon.iconData" />
              </UiLayoutIconWrapper>
              <IconCircleCheck
                v-else
                :size="72"
                stroke="1.25"
                aria-hidden="true"
              />
              <p class="highlights__text">{{ item.text }}</p>
            </li>
          </template>
          <template v-else>
            <li
              v-for="(item, index) in numberItems ?? []"
              :key="item.key ?? index"
              class="highlights__item"
            >
              <strong class="highlights__value">{{ item.value }}</strong>
              <span class="highlights__label">{{ item.key }}</span>
            </li>
          </template>
        </ul>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { IconCircleCheck } from "@tabler/icons-vue";
import type { BlockHighlightsStripDto } from "~/lib/strapi/dto/components";
import { BlockHighlightsStripType } from "~/lib/strapi/dto/enums";

const props = defineProps<BlockHighlightsStripDto>();

const isIconType = computed(
  () => props.type === BlockHighlightsStripType.ICONS,
);

const hasContent = computed(
  () =>
    !!props.headline ||
    (isIconType.value && (props.iconItems?.length ?? 0) > 0) ||
    (!isIconType.value && (props.numberItems?.length ?? 0) > 0),
);
</script>

<style scoped>
.highlights {
  padding: var(--space-card-pad);
  width: 100%;
}

.highlights__header {
  margin: 0 0 var(--space-card-pad);
  text-align: center;
}

.highlights__heading {
  margin: 0;
}

.highlights__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-400);
  row-gap: var(--space-800);
  list-style: none;
  margin: 0;
  padding: 0;
}

.highlights__item {
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

.highlights__value {
  font-size: var(--font-4xl);
  line-height: var(--line-4xl);
  font-weight: var(--font-bold);
}

.highlights__label {
  font-weight: var(--font-regular);
  margin-top: calc(var(--space-200) * -1);
}

.highlights--divider .highlights__list {
  gap: 0;
}

.highlights--divider .highlights__item:not(:last-child) {
  border-right: 1px solid var(--color-border-light);
  padding-right: var(--space-400);
}
</style>
