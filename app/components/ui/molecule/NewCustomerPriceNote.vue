<template>
  <!--
    go.* (Ads-Modus): Erklaerung zu den *-Preisen der Preisliste, gut sichtbar
    ueber der Liste. www: nicht gerendert.
  -->
  <aside
    v-if="showsNewCustomerPrice"
    class="nc-note"
    :class="{ 'nc-note--compact': compact }"
    data-new-customer-note
  >
    <p class="nc-note__main">{{ footnote }}</p>
    <p v-if="zoneLine" class="nc-note__zone">{{ zoneLine }}</p>
    <p v-if="!compact && hasSurgery" class="nc-note__sub">
      Schönheitsoperationen zum regulären Preis.
    </p>
  </aside>
</template>

<script setup lang="ts">
import {
  buildNewCustomerOffer,
  newCustomerFootnote,
  ONE_ZONE_PRICE_CENT,
} from "#shared/newCustomerOffer";

type NoteCategory = {
  slug?: string | null;
  products?: Array<{
    variants?: Array<{
      label?: string | null;
      priceInEuroCent?: number | null;
      isActive?: boolean | null;
    }> | null;
  }> | null;
};

const props = defineProps<{
  categories?: NoteCategory[] | null;
  /** Kurzfassung (nur Fussnote + Zonenzeile), z. B. unter der Liste. */
  compact?: boolean;
}>();

const { showsNewCustomerPrice, discountPct } = useDisplayPrice();

const footnote = computed(() => newCustomerFootnote(discountPct.value));

const hasSurgery = computed(() =>
  (props.categories ?? []).some((c) => /^schoenheit/.test(c?.slug ?? "")),
);

const muscleRelaxantCategory = computed(() =>
  (props.categories ?? []).find((c) =>
    /^(?:botox|muskelrelaxans)/.test(c?.slug ?? ""),
  ),
);

/**
 * "Muskelrelaxans ab zwei Zonen: 2 Zonen 199,99 € − 20 % … = 79,99 € je Zone"
 * — derselbe Rechenweg wie im Hero der Zonenseiten (#187). Der 2-Zonen-Preis
 * kommt aus der Produktvariante "2-Zonen", sonst aus dem Fallback.
 */
const zoneLine = computed(() => {
  const cat = muscleRelaxantCategory.value;
  if (!cat) return null;
  const twoZone = (cat.products ?? [])
    .flatMap((p) => p?.variants ?? [])
    .find((v) => v?.isActive !== false && /^2[\s-]*zonen/i.test(v?.label ?? ""));
  const offer = buildNewCustomerOffer({
    pathKey: "muskelrelaxans",
    priceCent: ONE_ZONE_PRICE_CENT,
    isStartingPrice: true,
    twoZonePriceCent: twoZone?.priceInEuroCent ?? null,
    discountPct: discountPct.value,
  });
  if (offer?.kind !== "zone" || !offer.calculation) return null;
  // Geschuetzte Leerzeichen, damit "199,99 €" nicht umbricht (375 px).
  return `Muskelrelaxans ab zwei Zonen: ${offer.calculation}.`.replace(
    /(\d) (€|%)/g,
    "$1\u00a0$2",
  );
});
</script>

<style scoped>
.nc-note {
  display: flex;
  flex-direction: column;
  gap: var(--space-100);
  width: 100%;
  padding: var(--space-300) var(--space-400);
  background: linear-gradient(to right, #f6eef6, #fff5f1);
  border-radius: var(--border-radius-200);
  color: var(--color-gray-900);
}

.nc-note p {
  margin: 0;
}

.nc-note__main {
  font-size: var(--font-md, 1rem);
  line-height: var(--line-md, 1.5);
  font-weight: var(--font-bold);
  color: #b91c1c;
}

.nc-note__zone,
.nc-note__sub {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.nc-note--compact {
  background: none;
  padding: 0;
}

.nc-note--compact .nc-note__main {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}
</style>
