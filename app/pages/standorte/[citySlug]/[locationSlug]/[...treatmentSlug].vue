<template>
  <!-- go.-Seitenvorlage v2 (shared/adsTemplateV2.ts, seit 01.10.2026 live) -->
  <PagesTreatmentAdsV2Page
    v-if="isV2 && fixedBlocks?.hero"
    :hero="fixedBlocks.hero"
    :treatment-page="treatmentPage"
    :location="location"
  />
  <!-- E24 SEO-Pilot Lippen (shared/seoPilotLippen.ts): eigene Stadtseite -->
  <template v-else-if="seoPilot && fixedBlocks?.hero">
    <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
    <PagesTreatmentSeoCityPage
      :hero="fixedBlocks.hero"
      :treatment-page="treatmentPage"
      :location="location"
      :content="seoPilot"
    />
  </template>
  <template v-else>
    <UiOrganismBaseBreadcrumb v-if="!isAdsMode" :items="breadcrumbItems" />
    <PagesTreatmentOrderedBlocks
      :fixed-blocks="fixedBlocks"
      :dynamic-blocks="treatmentPage?.blocks"
      :order="blockOrder"
      :hidden-blocks="(treatmentPage as any)?.hiddenBlocks"
    >
      <template #afterHero>
        <BlockTreatmentAnswer
          v-if="answer"
          :headline="answerHeadline((treatmentPage as any)?.pathKey, treatmentPage?.name, location?.city?.name)"
          :text="answer"
        />
      </template>
      <template #reviewer="{ inline }">
        <UiMoleculeMedicalReviewerSignature
          v-if="!isAdsMode"
          :reviewer="DEFAULT_MEDICAL_REVIEWER"
          :inline="inline"
        />
      </template>
    </PagesTreatmentOrderedBlocks>
    <!-- E24 #346: lokale Ergaenzung (shared/seoCityExtras.ts), Strapi-Seite bleibt -->
    <PagesTreatmentSeoLocalExtra
      v-if="cityExtra"
      :extra="cityExtra"
      :hero="fixedBlocks?.hero"
      :location="location"
    />
    <BlockPurchaseFaq
      v-if="purchase.length"
      :headline="`Fragen vor der Buchung in ${location?.city?.name ?? ''}`"
      :faqs="purchase"
    />
    <!-- E24 #315: Stadtseite -> bundesweite Seite und Kostenseite (www) -->
    <UiLayoutSectionBlock v-if="hubLink" spacing="sibling">
      <p class="hubLink">
        Wirkung, Ablauf und Risiken bundesweit erklärt:
        <NuxtLink :to="hubLink.href">{{ hubLink.text }}</NuxtLink>
        <template v-if="hubLink.costHref">
          · <NuxtLink :to="hubLink.costHref">{{ hubLink.costText }}</NuxtLink>
        </template>
      </p>
    </UiLayoutSectionBlock>
    <!-- go.: Sternchen-Erklaerung + regulaerer Preis (nicht mehr im Hero) -->
    <BlockAdsPriceFootnote
      v-if="isAdsMode && fixedBlocks?.hero"
      :treatment="fixedBlocks.hero.treatment"
      :treatment-path-key="fixedBlocks.hero.treatmentPathKey"
    />
  </template>
</template>
<script setup lang="ts">
import { buildVideoObjectSchema } from "~/utils/schemaVideo";
import { buildLocalBusinessSchema } from "~/utils/schemaLocation";
import { medicalProcedureId } from "~/utils/schemaTreatment";
import { mergeBlockOrder } from "~/lib/blocks/mergeBlockOrder";
import { answerHeadline, treatmentAnswer } from "#shared/treatmentAnswer";
import { purchaseFaqs } from "#shared/purchaseFaq";
import { seoTitleFor } from "#shared/seoTitles";
import { anfrageZiel, isKlinikBehandlung } from "#shared/klinik";
import { isAdsTemplateV2LivePage } from "#shared/adsTemplateV2";
import { ADS_OFFER_AB_ENABLED, ADS_OFFER_REDIRECT_SCRIPT } from "#shared/adsOfferVariant";
import { rememberOfferVariant } from "~/lib/offerVariant";
import { seoPilotCity } from "#shared/seoPilotLippen";
import { applyLocalFacts } from "#shared/localFacts";
import { extraFaqsForSchema, seoCityExtra } from "#shared/seoCityExtras";
import { isLocalGateActive, localGateCanonical, type LocalGatePageData } from "#shared/localContentGate";
import { employeeDisplayName, pickAdsV2Reviews } from "#shared/adsTemplateV2";
import {
  LOCATION_ADS_BLOCK_ORDER,
  LOCATION_SEO_BLOCK_ORDER,
} from "~/lib/blocks/treatmentBlockOrder";

const {
  fetchPage,
  fetchTreatmentPrice,
  fixedBlocks,
  breadcrumbItems,
  seo,
  locationLocalizations,
  cityLocalizations,
  treatmentPageLocalizations,
  treatmentPage,
  location,
  treatmentPrice, // Expose for schema
  redirectTarget,
} = useLocationTreatmentPage();

const { isAdsMode } = useSiteModeFlags();
// Klinik-Regel (E28 #1636): OP-Seiten fuehren in den Anfrage-Funnel.
provideKlinikSeite(() => {
  const pathKey = (treatmentPage.value as any)?.pathKey as string | undefined;
  const type = (treatmentPage.value as any)?.treatment?.type as string | undefined;
  return isKlinikBehandlung({ type, pathKey }) ? anfrageZiel(pathKey) : null;
});
// go.: Seitenvorlage v2 fuer die Seiten aus ADS_TEMPLATE_V2_PAGES.
const isV2 = useAdsTemplateV2();
// www: E24 SEO-Pilot (Lippen Köln/Düsseldorf). Nur deutsche Seite.
const seoRoute = useRoute();
const seoPilot = computed(() => {
  if (isAdsMode.value) return null;
  const r = seoRoute;
  if (!/^\/standorte\//.test(r.path)) return null;
  const p = r.params as Record<string, unknown>;
  const slug = Array.isArray(p.treatmentSlug) ? p.treatmentSlug.join("/") : String(p.treatmentSlug ?? "");
  const city = seoPilotCity(String(p.citySlug ?? ""), String(p.locationSlug ?? ""), slug);
  // #312: Standortfakten aus Strapi gewinnen, sonst Text im Code.
  return city ? applyLocalFacts(city, location.value?.localFacts) : null;
});
// www: E24 #346, lokale Ergaenzung unter der Strapi-Seite. Nicht neben dem
// Pilot und nicht auf go.
const cityExtra = computed(() => {
  if (isAdsMode.value || seoPilot.value) return null;
  if (!/^\/standorte\//.test(seoRoute.path)) return null;
  const p = seoRoute.params as Record<string, unknown>;
  return seoCityExtra((treatmentPage.value as any)?.pathKey, String(p.citySlug ?? ""), String(p.locationSlug ?? ""));
});
const pageLoaded = await fetchPage();
// Standort-Konsolidierung: Die Behandlung gehoert in dieser Stadt zu einem
// anderen Standort (Köln: OPs -> MediaPark, nichtoperativ -> Köln Arcaden).
// Serverseitig ein direkter 301 auf die finale URL, ohne Zwischenschritt.
// Query (utm_*, gclid) geht mit, wie bei den Redirects der Middleware.
if (redirectTarget.value) {
  const { query, hash } = useRoute();
  await navigateTo(
    { path: redirectTarget.value, query, hash },
    { redirectCode: 301, replace: true },
  );
}

// Tracking: Ereignisse auf v2-Seiten tragen `template: "v2"` (Vorschau:
// "v2-preview"), damit sich vorher/nachher trennen laesst
// (useGoogleAnalytics liest window.__myhbPreviewTemplate).
const V2_TEMPLATE = "v2";
if (import.meta.client && isV2.value) {
  (window as any).__myhbPreviewTemplate = V2_TEMPLATE;
  ((window as any).dataLayer = (window as any).dataLayer || []).push({
    template: V2_TEMPLATE,
  });
}
// Angebots-Test (shared/adsOfferVariant.ts): `?angebot=beratung` fuehrt vor
// dem ersten Zeichnen auf /ab-beratung/... (Variante B). Die Seite kommt aus
// dem ISR-Cache ohne Query, deshalb ein Skript im <head> statt Server-Weiche.
// Ohne den Parameter tut es nichts; hier ist man in Variante A.
if (isV2.value && ADS_OFFER_AB_ENABLED) {
  useHead({
    script: [{ key: "ads-offer-ab", innerHTML: ADS_OFFER_REDIRECT_SCRIPT, tagPosition: "head", tagPriority: "critical" }],
  });
  if (import.meta.client) rememberOfferVariant("a");
}
onBeforeUnmount(() => {
  if (!import.meta.client) return;
  if ((window as any).__myhbPreviewTemplate !== V2_TEMPLATE) return;
  // Beim Wechsel auf die naechste v2-Seite hat deren setup die Markierung
  // schon gesetzt (die URL ist hier bereits die neue) - dann stehen lassen.
  const next = /^\/standorte\/([^/]+)\/([^/]+)\/(.+?)\/?$/.exec(window.location.pathname);
  if (next && isAdsTemplateV2LivePage(next[1], next[2], next[3])) return;
  delete (window as any).__myhbPreviewTemplate;
  (window as any).dataLayer?.push({ template: undefined });
});

// E24 #315: Link von der Stadtseite auf die bundesweite Seite (Hub-Signal)
// und die Kostenseite des Themas. Nur www, Deutsch.
const COST_PAGE_BY_CATEGORY: Record<string, { href: string; text: string }> = {
  botox: { href: "/p/botox-kosten", text: "Kosten pro Zone" },
  hyaluron: { href: "/p/hyaluron-spritzen-kosten", text: "Hyaluron Kosten" },
  skinbooster: { href: "/p/skinbooster-preise", text: "Skinbooster Kosten" },
};
const hubRoute = useRoute();
const hubLink = computed(() => {
  if (isAdsMode.value) return null;
  if (!/^\/standorte\//.test(hubRoute.path)) return null;
  const pathKey = String((treatmentPage.value as any)?.pathKey ?? "");
  if (!pathKey || pathKey.startsWith("schoenheitsoperationen")) return null;
  // Kontrollgruppe des Lippen-Pilots (Leipzig, Aachen) bleibt unveraendert.
  if (pathKey === "hyaluron/lippen-aufspritzen" && ["hoefe-am-bruehl", "aquis-plaza"].includes(String(hubRoute.params.locationSlug ?? ""))) return null;
  const name = seoTitleFor(pathKey, null)?.h1 ?? treatmentPage.value?.name ?? "";
  const cost = COST_PAGE_BY_CATEGORY[pathKey.split("/")[0] ?? ""];
  return {
    href: `/behandlungen/${pathKey}`,
    text: name,
    costHref: pathKey === "hyaluron/lippen-aufspritzen" ? "/behandlungen/hyaluron/lippen-aufspritzen#kosten" : cost?.href,
    costText: pathKey === "hyaluron/lippen-aufspritzen" ? "Lippen aufspritzen Kosten" : cost?.text,
  };
});

// E24 #314: Kurzantwort mit Stadt und Center (nur www, Deutsch).
const answerRoute = useRoute();
const answer = computed(() => {
  if (isAdsMode.value || !/^\/standorte\//.test(answerRoute.path)) return null;
  const t = (treatmentPage.value as any)?.treatment;
  return treatmentAnswer({
    pathKey: (treatmentPage.value as any)?.pathKey,
    name: treatmentPage.value?.name,
    priceInEuroCent: treatmentPrice.value ?? t?.priceInEuroCent,
    isStartingPrice: t?.isStartingPrice,
    city: location.value?.city?.name,
    center: location.value?.name,
  });
});

// blockOrder sortiert nur; nicht gelistete Bloecke werden in Default-
// Reihenfolge angehaengt. Ausgeblendet wird ausschliesslich ueber
// hiddenBlocks. Details: lib/blocks/mergeBlockOrder.ts
const blockOrder = computed<string[]>(() =>
  mergeBlockOrder(
    (treatmentPage.value as any)?.blockOrder,
    isAdsMode.value ? LOCATION_ADS_BLOCK_ORDER : LOCATION_SEO_BLOCK_ORDER,
    (treatmentPage.value as any)?.hiddenBlocks,
  ),
);

if (pageLoaded) {
  // Fetch price fallback from general treatment page
  await fetchTreatmentPrice();
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
    {
      localizations: treatmentPageLocalizations.value ?? [],
      key: "pathKey",
      paramName: "treatmentSlug",
    },
  ], { hreflangLocales: ["de"] }); // TSEO-01: nur de + x-default
  // E24 #312: Mindestpaket je Stadtseite (shared/localContentGate.ts). Ohne
  // eigenen lokalen Inhalt zeigt das Canonical auf den Hub. Nur www, nur
  // Behandlungen aus LOCAL_GATE_PATH_KEYS; sonst wie bisher.
  const gateParams = seoRoute.params as Record<string, unknown>;
  const gateCity = String(gateParams.citySlug ?? "");
  const gateLoc = String(gateParams.locationSlug ?? "");
  const gatePathKey = String((treatmentPage.value as any)?.pathKey ?? "");
  const gateActive =
    !isAdsMode.value &&
    /^\/standorte\//.test(seoRoute.path) &&
    isLocalGateActive(gatePathKey, gateCity, gateLoc);
  let canonicalPath: string | null = null;
  if (gateActive) {
    const pilot = seoPilot.value;
    const gatePage: LocalGatePageData = {
      hasOpeningHours: !!(location.value as any)?.openingHours?.week?.length,
    };
    if (pilot) {
      // Dieselbe Abfrage (und derselbe Key) wie in CityPage.vue.
      const { data: gateExtras } = await useFetch<{ reviews?: any[]; doctors?: any[] }>(
        `/api/seo-pilot/${pilot.citySlug}/${pilot.locationSlug}`,
        { key: `seo-pilot:${pilot.key}`, default: () => ({}) },
      );
      gatePage.doctors = (gateExtras.value?.doctors ?? []).filter((d: any) => employeeDisplayName(d)).length;
      gatePage.reviews = pickAdsV2Reviews(gateExtras.value?.reviews ?? [], pilot.city, gatePathKey, 4).length;
    }
    canonicalPath = localGateCanonical(gatePathKey, gateCity, gateLoc, pilot, gatePage);
  }
  // Vorschaubild beim Teilen: Titelbild der Seite statt des allgemeinen
  await setPageSeo(
    seoPilot.value
      ? { ...(seo.value ?? {}), metaTitle: seoPilot.value.metaTitle, metaDescription: seoPilot.value.metaDescription }
      : seo.value,
    (fixedBlocks.value?.hero as any)?.cover ?? null,
    { canonicalPath },
  );
}

// Schema.org MedicalProcedure
const config = useRuntimeConfig();
const route = useRoute();
const { brandName } = useBrand();
const appConfig = useAppConfig();

// Pilot-Seiten geben MedicalProcedure und FAQPage selbst aus (CityPage.vue).
const medicalProcedureSchema = computed(() =>
  seoPilot.value ? null : buildMedicalProcedureSchema(treatmentPage.value, location.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    brandName: brandName.value,
    ratingValue: appConfig.seo?.aggregateRating?.ratingValue,
    reviewCount: appConfig.seo?.aggregateRating?.reviewCount,
    priceInEuroCent: treatmentPrice?.value, // Pass fetched price to schema
    omitOffer: isAdsMode.value,
  }),
);

// Schema.org BreadcrumbList: kommt aus BaseBreadcrumb (TSEO-12)

// Schema.org FAQPage (nur wenn FAQ-Block sichtbar ist)
// #317: Kauf-Fragen im selben FAQPage-Schema (nur eins je Seite erlaubt)
const toRich = (f: { question: string; answer: string }) => ({
  question: f.question,
  answer: [{ type: "paragraph", children: [{ type: "text", text: f.answer }] }],
});
// Sichtbare Strapi-Fragen (ausgeblendete Bloecke zaehlen nicht).
const visibleStrapiFaqs = computed<any[]>(() => {
  const faq = fixedBlocks.value?.faq as any;
  if (!faq || isV2.value || !blockOrder.value.includes("faq")) return [];
  return [...(faq.faqs ?? []), ...(faq.faqSets ?? []).flatMap((set: any) => set.faqs ?? [])];
});
// E24 #317: Fragen mit Kaufabsicht (nur www, deutsche Stadtseite)
const purchaseRoute = useRoute();
const purchase = computed(() => {
  if (isAdsMode.value || !/^\/standorte\//.test(purchaseRoute.path)) return [];
  const t = (treatmentPage.value as any)?.treatment;
  return purchaseFaqs({
    pathKey: (treatmentPage.value as any)?.pathKey,
    priceInEuroCent: treatmentPrice.value ?? t?.priceInEuroCent,
    isStartingPrice: t?.isStartingPrice,
    city: location.value?.city?.name,
    existingQuestions: visibleStrapiFaqs.value.map((f: any) => String(f?.question ?? "")),
  });
});
const faqSchema = computed(() => {
  if (seoPilot.value) return null;
  // v2 zeigt eigene Fragen statt des Strapi-FAQ-Blocks.
  if (isV2.value) return null;

  const all = [...visibleStrapiFaqs.value, ...purchase.value.map(toRich), ...extraFaqsForSchema(cityExtra.value)];
  return all.length ? buildFaqPageSchema(all as any) : null;
});

// Schema.org VideoObject (from about block videos)
const videoSchema = computed(() => {
  if (!blockOrder.value.includes("about")) return null;
  if (seoPilot.value) return null;
  // v2 zeigt den About-Block (und sein Video) nicht.
  if (isV2.value) return null;

  const about = fixedBlocks.value?.about as any;

  return buildVideoObjectSchema({
    media: about?.mediaItems?.[0],
    poster: about?.poster,
    name: about?.headline || treatmentPage.value?.name || "",
    description: about?.intro || about?.headline || "",
  });
});

// Schema.org LocalBusiness (for address + stars in SERPs)
const localBusinessSchema = computed(() =>
  buildLocalBusinessSchema(location.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    brandName: brandName.value,
    // Ads mode: only advertise this page's own treatment in the offer catalog
    // (no generic Botox/Hyaluron/PRP/... leaking into a go.* landing page).
    isAdsMode: isAdsMode.value,
    offerCatalogTreatmentName:
      treatmentPage.value?.treatment?.name ?? treatmentPage.value?.name ?? null,
    // Klinik (MediaPark): Katalog nur mit der Behandlung dieser Seite.
    offerCatalogNames: treatmentPage.value?.name ? [treatmentPage.value.name] : [],
    // Behandlung -> ausfuehrende Einrichtung dieses Standorts.
    availableServiceId: medicalProcedureId(
      (config.public.publicUrl as string) || "",
      route.path,
    ),
  }),
);

useSchemaOrg(medicalProcedureSchema);
useSchemaOrg(faqSchema);
useSchemaOrg(videoSchema);
useSchemaOrg(localBusinessSchema); // NEW: Address + Stars in SERPs
</script>

<style scoped>
.hubLink {
  margin: 0;
  padding: var(--space-500) var(--space-card-pad-xs);
  border-radius: var(--border-radius-card, 24px);
  background: var(--color-card-bg-light, #fff);
  line-height: 1.6;
}
.hubLink a {
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
