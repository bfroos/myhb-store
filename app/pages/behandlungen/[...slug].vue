<template>
  <UiOrganismBaseBreadcrumb v-if="!isAdsMode" :items="breadcrumbItems" />
  <!-- E24 SEO-Pilot Lippen (shared/seoPilotLippen.ts): eigener Hub -->
  <PagesTreatmentSeoHubPage
    v-if="seoPilotHub && fixedBlocks.hero"
    :hero="fixedBlocks.hero"
    :treatment-page="treatmentPage"
    :content="SEO_HUB_LIPPEN"
  />
  <template v-else>
  <BlockTreatmentHero
    v-if="fixedBlocks.hero"
    v-bind="heroWithSeoH1"
    show-floating-cta
  />
  <PagesTreatmentOrderedBlocks
    :fixed-blocks="fixedBlocks"
    :order="COMMON_TREATMENT_BLOCK_ORDER"
  >
    <template #reviewer="{ inline }">
      <UiMoleculeMedicalReviewerSignature
        v-if="!isAdsMode"
        :reviewer="reviewer"
        :date="treatmentUpdatedAt"
        :inline="inline"
      />
    </template>
  </PagesTreatmentOrderedBlocks>
  </template>
  <PagesTreatmentRelatedArticles
    v-if="!isAdsMode && relatedArticles.length"
    :articles="relatedArticles"
  />
  <BlockLocationTeasers
    v-if="hasTreatmentLocations && !seoPilotHub"
    :headline="treatmentLocationTeasersHeadline"
    :locations="treatmentLocations"
    :treatment-path-key="treatmentPage?.pathKey"
    :treatment-name="isAdsMode ? undefined : treatmentPage?.name"
    :show-filters="false"
  />
  <!-- Pilot-Hub: Standortliste steht schon in der Standorttabelle -->
  <BlockRenderer v-if="blocks && !seoPilotHub" :blocks="blocks" />
  <!-- go.: Sternchen-Erklaerung + regulaerer Preis (nicht mehr im Hero) -->
  <BlockAdsPriceFootnote
    v-if="isAdsMode && fixedBlocks.hero"
    :treatment="fixedBlocks.hero.treatment"
    :treatment-path-key="fixedBlocks.hero.treatmentPathKey"
  />
</template>
<script setup lang="ts">
import type { TreatmentType } from "~/lib/strapi/dto/enums";
import { COMMON_TREATMENT_BLOCK_ORDER } from "~/lib/blocks/treatmentBlockOrder";
import { buildVideoObjectSchema } from "~/utils/schemaVideo";
import { SEO_HUB_LIPPEN, isSeoPilotHub } from "#shared/seoPilotLippen";
import { seoTitleFor } from "#shared/seoTitles";

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
// www: E24 SEO-Pilot, Hub "Lippen aufspritzen" (nur Deutsch).
const { locale: seoLocale } = useI18n();
const seoPilotHub = computed(
  () => !isAdsMode.value && seoLocale.value === "de" && isSeoPilotHub(treatmentPage.value?.pathKey),
);
// E24 #315: Title/H1 auf den Suchbegriff, Preis aus Strapi (nur www, Deutsch).
const seoTitle = computed(() =>
  !isAdsMode.value && seoLocale.value === "de"
    ? seoTitleFor(treatmentPage.value?.pathKey, (treatmentPage.value as any)?.treatment)
    : null,
);
const heroWithSeoH1 = computed(() =>
  seoTitle.value?.h1
    ? { ...fixedBlocks.value.hero, headlinePrefix: undefined, headline: seoTitle.value.h1, headlineSuffix: undefined }
    : fixedBlocks.value.hero,
);

if (treatmentPageLoaded) {
  if (treatmentType.value) {
    await fetchLocations({
      treatmentType: treatmentType.value,
      pathKey: treatmentPage.value?.pathKey,
    });
  }
  usePageI18nParams(localizations.value, "pathKey");
  await setPageSeo(
    seoPilotHub.value
      ? { ...(seo.value ?? {}), metaTitle: SEO_HUB_LIPPEN.metaTitle, metaDescription: SEO_HUB_LIPPEN.metaDescription }
      : seoTitle.value
        ? ({ ...(seo.value ?? {}), metaTitle: seoTitle.value.title } as any)
        : seo.value,
  );
  await fetchRelatedArticles(treatmentPage.value?.pathKey?.split("/")[0]);
}

// Schema.org MedicalProcedure
const route = useRoute();
const { brandName } = useBrand();
const appConfig = useAppConfig();

// TSEO-12: Pruefer aus Strapi (Feld medicalReviewer), sonst Dr. Ruppert.
const reviewer = computed(() =>
  resolveMedicalReviewer((treatmentPage.value as any)?.medicalReviewer),
);
const treatmentUpdatedAt = computed(
  () => (treatmentPage.value as any)?.updatedAt ?? null,
);

// Pilot-Hub gibt MedicalProcedure und FAQPage selbst aus (HubPage.vue).
const medicalProcedureSchema = computed(() =>
  seoPilotHub.value ? null : buildGeneralMedicalProcedureSchema(treatmentPage.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    brandName: brandName.value,
    ratingValue: appConfig.seo?.aggregateRating?.ratingValue,
    reviewCount: appConfig.seo?.aggregateRating?.reviewCount,
    omitOffer: isAdsMode.value,
  }),
);

// Schema.org BreadcrumbList: kommt aus BaseBreadcrumb (TSEO-12)

// Schema.org FAQPage (nur wenn FAQ-Block vorhanden)
const faqSchema = computed(() => {
  if (!fixedBlocks.value?.faq) return null;
  if (seoPilotHub.value) return null;
  
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
  if (seoPilotHub.value) return null;
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
    reviewer: reviewer.value,
    lastReviewed: treatmentUpdatedAt.value,
    brandName: brandName.value,
  }),
);

useSchemaOrg(medicalProcedureSchema);
useSchemaOrg(faqSchema);
useSchemaOrg(videoSchema);
useSchemaOrg(medicalWebPageSchema);
</script>
