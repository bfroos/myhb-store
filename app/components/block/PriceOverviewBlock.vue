<template>
  <UiLayoutSectionBlock v-if="hasContent" :elevated="elevated" :theme-class="themeClass">
    <!-- Product Category View (complex layout with products + treatments) -->
    <div v-if="showProductCategories" class="overview">
      <section
        v-for="category in product_categories"
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

    <!-- Simple Treatments Grid View (Original Design) -->
    <article v-else-if="showTreatments" class="price-grid">
      <header v-if="headline" class="price-grid__header">
        <h2 class="price-grid__title">{{ headline }}</h2>
      </header>

      <!-- Treatments Grid -->
      <ul class="price-grid__list" role="list">
        <li
          v-for="treatment in treatments"
          :key="treatment.id"
          class="price-grid__item"
        >
          <NuxtLinkLocale
            v-if="treatment.treatmentPage"
            :to="getTreatmentPath(treatment)"
            class="price-grid__link"
          >
            <span class="price-grid__label">{{ treatment.name }}</span>
            <strong class="price-grid__price">
              <template v-if="treatment.priceInEuroCent">
                <span v-if="treatment.isStartingPrice" class="price-grid__prefix">
                  {{ $t("common.price.startingPrefix") }}
                </span>
                {{ formatPriceInEuro(treatment.priceInEuroCent) }}
              </template>
            </strong>
          </NuxtLinkLocale>
          <div v-else class="price-grid__content">
            <span class="price-grid__label">{{ treatment.name }}</span>
            <strong class="price-grid__price">
              <template v-if="treatment.priceInEuroCent">
                <span v-if="treatment.isStartingPrice" class="price-grid__prefix">
                  {{ $t("common.price.startingPrefix") }}
                </span>
                {{ formatPriceInEuro(treatment.priceInEuroCent) }}
              </template>
            </strong>
          </div>
        </li>
      </ul>

      <!-- CTA Button -->
      <footer v-if="cta" class="price-grid__footer">
        <SharedButton :button="cta" />
      </footer>
    </article>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { BlockPriceOverviewDto } from "~/lib/strapi/dto/components";
import { IconArrowRight } from "@tabler/icons-vue";

const props = defineProps<BlockPriceOverviewDto>();

const showProductCategories = computed(
  () => (props.product_categories?.length ?? 0) > 0,
);

const showTreatments = computed(
  () => !showProductCategories.value && (props.treatments?.length ?? 0) > 0,
);

const hasContent = computed(
  () => showProductCategories.value || showTreatments.value,
);

function getTreatmentPath(treatment: { treatmentPage?: { pathKey: string } }) {
  return `/behandlungen/${treatment.treatmentPage?.pathKey ?? ""}`;
}
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

/* Original Grid Design for Treatments */
.price-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
}

.price-grid__header {
  text-align: center;
}

.price-grid__title {
  margin: 0;
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
}

.price-grid__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-300);
}

.price-grid__item {
  display: flex;
  flex-direction: column;
}

.price-grid__link,
.price-grid__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-200);
  padding: var(--space-500) var(--space-300);
  border: 1px solid var(--color-border-mute);
  border-radius: var(--border-radius-card-sm);
  text-decoration: none;
  color: inherit;
  height: 100%;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.price-grid__link:hover {
  background-color: var(--color-gray-50);
  border-color: var(--color-primary);
}

.price-grid__label {
  font-size: var(--font-sm);
  color: var(--color-text-light);
}

.price-grid__price {
  font-size: var(--font-md);
  font-weight: var(--font-bold);
  color: var(--color-text);
}

.price-grid__prefix {
  font-size: var(--font-xs);
  font-weight: var(--font-regular);
  margin-right: var(--space-100);
}

.price-grid__footer {
  display: flex;
  justify-content: center;
  margin-top: var(--space-400);
}

@media (min-width: 900px) {
  .price-grid__title {
    font-size: var(--font-3xl);
    line-height: var(--line-3xl);
  }
  
  .price-grid__list {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-400);
  }
  
  .price-grid__link,
  .price-grid__content {
    padding: var(--space-600) var(--space-400);
  }
}
</style>
