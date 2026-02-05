<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <div class="overview">
      <section
        v-for="category in productCategories"
        :key="category.id"
        :id="category.slug"
        class="overview__item"
      >
        <UiLayoutCardSurface>
          <UiOrganismProductCategoryPriceOverviewCard
            :product-category="category"
          />
        </UiLayoutCardSurface>
      </section>
    </div>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { BlockProductCategoryPriceOverviewDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockProductCategoryPriceOverviewDto>();

const hasContent = computed(() => (props.productCategories?.length ?? 0) > 0);
</script>

<style scoped>
.overview {
  display: flex;
  flex-direction: column;
  gap: var(--space-600);
  width: 100%;
}

.overview__item {
  scroll-margin-top: var(--space-600);
}
</style>
