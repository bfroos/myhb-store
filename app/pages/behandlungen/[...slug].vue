<template>
  <UiOrganismBaseBreadcrumb v-if="!isAdsMode" :items="breadcrumbItems" />
  <BlockTreatmentHero
    v-if="fixedBlocks.hero"
    v-bind="fixedBlocks.hero"
    show-floating-cta
  />
  <PagesTreatmentCommonBlocks :fixed-blocks="fixedBlocks" />
  <BlockLocationTeasers
    v-if="hasTreatmentLocations"
    :headline="treatmentLocationTeasersHeadline"
    :locations="treatmentLocations"
    :treatment-path-key="treatmentPage?.pathKey"
    :show-filters="false"
  />
  <BlockRenderer v-if="blocks" :blocks="blocks" />
</template>
<script setup lang="ts">
import type { TreatmentType } from "~/lib/strapi/dto/enums";

const config = useRuntimeConfig();
const { isAdsMode } = useSiteModeFlags();
const { t } = useI18n();
const {
  fetchTreatment,
  fixedBlocks,
  breadcrumbItems,
  seo,
  localizations,
  blocks,
  treatmentPage,
} = useTreatmentPage();
const { locations: treatmentLocations, fetchLocations } = useLocationFinder();

const treatmentType = computed<TreatmentType | undefined>(
  () => treatmentPage.value?.treatment?.type,
);

const hasTreatmentLocations = computed(
  () => (treatmentLocations.value?.length ?? 0) > 0,
);

const treatmentLocationTeasersHeadline = computed(() =>
  t("treatments.treatment.locationTeasers.headline", {
    treatment: treatmentPage.value?.name ?? "",
  }),
);

const treatmentPageLoaded = await fetchTreatment();

if (treatmentPageLoaded) {
  if (treatmentType.value) {
    await fetchLocations({ treatmentType: treatmentType.value });
  }
  usePageI18nParams(localizations.value, "pathKey");
  await setPageSeo(seo.value);
}

// Schema.org MedicalProcedure
const route = useRoute();
const { brandName } = useBrand();

const medicalProcedureSchema = computed(() =>
  buildGeneralMedicalProcedureSchema(treatmentPage.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    brandName: brandName.value,
  }),
);

// Schema.org BreadcrumbList
const breadcrumbSchema = computed(() =>
  buildBreadcrumbSchema(breadcrumbItems.value, (config.public.publicUrl as string) || ""),
);

// Schema.org FAQPage (nur wenn FAQ-Block vorhanden)
const faqSchema = computed(() => {
  if (!fixedBlocks.value?.faq) return null;
  
  // Merge faqs from both direct faqs and faqSets
  const directFaqs = fixedBlocks.value.faq.faqs ?? [];
  const faqSetsItems = (fixedBlocks.value.faq.faqSets ?? []).flatMap(
    (set: any) => set.faqs ?? [],
  );
  const allFaqs = [...directFaqs, ...faqSetsItems];
  return buildFaqPageSchema(allFaqs);
});

useSchemaOrg(medicalProcedureSchema);
useSchemaOrg(breadcrumbSchema);
useSchemaOrg(faqSchema);
</script>
