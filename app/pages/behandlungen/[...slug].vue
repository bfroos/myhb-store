<template>
  <UiOrganismBaseBreadcrumb v-if="!isAdsMode" :items="breadcrumbItems" />
  <BlockTreatmentHero
    v-if="fixedBlocks.hero"
    v-bind="fixedBlocks.hero"
    show-floating-cta
  />
  <UiMoleculeMedicalReviewerSignature
    v-if="!isAdsMode"
    :reviewer="reviewer"
    :date="treatmentUpdatedAt"
  />
  <PagesTreatmentOrderedBlocks
    :fixed-blocks="fixedBlocks"
    :order="COMMON_TREATMENT_BLOCK_ORDER"
  />
  <PagesTreatmentRelatedArticles
    v-if="!isAdsMode && relatedArticles.length"
    :articles="relatedArticles"
  />
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
import { COMMON_TREATMENT_BLOCK_ORDER } from "~/lib/blocks/treatmentBlockOrder";
import { buildVideoObjectSchema } from "~/utils/schemaVideo";

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
const { articles: relatedArticles, fetchRelated: fetchRelatedArticles } =
  useRelatedArticles();

const treatmentType = computed<TreatmentType | undefined>(() => {
  // Blatt-Seiten (z.B. /behandlungen/botox/stirnfalte) haben ein eigenes
  // treatment mit type.
  const own = treatmentPage.value?.treatment?.type;
  if (own) return own;
  // Kategorieseiten (z.B. /behandlungen/botox) haben KEIN eigenes treatment
  // (treatment == null). Den Behandlungstyp aus der ersten verknüpften
  // Unterbehandlung ableiten, damit der Standorte-Block die buchbaren
  // Standorte korrekt nach Typ filtern kann (minimally-invasive vs. operational
  // etc.). Setzt voraus, dass die by-path-Antwort "type" bei
  // relatedTreatments.treatmentPages[].treatment mitliefert (siehe myhb-cms).
  const relatedPages = (treatmentPage.value as any)?.relatedTreatments
    ?.treatmentPages as
    | Array<{ treatment?: { type?: TreatmentType } }>
    | undefined;
  return relatedPages?.find((p) => p?.treatment?.type)?.treatment?.type;
});

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
  await fetchRelatedArticles(treatmentPage.value?.pathKey?.split("/")[0]);
}

// Schema.org MedicalProcedure
const route = useRoute();
const { brandName } = useBrand();
const appConfig = useAppConfig();

const reviewer = DEFAULT_MEDICAL_REVIEWER;
const treatmentUpdatedAt = computed(
  () => (treatmentPage.value as any)?.updatedAt ?? null,
);

const medicalProcedureSchema = computed(() =>
  buildGeneralMedicalProcedureSchema(treatmentPage.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    brandName: brandName.value,
    ratingValue: appConfig.seo?.aggregateRating?.ratingValue,
    reviewCount: appConfig.seo?.aggregateRating?.reviewCount,
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

// Schema.org VideoObject
const videoSchema = computed(() => {
  const about = fixedBlocks.value?.about as any;
  return buildVideoObjectSchema({
    media: about?.mediaItems?.[0],
    poster: about?.poster,
    name: about?.headline || treatmentPage.value?.name || "",
    description: about?.intro || about?.headline || "",
  });
});

// Schema.org MedicalWebPage (medizinisch geprueft von / lastReviewed)
const medicalWebPageSchema = computed(() =>
  buildMedicalWebPageSchema({
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    reviewer,
    lastReviewed: treatmentUpdatedAt.value,
    brandName: brandName.value,
  }),
);

useSchemaOrg(medicalProcedureSchema);
useSchemaOrg(breadcrumbSchema);
useSchemaOrg(faqSchema);
useSchemaOrg(videoSchema);
useSchemaOrg(medicalWebPageSchema);
</script>
