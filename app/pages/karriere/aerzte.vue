<template>
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <BlockRenderer v-if="blocks" :blocks="blocks" />
</template>

<script setup lang="ts">
// Karriere-Landingpage fuer Aerzte in der Facharztweiterbildung (#101).
// Die Route ist fest, die Inhalte kommen aus dem Strapi-pages-Eintrag mit
// diesem Slug - so pflegt die Redaktion Texte, Videos und Meinungen ohne
// Deploy. Der Bewerben-CTA wird als Block gepflegt und in #102 auf HubSpot
// umgehaengt.
const KARRIERE_AERZTE_SLUG = "karriere-aerzte";

const { t } = useI18n();
const { fetchGeneralPage, seo, blocks } = useGeneralPage(KARRIERE_AERZTE_SLUG);

const pageLoaded = await fetchGeneralPage();

if (pageLoaded) {
  // Kein usePageI18nParams: die Route hat keine dynamischen Params, die
  // hreflang-Alternates ergeben sich aus den konfigurierten Sprachpfaden.
  await setPageSeo(seo.value);
}

const breadcrumbItems = computed(() => [
  {
    title: t("career.breadcrumbTitle"),
    to: "/karriere",
  },
  {
    title: t("doctors.breadcrumbTitle"),
  },
]);
</script>
