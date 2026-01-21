<template>
  <UiLayoutSectionBlock>
    <div class="productCategoryPriceOverview">
      <UiLayoutCardSurface
        v-for="productCategory in productCategories"
        :key="productCategory.id"
      >
        <a :id="productCategory.slug"></a>
        <UiOrganismProductCategoryPriceOverviewCard
          :productCategory="productCategory"
        />
      </UiLayoutCardSurface>
    </div>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import type { BlockProductCategoryPriceOverviewDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockProductCategoryPriceOverviewDto>();
</script>
<style scoped>
.productCategoryPriceOverview {
  display: flex;
  flex-direction: column;
  gap: var(--space-600);
}
</style>
