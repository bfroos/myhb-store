<template>
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <BlockRenderer v-if="blocks" :blocks="blocks" />
  <UiLayoutSectionBlock v-if="blocks">
    <CareerDoctorApplicationForm />
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
// Karriere-Landingpage fuer Aerzte in der Facharztweiterbildung (#101).
// Die Route ist fest, die Inhalte kommen aus dem Strapi-pages-Eintrag mit
// diesem Slug - so pflegt die Redaktion Texte, Videos und Meinungen ohne
// Deploy.
//
// Das Bewerbungsformular (#102) haengt fest am Seitenende statt in der Dynamic
// Zone: Es braucht eine Server-Route, einen Datei-Upload und eine
// Einwilligung — nichts davon gehoert in die Hand der Redaktion. Anker
// `#bewerbung`, darauf zeigen die CTA-Bloecke.
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
