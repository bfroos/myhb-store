<template>
  <div class="productHero__details">
    <header class="productHero__details__header">
      <h1 class="productHero__details__title">
        <span class="productHero__details__manufacturer">{{
          manufacturerName
        }}</span>
        {{ productName }}
      </h1>
      <ul v-if="hasVariants" class="productHero__details__variants" role="list">
        <li v-for="variant in activeVariants" :key="variant.slug">
          <UiAtomBaseButton
            :variant="isCurrentVariant(variant) ? 'tertiary' : 'secondary'"
            is-toggle
            size="sm"
            @click="emit('setCurrentVariant', variant)"
          >
            {{ variant.label }}
          </UiAtomBaseButton>
        </li>
      </ul>
      <h2 v-if="currentVariant" class="productHero__details__subtitle">
        {{ currentVariant.label }}
      </h2>
      <div v-if="hasDescription" class="productHero__details__description">
        <UiLayoutRichText :blocks="currentVariant?.description ?? []" />
      </div>
      <div
        v-if="hasPrice && offerCent"
        class="productHero__details__price productHero__details__price--offer"
      >
        <span class="productHero__details__offer">
          {{ formatEuroCent(offerCent) }}*
        </span>
        <span class="productHero__details__price-note">{{
          t("blocks.productHero.includesVat")
        }}</span>
        <span class="productHero__details__regular">
          regulär {{ formatPriceInEuro(currentVariant?.priceInEuroCent ?? 0) }}
        </span>
        <span class="productHero__details__footnote">{{ footnote }}</span>
      </div>
      <div v-else-if="hasPrice" class="productHero__details__price">
        {{ formatPriceInEuro(currentVariant?.priceInEuroCent ?? 0) }}
        <span class="productHero__details__price-note">{{
          t("blocks.productHero.includesVat")
        }}</span>
      </div>
    </header>
    <footer class="productHero__details__footer">
      <div class="productHero__details__footer-inner">
        <IconShoppingCartOff
          size="40"
          stroke="1.5"
          class="productHero__details__footer-icon"
          aria-hidden="true"
        />
        <div class="productHero__details__footer-body">
          <p class="productHero__details__footer-text">
            {{ t("blocks.productHero.footerDescription") }}
          </p>
          <SharedButton :button="bookAppointmentButton" />
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { IconShoppingCartOff } from "@tabler/icons-vue";
import { SharedButtonAction, SharedButtonMethod } from "~/lib/strapi/dto/enums";
import type { ProductVariantDto } from "~/lib/strapi/dto/components";
import { formatEuroCent, newCustomerFootnote } from "#shared/newCustomerOffer";

const props = defineProps<{
  manufacturerName: string;
  productName: string;
  variants: ProductVariantDto[];
  currentVariant: ProductVariantDto | null;
}>();

const emit = defineEmits<{
  setCurrentVariant: [variant: ProductVariantDto];
}>();

const { t } = useI18n();

const activeVariants = computed(() => props.variants.filter((v) => v.isActive));

const hasVariants = computed(() => activeVariants.value.length > 0);

const hasDescription = computed(
  () => (props.currentVariant?.description?.length ?? 0) > 0,
);

const hasPrice = computed(
  () => (props.currentVariant?.priceInEuroCent ?? 0) > 0,
);

// go.* (Ads-Modus): Neukundenpreis mit Sternchen, regulaerer Preis klein
// darunter (wie /preise und die Behandlungsseiten, #187). www: unveraendert.
const { newCustomerCent, discountPct } = useDisplayPrice();
const offerCent = computed(() =>
  newCustomerCent(props.currentVariant?.priceInEuroCent),
);
const footnote = computed(() => newCustomerFootnote(discountPct.value));

const bookAppointmentButton = computed(() => ({
  label: t("cta.bookAppointment"),
  method: SharedButtonMethod.ACTION,
  action: SharedButtonAction.APPOINTMENT_BOOKING,
}));

function isCurrentVariant(variant: ProductVariantDto): boolean {
  return props.currentVariant?.slug === variant.slug;
}
</script>

<style scoped>
.productHero__details {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-top: 1px solid var(--color-border-mute);
}

.productHero__details__header,
.productHero__details__footer {
  padding: var(--space-card-pad);
}

.productHero__details__title {
  font-size: var(--font-4xl);
  line-height: var(--line-4xl);
  margin: 0;
}

.productHero__details__manufacturer {
  display: block;
  font-size: var(--font-md);
  line-height: var(--line-md);
}

.productHero__details__subtitle {
  font-size: var(--font-md);
  line-height: var(--line-md);
  margin: 0 0 var(--space-300);
}

.productHero__details__variants {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-300);
  list-style: none;
  padding: 0;
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

.productHero__details__price--offer {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: var(--space-200);
}

.productHero__details__offer {
  font-weight: var(--font-bold);
  color: #b91c1c;
}

.productHero__details__regular {
  flex-basis: 100%;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  font-weight: var(--font-bold);
}

.productHero__details__footnote {
  flex-basis: 100%;
  font-size: var(--font-xs, 0.75rem);
  line-height: var(--line-xs, 1.35);
  color: var(--color-gray-700, #374151);
}

.productHero__details__price-note {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-muted);
}

.productHero__details__footer {
  border-top: 1px solid var(--color-border-mute);
}

.productHero__details__footer-inner {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--space-600);
}

.productHero__details__footer-icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.productHero__details__footer-body {
  min-width: 0;
}

.productHero__details__footer-text {
  margin: 0 0 var(--space-600);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

@media (min-width: 900px) {
  .productHero__details {
    width: 50%;
    border-top: none;
    border-left: 1px solid var(--color-border-mute);
  }
}
</style>
