<template>
  <UiOrganismBaseBreadcrumb v-if="!isAdsMode" :items="breadcrumbItems" />
  <BlockTreatmentHero v-if="fixedBlocks?.hero" v-bind="fixedBlocks.hero" />
  <BlockLocationContact
    v-if="fixedBlocks?.locationContact"
    id="standort"
    v-bind="fixedBlocks.locationContact"
  />
  <BlockLocationDirections
    v-if="fixedBlocks?.locationDirections"
    v-bind="fixedBlocks.locationDirections"
  />
  <BlockMediaBento v-if="fixedBlocks?.about" v-bind="fixedBlocks.about" />
  <BlockTreatmentTeasers
    v-if="fixedBlocks?.treatmentTeasers"
    v-bind="fixedBlocks.treatmentTeasers"
  />
  <BlockLocationSiblingHint
    v-if="!isAdsMode && siblingLocations?.length"
    :city-name="location?.city?.name ?? ''"
    :siblings="siblingLocations"
  />
  <BlockReviewsBlock v-if="fixedBlocks?.reviews" v-bind="fixedBlocks.reviews" />
  <BlockJobTeasers
    v-if="fixedBlocks?.jobTeasers"
    v-bind="fixedBlocks.jobTeasers"
  />
  <!-- go.: Sternchen der Kachelpreise, eine Zeile am Seitenende. -->
  <UiLayoutSectionBlock v-if="adsFootnote">
    <p class="location-ads-footnote" data-new-customer-footnote>
      {{ adsFootnote }}
    </p>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import { buildVideoObjectSchema } from "~/utils/schemaVideo";
import {
  buildNewCustomerOffer,
  newCustomerFootnote,
} from "#shared/newCustomerOffer";
const { isAdsMode } = useSiteModeFlags();
const {
  fetchWithTreatments,
  fixedBlocks,
  breadcrumbItems,
  location,
  locationLocalizations,
  cityLocalizations,
  siblingLocations,
  seo,
} = useLocationPage();

const locationLoaded = await fetchWithTreatments();

if (locationLoaded) {
  usePageI18nParamsFromSources([
    {
      localizations: locationLocalizations.value ?? [],
      key: "slug",
      paramName: "locationSlug",
    },
    {
      localizations: cityLocalizations.value ?? [],
      key: "slug",
      paramName: "citySlug",
    },
  ], { hreflangLocales: ["de"] }); // TSEO-01: nur de + x-default
  await setPageSeo(seo.value);
}

// go.: Fussnote zu den Neukundenpreisen der Kacheln (wie #187).
const { showsNewCustomerPrice, discountPct } = useDisplayPrice();
const adsFootnote = computed(() => {
  const pages = (fixedBlocks.value?.treatmentTeasers as any)?.treatmentAdsPages;
  if (!showsNewCustomerPrice.value || !pages?.length) return null;
  const zone = pages.some(
    (p: any) =>
      buildNewCustomerOffer({
        pathKey: p.pathKey,
        priceCent: p.treatment?.priceInEuroCent,
        isStartingPrice: p.treatment?.isStartingPrice,
        discountPct: discountPct.value,
      })?.kind === "zone",
  );
  const base = newCustomerFootnote(discountPct.value);
  return zone
    ? `${base}; „pro Zone“ gilt ab zwei Zonen Muskelrelaxans.`
    : `${base}.`;
});

// Schema.org LocalBusiness
const config = useRuntimeConfig();
const route = useRoute();
const { brandName } = useBrand();

const localBusinessSchema = computed(() =>
  buildLocalBusinessSchema(location.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    brandName: brandName.value,
    // Ads mode: location overview has no single treatment focus, so drop the
    // generic offer catalog entirely (no Botox/Hyaluron/PRP/... in go.* HTML).
    isAdsMode: isAdsMode.value,
    // Klinik: Katalog aus den hier tatsaechlich angebotenen Behandlungen
    // (MediaPark: nur OPs), siehe schemaLocation.ts.
    offerCatalogNames: (
      ((fixedBlocks.value?.treatmentTeasers as any)?.treatmentPages ?? []) as any[]
    )
      .filter((page) => (page?.ancestorSlugs?.length ?? 0) > 0)
      .map((page) => page?.name as string),
  }),
);

// Schema.org VideoObject
const videoSchema = computed(() => {
  const about = fixedBlocks.value?.about as any;
  return buildVideoObjectSchema({
    media: about?.mediaItems?.[0],
    poster: about?.poster,
    name: about?.headline || location.value?.name || "",
    description: about?.intro || about?.headline || "",
  });
});

useSchemaOrg(videoSchema);
useSchemaOrg(localBusinessSchema);
</script>

<style scoped>
.location-ads-footnote {
  margin: 0 auto;
  max-width: 72ch;
  font-size: var(--font-xs);
  line-height: 1.4;
  color: var(--color-text-light);
  text-align: center;
}
</style>
