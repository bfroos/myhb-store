<template>
  <BlockRenderer v-if="blocks" :blocks="blocks" />
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

const { fetchLandingPage, seo, blocks, localizations } = useLandingPage();

// Klinik-Regel (E28 #1636): Seiten mit Anfrage-Funnel zeigen keine
// 20-%-Bloecke, und alle Buchungsknoepfe springen zum Funnel.
provideKlinikSeite(() => {
  const funnel = blocks.value?.find((b) => b.__component === "blocks.lead-funnel") as
    | { anchor?: string | null }
    | undefined;
  return funnel ? `#${(funnel.anchor || "anfrage").replace(/^#/, "")}` : null;
});

const pageLoaded = await fetchLandingPage();

if (pageLoaded) {
  // Reihenfolge zaehlt: setPageSeo liest die von usePageI18nParams gemeldete
  // Sprachabdeckung, um nur existierende hreflang-Alternates auszugeben.
  usePageI18nParams(localizations.value, "slug");
  await setPageSeo(seo.value);
}
</script>
