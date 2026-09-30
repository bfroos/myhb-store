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

if (pageLoaded) {
  // Reihenfolge zaehlt: setPageSeo liest die von usePageI18nParams gemeldete
  // Sprachabdeckung, um nur existierende hreflang-Alternates auszugeben.
  usePageI18nParams(localizations.value, "slug");
  await setPageSeo(seo.value);
}
</script>
