<template>
  <article class="price-card">
    <header class="price-card__header">
      <h2 class="price-card__title">{{ productCategory.name }}</h2>
    </header>

    <!-- Treatments -->
    <section class="price-card__section" aria-labelledby="treatments-heading">
      <h3 id="treatments-heading" class="price-card__section-title">
        {{ $t("blocks.productCategoryPriceOverview.treatments") }}
      </h3>
      <ul v-if="hasTreatments" class="price-card__list" role="list">
        <li
          v-for="treatment in productCategory.treatments"
          :key="treatment.id"
          class="price-card__row"
          :class="{ 'price-card__row--link': treatment.treatmentPage }"
        >
          <NuxtLinkLocale
            v-if="treatment.treatmentPage"
            :to="getTreatmentPath(treatment)"
            class="price-card__link"
            :aria-label="
              $t('blocks.productCategoryPriceOverview.treatmentDetails')
            "
          >
            <span class="price-card__label">{{ treatment.name }}</span>
            <span class="price-card__price">
              <template v-if="treatment.priceInEuroCent">
                <span
                  v-if="treatment.isStartingPrice"
                  class="price-card__prefix"
                >
                  {{ $t("common.price.startingPrefix") }}
                </span>
                {{ formatPriceInEuro(treatment.priceInEuroCent) }}
              </template>
            </span>
            <IconArrowRight class="price-card__icon" aria-hidden="true" />
          </NuxtLinkLocale>
          <template v-else>
            <span class="price-card__label">{{ treatment.name }}</span>
            <span class="price-card__price">
              <template v-if="treatment.priceInEuroCent">
                <span
                  v-if="treatment.isStartingPrice"
                  class="price-card__prefix"
                >
                  {{ $t("common.price.startingPrefix") }}
                </span>
                {{ formatPriceInEuro(treatment.priceInEuroCent) }}
              </template>
            </span>
            <span aria-hidden="true"></span>
          </template>
        </li>
      </ul>
      <p v-else class="price-card__empty">
        {{ $t("blocks.productCategoryPriceOverview.noTreatments") }}
      </p>
    </section>

    <!-- Products -->
    <section
      v-if="hasProducts"
      class="price-card__section"
      aria-labelledby="products-heading"
    >
      <h3 id="products-heading" class="price-card__section-title">
        {{ $t("blocks.productCategoryPriceOverview.products") }}
      </h3>
      <div class="price-card__products">
        <article
          v-for="product in productCategory.products"
          :key="product.id"
          class="price-card__product"
        >
          <header class="price-card__product-header">
            <h4 class="price-card__product-title">
              <span class="price-card__product-manufacturer">
                {{ product.manufacturer?.name }}
              </span>
              {{ product.name }}
            </h4>
            <UiAtomMediaPicture
              v-if="product.manufacturer?.logo"
              :media="product.manufacturer.logo"
              :default-format="ImageFormat.THUMBNAIL"
              class="price-card__product-logo"
            />
          </header>
          <ul
            v-if="activeVariants(product).length"
            class="price-card__list"
            role="list"
          >
            <li
              v-for="variant in activeVariants(product)"
              :key="variant.slug"
              class="price-card__row price-card__row--link"
            >
              <NuxtLinkLocale
                :to="getVariantPath(product, variant, productCategory)"
                class="price-card__link"
                :aria-label="
                  $t('blocks.productCategoryPriceOverview.productDetails')
                "
              >
                <span class="price-card__label">{{ variant.label }}</span>
                <span class="price-card__price">
                  <span class="price-card__prefix">{{ $t("common.price.startingPrefix") }}</span>
                  {{ formatPriceInEuro(variant.priceInEuroCent) }}
                </span>
                <IconArrowRight class="price-card__icon" aria-hidden="true" />
              </NuxtLinkLocale>
            </li>
          </ul>
        </article>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import type {
  ProductCategoryDto,
  ProductDto,
} from "~/lib/strapi/dto/collections";
import type { ProductVariantDto } from "~/lib/strapi/dto/components";
import { ImageFormat } from "~/lib/strapi/dto/enums";
import { IconArrowRight } from "@tabler/icons-vue";

const props = defineProps<{
  productCategory: ProductCategoryDto;
}>();

const hasTreatments = computed(
  () => (props.productCategory?.treatments?.length ?? 0) > 0,
);

const hasProducts = computed(
  () => (props.productCategory?.products?.length ?? 0) > 0,
);

function getTreatmentPath(treatment: { treatmentPage?: { pathKey: string } }) {
  return `/behandlungen/${treatment.treatmentPage?.pathKey ?? ""}`;
}

function getVariantPath(
  product: ProductDto,
  variant: ProductVariantDto,
  category: ProductCategoryDto,
) {
  return `/produkte/${category.slug}/${product.slug}?v=${variant.slug}`;
}

function activeVariants(product: ProductDto) {
  return product.variants?.filter((v: ProductVariantDto) => v.isActive) ?? [];
}
</script>

<style scoped>
.price-card {
  --price-card-pad: var(--space-card-pad);
  --price-card-pad-sm: var(--space-card-pad-xs);
  --price-card-gap: var(--space-400);
  --price-card-row-cols: 1fr max-content max-content;

  display: flex;
  flex-direction: column;
}

.price-card__header {
  padding-block: var(--price-card-pad) var(--price-card-pad-sm);
  padding-inline: var(--price-card-pad);
}

.price-card__title {
  font-size: var(--font-3xl);
  line-height: var(--line-3xl);
  margin: 0;
}

.price-card__section {
  border-block-start: 1px solid var(--color-border-mute);
  padding-block: calc(var(--price-card-pad) + 0.25em) var(--price-card-pad-sm);
  padding-inline: var(--price-card-pad);
}

.price-card__section:last-child {
  padding-block-end: var(--price-card-pad);
}

.price-card__section-title {
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  margin: 0 0 var(--price-card-gap);
}

.price-card__list {
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
}

.price-card__row {
  display: grid;
  grid-template-columns: var(--price-card-row-cols);
  align-items: center;
  gap: var(--price-card-gap);
  padding-block: var(--price-card-gap);
}

.price-card__row:not(:last-child) {
  border-block-end: 1px solid var(--color-border-mute);
}

.price-card__row--link {
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin: 0 calc(var(--price-card-gap) * -1);
  padding-inline: var(--price-card-gap);
  border-radius: var(--border-radius-200);
}

.price-card__row--link:hover {
  background-color: var(--color-gray-100);
}

.price-card__link {
  display: contents;
  text-decoration: none;
  color: inherit;
}

.price-card__label {
  min-inline-size: 0;
}

.price-card__prefix {
  font-size: var(--font-xs);
  line-height: var(--line-xs);
}

.price-card__icon {
  justify-self: end;
}

.price-card__empty {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
  margin: 0;
}

/* Product block */
.price-card__products {
  display: flex;
  flex-direction: column;
  gap: var(--space-600);
}

.price-card__product {
  border-block-start: 1px solid var(--color-border-light);
  padding-block-start: var(--space-600);
}

.price-card__product:first-child {
  border-block-start: none;
  padding-block-start: 0;
}

.price-card__product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--price-card-gap);
  margin-block-end: var(--price-card-gap);
}

.price-card__product-title {
  font-size: var(--font-xl);
  line-height: var(--line-xl);
  font-weight: inherit;
  margin: 0;
}

.price-card__product-manufacturer {
  display: block;
  font-weight: var(--font-regular);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.price-card__product-logo :deep(img) {
  block-size: 24px;
  inline-size: auto;
}

@media (min-width: 900px) {
  .price-card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }

  .price-card__section {
    grid-column: 2;
    border-block-start: none;
    border-inline-start: 1px solid var(--color-border-mute);
  }

  .price-card__header {
    grid-column: 1;
    grid-row: 1 / -1;
    align-self: start;
  }
}

@media (min-width: 1200px) {
  .price-card {
    grid-template-columns: 2fr 3fr 3fr;
  }

  .price-card__section {
    grid-column: auto;
  }
}
</style>
