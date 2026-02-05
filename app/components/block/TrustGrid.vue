<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div
        class="trust"
        :class="{
          'trust--headlineAside':
            itemsPosition === TrustGridItemsPosition.ASIDE,
          'trust--iconAside': iconPosition === TrustGridIconPosition.ASIDE,
        }"
      >
        <header v-if="headline" class="trust__header">
          <h2 class="trust__heading">{{ headline }}</h2>
        </header>
        <ul class="trust__list" role="list">
          <li
            v-for="(item, index) in items"
            :key="item.heading ?? index"
            class="trust__item"
          >
            <UiLayoutIconWrapper
              v-if="item.icon?.iconData"
              :size="48"
              :icon="item.icon"
              class="trust__item-icon"
            >
              <g v-html="item.icon.iconData" />
            </UiLayoutIconWrapper>
            <h3 v-if="item.heading" class="trust__item-heading">
              {{ item.heading }}
            </h3>
            <div
              v-if="(item.content?.length ?? 0) > 0"
              class="trust__item-content"
            >
              <UiLayoutRichText :blocks="item.content ?? []" />
            </div>
          </li>
        </ul>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import {
  TrustGridIconPosition,
  TrustGridItemsPosition,
} from "~/lib/strapi/dto/enums";
import type { BlockTrustGridDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockTrustGridDto>();

const hasContent = computed(() => (props.items?.length ?? 0) > 0);
</script>

<style scoped>
.trust {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.trust__header {
  padding: var(--space-card-pad);
  border-bottom: 1px solid var(--color-border-mute);
}

.trust__heading {
  margin: 0;
  font-size: var(--font-4xl);
  line-height: var(--line-4xl);
}

.trust__list {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
  border-radius: var(--border-radius-card);
}

.trust__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  padding: var(--space-card-pad);
  border-bottom: 1px solid var(--color-border-mute);
}

.trust__item-heading {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
  margin: 0;
}

.trust__item-content {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

.trust__item-content > *:last-child {
  margin-bottom: 0;
}

.trust--iconAside .trust__item {
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-template-rows: auto auto;
  column-gap: var(--space-400);
}

.trust--iconAside .trust__item-icon {
  grid-row: 1 / -1;
}

.trust--iconAside .trust__item-content {
  grid-row: 2;
}

@media (min-width: 600px) {
  .trust__item {
    flex: 0 1 50%;
    border-right: 1px solid var(--color-border-mute);
  }

  .trust--headlineAside .trust__list {
    flex: 2;
  }
}

@media (min-width: 900px) {
  .trust--headlineAside {
    flex-direction: row;
  }

  .trust--headlineAside .trust__header {
    flex: 1;
    border-bottom: none;
    border-right: 1px solid var(--color-border-mute);
  }
}

@media (min-width: 1200px) {
  .trust__item {
    flex: 0 1 25%;
  }

  .trust--headlineAside .trust__list .trust__item,
  .trust--iconAside .trust__list .trust__item {
    flex: 0 1 50%;
  }
}
</style>
