<template>
  <UiLayoutSectionBlock v-if="hasContent" :elevated="elevated" :theme-class="themeClass">
    <!-- Product Category View (complex layout with products + treatments) -->
    <div v-if="showProductCategories" class="overview">
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

    <!-- Simple Treatments List View -->
    <article v-else-if="showTreatments" class="price-overview">
      <header v-if="headline" class="price-overview__header">
        <h2 class="price-overview__title">{{ headline }}</h2>
      </header>

      <!-- Treatments List -->
      <section class="price-overview__section">
        <ul class="price-overview__list" role="list">
          <li
            v-for="treatment in treatments"
            :key="treatment.id"
            class="price-overview__row"
            :class="{ 'price-overview__row--link': treatment.treatmentPage }"
          >
            <NuxtLinkLocale
              v-if="treatment.treatmentPage"
              :to="getTreatmentPath(treatment)"
              class="price-overview__link"
              :aria-label="$t('blocks.priceOverview.treatmentDetails', { name: treatment.name })"
            >
              <span class="price-overview__label">{{ treatment.name }}</span>
              <span class="price-overview__price">
                <template v-if="treatment.priceInEuroCent">
                  <span v-if="treatment.isStartingPrice" class="price-overview__prefix">
                    {{ $t("common.price.startingPrefix") }}
                  </span>
                  {{ formatPriceInEuro(treatment.priceInEuroCent) }}
                </template>
              </span>
              <IconArrowRight class="price-overview__icon" aria-hidden="true" />
            </NuxtLinkLocale>
            <template v-else>
              <span class="price-overview__label">{{ treatment.name }}</span>
              <span class="price-overview__price">
                <template v-if="treatment.priceInEuroCent">
                  <span v-if="treatment.isStartingPrice" class="price-overview__prefix">
                    {{ $t("common.price.startingPrefix") }}
                  </span>
                  {{ formatPriceInEuro(treatment.priceInEuroCent) }}
                </template>
              </span>
            </template>
          </li>
        </ul>
      </section>

      <!-- CTA Button -->
      <footer v-if="cta" class="price-overview__footer">
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
  () => (props.productCategories?.length ?? 0) > 0,
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

.price-overview {
  --overview-pad: var(--space-card-pad);
  --overview-pad-sm: var(--space-card-pad-xs);
  --overview-gap: var(--space-400);
  --overview-row-cols: 1fr max-content max-content;

  display: flex;
  flex-direction: column;
}

.price-overview__header {
  padding-block: var(--overview-pad) var(--overview-pad-sm);
  padding-inline: var(--overview-pad);
}

.price-overview__title {
  font-size: var(--font-3xl);
  line-height: var(--line-3xl);
  font-weight: var(--font-semibold);
  margin: 0;
}

.price-overview__section {
  border-block-start: 1px solid var(--color-border-mute);
  padding-block: calc(var(--overview-pad) + 0.25em) var(--overview-pad-sm);
  padding-inline: var(--overview-pad);
}

.price-overview__list {
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
}

.price-overview__row {
  display: grid;
  grid-template-columns: var(--overview-row-cols);
  align-items: center;
  gap: var(--overview-gap);
  padding-block: var(--overview-gap);
  font-size: var(--font-base);
  line-height: var(--line-base);
}

.price-overview__row:not(:last-child) {
  border-block-end: 1px solid var(--color-border-mute);
}

.price-overview__row--link {
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin: 0 calc(var(--overview-gap) * -1);
  padding-inline: var(--overview-gap);
  border-radius: var(--border-radius-200);
}

.price-overview__row--link:hover {
  background-color: var(--color-gray-100);
}

.price-overview__link {
  display: contents;
  text-decoration: none;
  color: inherit;
}

.price-overview__label {
  min-inline-size: 0;
  font-weight: var(--font-medium);
}

.price-overview__price {
  font-weight: var(--font-semibold);
  color: var(--color-primary);
}

.price-overview__prefix {
  font-size: var(--font-xs);
  line-height: var(--line-xs);
  font-weight: var(--font-regular);
}

.price-overview__icon {
  justify-self: end;
  color: var(--color-text-light);
}

.price-overview__footer {
  border-block-start: 1px solid var(--color-border-mute);
  padding-block: var(--overview-pad);
  padding-inline: var(--overview-pad);
  display: flex;
  justify-content: center;
}

@media (max-width: 640px) {
  .price-overview__row {
    grid-template-columns: 1fr max-content;
  }
  
  .price-overview__icon {
    display: none;
  }
}
</style>
