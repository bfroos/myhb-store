<template>
  <UiLayoutSectionBlock v-if="items && items.length > 0">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div
        class="trustGrid"
        :class="{
          'trustGrid--itemsPosition-aside':
            itemsPosition === TrustGridItemsPosition.ASIDE,

          'trustGrid--iconPosition-aside':
            iconPosition === TrustGridIconPosition.ASIDE,
        }"
      >
        <div v-if="headline" class="trustGrid__body">
          <h2>{{ headline }}</h2>
        </div>
        <ul class="trustGrid__items">
          <li v-for="item in items" :key="item.heading">
            <UiLayoutIconWrapper
              v-if="item.icon && item.icon.iconData"
              :size="48"
              :icon="item.icon"
              class="trustGrid__items__icon"
            >
              <g v-html="item.icon.iconData" />
            </UiLayoutIconWrapper>
            <h3 v-if="item.heading">{{ item.heading }}</h3>
            <UiLayoutRichText
              v-if="item.content"
              :blocks="item.content"
              class="trustGrid__items__description"
            />
          </li>
        </ul>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import {
  TrustGridItemsPosition,
  TrustGridIconPosition,
} from "~/lib/strapi/dto/enums";
import type { BlockTrustGridDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockTrustGridDto>();
</script>

<style scoped>
.trustGrid {
  display: flex;
  flex-direction: column;
}
.trustGrid__body {
  padding: var(--space-card-pad);
  border: 1px solid var(--color-border-mute);
  border-width: 0 0 1px 0;
}
.trustGrid__items {
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  border-radius: var(--border-radius-card);
}
.trustGrid__items li {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  padding: var(--space-card-pad);
  border-bottom: 1px solid var(--color-border-mute);
}
.trustGrid__items li > div {
  color: var(--color-text-light);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}
.trustGrid__items li > h3 {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
}

.trustGrid--iconPosition-aside .trustGrid__items > li {
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-template-rows: max-content max-content;
  column-gap: var(--space-400);
}

.trustGrid__items__icon {
  grid-row: 1 / 3;
}
.trustGrid__items__description {
  grid-row: 2 / 3;
}
.trustGrid__items__description > *:last-child {
  margin-bottom: 0;
}

@media screen and (min-width: 600px) {
  .trustGrid--itemsPosition-aside .trustGrid__items {
    flex: 2;
  }
  .trustGrid__items li {
    flex: 0 1 50%;
    border-right: 1px solid var(--color-border-mute);
  }
}

@media screen and (min-width: 900px) {
  .trustGrid--itemsPosition-aside .trustGrid__body {
    flex: 1;
    border-width: 0 1px 0 0;
  }
  .trustGrid--itemsPosition-aside {
    flex-direction: row;
  }
}

@media screen and (min-width: 1200px) {
  .trustGrid__items li {
    flex: 0 1 25%;
  }
  .trustGrid--itemsPosition-aside .trustGrid__items > li {
    flex: 0 1 50%;
  }
  .trustGrid--iconPosition-aside .trustGrid__items > li {
    flex: 0 1 50%;
  }
}
</style>
