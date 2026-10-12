<template>
  <!-- E24 #313: Kostenseiten (Botox, Hyaluron, Skinbooster) auf www -->
  <template v-if="costPage">
    <PagesCostPage :config="costPage" />
    <BlockRenderer v-if="costPageBlocks.length" :blocks="costPageBlocks" />
  </template>
  <BlockRenderer v-else-if="blocks" :blocks="blocks" />
  <!-- go.: Sternchen der Neukundenpreise auf den Preisseiten erklaeren -->
  <BlockAdsPriceFootnote
    v-if="isAdsMode && priceHero"
    :treatment="priceHero.treatment"
    :treatment-path-key="priceHero.treatmentPathKey"
  />
</template>

<script setup lang="ts">
import { META_PAGE_SPLIT_ENABLED, META_PAGE_SPLIT_SCRIPT, metaSplitTarget } from "#shared/metaPageSplit";
import { costPageFor, costPagePrices, fillPrices } from "#shared/costPages";
const { fetchGeneralPage, seo, blocks, localizations } = useGeneralPage();
const { isAdsMode } = useSiteModeFlags();
const priceHero = computed(() =>
  (blocks.value as any[] | undefined)?.find(
    (block) =>
      block?.__component === "blocks.treatment-hero" &&
      block?.treatment?.priceInEuroCent,
  ),
);

// Dankesseite nach Calendly-Buchung: booking_confirmed auch fuer Buchungen
// ausserhalb des Embeds (elanagency/myhb-os#131). Wirkt nur auf den Slugs
// aus BOOKING_THANK_YOU_SLUGS, sonst ein No-op.
useBookingThankYouTracking();

const pageLoaded = await fetchGeneralPage();

// www: eigene Kostenseiten-Vorlage (shared/costPages.ts). go. behaelt die
// Strapi-Fassung mit Neukundenpreisen (adsPricePages).
const { locale: costLocale } = useI18n();
const costRoute = useRoute();
const costPage = computed(() =>
  !isAdsMode.value && costLocale.value === "de" ? costPageFor(String(costRoute.params.slug ?? "")) : null,
);
// Unter der Vorlage bleiben die Strapi-Bloecke ausser Hero und alter
// Preistabelle (Behandlungskacheln, Standortkarte, Club, Bewertungen).
const costPageBlocks = computed(() =>
  ((blocks.value as any[]) ?? []).filter(
    (b) => !["blocks.treatment-hero", "blocks.trust-grid"].includes(b?.__component),
  ),
);

// Meta-Seitentest (shared/metaPageSplit.ts): ein Teil der Besucher der alten
// Meta-Seiten geht vor dem ersten Zeichnen auf das v2-Gegenstueck. Nur www.
const route = useRoute();
if (!isAdsMode.value && META_PAGE_SPLIT_ENABLED && metaSplitTarget(route.path)) {
  useHead({
    script: [{ key: "meta-page-split", innerHTML: META_PAGE_SPLIT_SCRIPT, tagPosition: "head", tagPriority: "critical" }],
  });
}

if (pageLoaded) {
  // Reihenfolge zaehlt: setPageSeo liest die von usePageI18nParams gemeldete
  // Sprachabdeckung, um nur existierende hreflang-Alternates auszugeben.
  usePageI18nParams(localizations.value, "slug");
  if (costPage.value) {
    const { fetchPage: fetchPrices, productCategories } = usePricesPage();
    await fetchPrices();
    const prices = costPagePrices((productCategories.value ?? []) as any);
    await setPageSeo({
      ...(seo.value ?? {}),
      metaTitle: fillPrices(costPage.value.metaTitle, prices),
      metaDescription: fillPrices(costPage.value.metaDescription, prices),
    } as any);
  } else {
    await setPageSeo(seo.value);
  }
}
</script>
