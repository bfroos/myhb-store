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
    <UiLayoutSectionBlock v-else-if="showTreatments" :elevated="elevated" :theme-class="themeClass">
      <article class="price-grid">
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

/* Standard Pricing Table Design */
.price-grid {
  width: 100%;
  max-width: 100%;
}

.price-grid__header {
  text-align: center;
  margin-bottom: var(--space-600);
}

.price-grid__title {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.price-grid__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr));
  gap: 1rem;
  width: 100%;
}

.price-grid__item {
  min-width: 0;
}

.price-grid__link,
.price-grid__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  min-height: 140px;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  text-decoration: none;
  color: inherit;
  background: transparent;
  transition: all 0.2s ease;
}

.price-grid__link:hover {
  background-color: #f9fafb;
  border-color: currentColor;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.price-grid__label {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #6b7280;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.price-grid__price {
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
}

.price-grid__prefix {
  font-size: 0.75rem;
  font-weight: 400;
  margin-right: 0.25rem;
}

.price-grid__footer {
  margin-top: 2rem;
  text-align: center;
}

@media (min-width: 640px) {
  .price-grid__list {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .price-grid__link,
  .price-grid__content {
    padding: 2.5rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .price-grid__title {
    font-size: 2.25rem;
  }
  
  .price-grid__list {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
  
  .price-grid__link,
  .price-grid__content {
    padding: 3rem 2rem;
  }
  
  .price-grid__label {
    font-size: 1rem;
  }
  
  .price-grid__price {
    font-size: 1.5rem;
  }
}
</style>
