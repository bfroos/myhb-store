<template>
  <BlockRenderer v-if="blocks" :blocks="blocks" />
  <!-- go.: Sternchen der Neukundenpreise auf den Preisseiten erklaeren -->
  <BlockAdsPriceFootnote
    v-if="isAdsMode && priceHero"
    :treatment="priceHero.treatment"
    :treatment-path-key="priceHero.treatmentPathKey"
  />
</template>

<script setup lang="ts">
import { META_PAGE_SPLIT_ENABLED, META_PAGE_SPLIT_SCRIPT, metaSplitTarget } from "#shared/metaPageSplit";
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
  await setPageSeo(seo.value);
}
</script>
