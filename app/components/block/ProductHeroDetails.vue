<template>
  <div class="productHero__details">
    <div class="productHero__details__header">
      <h1>
        <span>
          {{ manufacturerName }}
        </span>
        {{ productName }}
      </h1>
      <ul class="productHero__variants">
        <li v-for="variant in activeVariants" :key="variant.slug">
          <UiAtomBaseButton
            :variant="isCurrentVariant(variant) ? 'tertiary' : 'secondary'"
            is-toggle
            size="sm"
            @click.native="$emit('setCurrentVariant', variant)"
          >
            {{ variant.label }}
          </UiAtomBaseButton>
        </li>
      </ul>
      <h2 v-if="currentVariant">
        {{ currentVariant.label }}
      </h2>
      <div class="productHero__details__description">
        <UiLayoutRichText :blocks="currentVariant?.description ?? []" />
      </div>
      <div
        v-if="currentVariant?.priceInEuroCent"
        class="productHero__details__price"
      >
        {{ formatPriceInEuro(currentVariant?.priceInEuroCent) }}
        <span>{{ $t("blocks.productHero.includesVat") }}</span>
      </div>
    </div>
    <div class="productHero__details__footer">
      <div>
        <IconShoppingCartOff size="40px" stroke="1.5" />
        <div>
          <p>
            {{ $t("blocks.productHero.footerDescription") }}
          </p>
          <SharedButton
            :button="{
              label: $t('cta.bookAppointment'),
              method: SharedButtonMethod.ACTION,
              action: SharedButtonAction.APPOINTMENT_BOOKING,
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductVariantDto } from "~/lib/strapi/dto/components";
import { IconShoppingCartOff } from "@tabler/icons-vue";
import { SharedButtonMethod, SharedButtonAction } from "~/lib/strapi/dto/enums";

const props = defineProps<{
  manufacturerName: string;
  productName: string;
  variants: ProductVariantDto[];
  currentVariant: ProductVariantDto | null;
}>();

const activeVariants = computed(() => {
  return props.variants.filter((v) => v.isActive);
});

const isCurrentVariant = (variant: ProductVariantDto) => {
  return props.currentVariant?.slug === variant.slug;
};
</script>
<style scoped>
.productHero__details__header,
.productHero__details__footer {
  padding: var(--space-card-pad);
}
.productHero__details {
  border-top: var(--color-border-mute) 1px solid;
}
.productHero__details__header h1 {
  font-size: var(--font-4xl);
  line-height: var(--line-4xl);
}
.productHero__details__header h2 {
  font-size: var(--font-md);
  line-height: var(--line-md);
  margin: 0 0 var(--space-300);
}
.productHero__details__header span {
  display: block;
  font-size: var(--font-md);
  line-height: var(--line-md);
}
.productHero__variants {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: var(--space-300);
  margin: var(--space-600) 0;
}
.productHero__details__description {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  margin-top: var(--space-300);
}
.productHero__details__price {
  font-size: var(--font-xl);
  line-height: var(--line-xl);
  margin-top: var(--space-600);
}
.productHero__details__price span {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-muted);
}
.productHero__details__footer {
  border-top: var(--color-border-mute) 1px solid;
}
.productHero__details__footer > div {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--space-600);
}
.productHero__details__footer > div > div > p {
  margin: 0 0 var(--space-600);
  color: var(--color-text-light);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}
@media screen and (min-width: 900px) {
  .productHero__details {
    width: 50%;
    border-top: none;
    border-left: var(--color-border-mute) 1px solid;
  }
}
</style>
