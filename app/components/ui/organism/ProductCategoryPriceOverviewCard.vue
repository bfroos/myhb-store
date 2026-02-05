<template>
  <section class="productCategoryPriceOverviewCard">
    <header class="productCategoryPriceOverviewCard__header">
      <h2>{{ productCategory.name }}</h2>
    </header>
    <section class="productCategoryPriceOverviewCard__section">
      <h3>{{ $t("blocks.productCategoryPriceOverview.treatments") }}</h3>
      <ul
        v-if="
          productCategory.treatments && productCategory.treatments.length > 0
        "
      >
        <li
          v-for="treatment in productCategory.treatments"
          :key="treatment.id"
          class="productCategoryPriceOverviewCard__item"
        >
          <div>
            <NuxtLinkLocale
              v-if="treatment.treatmentPage"
              :to="`/behandlungen/${treatment.treatmentPage.pathKey}`"
            >
              {{ treatment.name }}
            </NuxtLinkLocale>
            <template v-else>
              {{ treatment.name }}
            </template>
          </div>
          <div v-if="treatment.priceInEuroCent">
            <span v-if="treatment.isStartingPrice">
              {{ $t("common.price.startingPrefix") }}
            </span>
            {{ formatPriceInEuro(treatment.priceInEuroCent) }}
          </div>
          <div>
            <UiAtomBaseButton
              v-if="treatment.treatmentPage"
              as="nuxt-link-locale"
              :to="`/behandlungen/${treatment.treatmentPage.pathKey}`"
              icon-only
              size="sm"
              variant="tertiary"
              :aria-label="
                $t('blocks.productCategoryPriceOverview.treatmentDetails')
              "
            >
              <IconArrowRight />
            </UiAtomBaseButton>
          </div>
        </li>
      </ul>
      <p v-else class="productCategoryPriceOverviewCard__noTreatments">
        {{ $t("blocks.productCategoryPriceOverview.noTreatments") }}
      </p>
    </section>
    <section
      v-if="productCategory.products && productCategory.products.length > 0"
      class="productCategoryPriceOverviewCard__section"
    >
      <h3>{{ $t("blocks.productCategoryPriceOverview.products") }}</h3>
      <section v-for="product in productCategory.products" :key="product.id">
        <header class="productCategoryPriceOverviewCard__productHeader">
          <h4>
            <span>
              {{ product.manufacturer?.name }}
            </span>
            {{ product.name }}
          </h4>
          <UiAtomMediaPicture
            v-if="product.manufacturer?.logo"
            :media="product.manufacturer.logo"
            :default-format="ImageFormat.THUMBNAIL"
          />
        </header>
        <ul v-if="product.variants && product.variants.length > 0">
          <li
            v-for="variant in getActiveVariants(product.variants)"
            :key="variant.slug"
            class="productCategoryPriceOverviewCard__item"
          >
            <div>
              <NuxtLinkLocale
                :to="`/produkte/${productCategory.slug}/${product.slug}?v=${variant.slug}`"
              >
                {{ variant.label }}
              </NuxtLinkLocale>
            </div>
            <div>
              {{ formatPriceInEuro(variant.priceInEuroCent) }}
            </div>
            <div>
              <UiAtomBaseButton
                as="nuxt-link-locale"
                :to="`/produkte/${productCategory.slug}/${product.slug}?v=${variant.slug}`"
                icon-only
                size="sm"
                variant="tertiary"
                :aria-label="
                  $t('blocks.productCategoryPriceOverview.productDetails')
                "
              >
                <IconArrowRight />
              </UiAtomBaseButton>
            </div>
          </li>
        </ul>
      </section>
    </section>
  </section>
</template>
<script setup lang="ts">
import type { ProductCategoryDto } from "~/lib/strapi/dto/collections";
import { IconArrowRight } from "@tabler/icons-vue";
import type { ProductVariantDto } from "~/lib/strapi/dto/components";
import { ImageFormat } from "~/lib/strapi/dto/enums";

const props = defineProps<{
  productCategory: ProductCategoryDto;
}>();

const getActiveVariants = (variants: ProductVariantDto[]) => {
  return variants.filter((variant) => variant.isActive);
};
</script>
<style scoped>
.productCategoryPriceOverviewCard {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.productCategoryPriceOverviewCard__header {
  padding: var(--space-card-pad) var(--space-card-pad) var(--space-card-pad-xs)
    var(--space-card-pad);
}

.productCategoryPriceOverviewCard__header h2 {
  font-size: var(--font-3xl);
  line-height: var(--line-3xl);
  margin: 0;
}

.productCategoryPriceOverviewCard__section {
  border-top: 1px solid var(--color-border-mute);
  padding: calc(var(--space-card-pad) + 0.25em) var(--space-card-pad)
    calc(var(--space-card-pad-xs));
}

.productCategoryPriceOverviewCard__section:last-child {
  padding-bottom: var(--space-card-pad);
}

.productCategoryPriceOverviewCard__section h3 {
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  margin: 0 0 var(--space-400);
}

.productCategoryPriceOverviewCard__item {
  display: grid;
  align-items: center;
  gap: var(--space-400);
  grid-template-columns: 1fr max-content max-content;
  padding: var(--space-400) 0;
}

.productCategoryPriceOverviewCard__item:not(:last-of-type) {
  border-bottom: 1px solid var(--color-border-mute);
}

.productCategoryPriceOverviewCard__item a {
  text-decoration: none;
}

.productCategoryPriceOverviewCard__item > div > span {
  font-size: var(--font-xs);
  line-height: var(--line-xs);
}

.productCategoryPriceOverviewCard__productHeader {
  display: flex;
  justify-content: space-between;
  gap: var(--space-400);
}

.productCategoryPriceOverviewCard__productHeader h4 {
  font-size: var(--font-xl);
  line-height: var(--line-xl);
}

.productCategoryPriceOverviewCard__productHeader h4 span {
  display: block;
  font-weight: var(--font-regular);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.productCategoryPriceOverviewCard__productHeader :deep(img) {
  height: 24px;
}

.productCategoryPriceOverviewCard__section > section,
.productCategoryPriceOverviewCard__section > ul {
  border-top: 1px solid var(--color-border-light);
  padding: var(--space-600) 0 0;
}

.productCategoryPriceOverviewCard__section section + section,
.productCategoryPriceOverviewCard__section > ul + ul {
  margin-top: var(--space-600);
}

.productCategoryPriceOverviewCard__noTreatments {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

@media screen and (min-width: 900px) {
  .productCategoryPriceOverviewCard {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
  .productCategoryPriceOverviewCard__section {
    grid-column: 2;
    border-left: 1px solid var(--color-border-mute);
  }
}

@media screen and (min-width: 1200px) {
  .productCategoryPriceOverviewCard {
    display: grid;
    grid-template-columns: 2fr 3fr 3fr;
  }
  .productCategoryPriceOverviewCard__section {
    grid-column: auto;
    border-top: none;
  }
}
</style>
