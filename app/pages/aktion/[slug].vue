<template>
  <!--
    Bundesweite Meta-Seiten im Design der go.-Vorlage v2 (Benjamin,
    04.10.2026): Gegenstueck zu den handgebauten /p/botox-meta-rabatt und
    /p/lippen-meta-rabatt, fuer einen A/B-Test in Meta. Nur auf www (go. sagt
    nie "Botox"), noindex. Inhalte und Preise wie die Standortseiten, ohne
    Standort: die Wahl kommt beim Buchen.
  -->
  <PagesTreatmentAdsV2Page
    v-if="hero"
    :hero="hero"
    :treatment-page="treatmentPage"
    :location="null"
    bundesweit
    :terms-override="cfg.terms"
    :wording="cfg.wording"
    :standorte="STANDORTE"
  />
</template>

<script setup lang="ts">
import type { TreatmentPageDto } from "~/lib/strapi/dto/collections";
import type { AdsV2Terms } from "#shared/adsTemplateV2Content";
import { mapTreatmentPageFixedBlocks } from "~/lib/strapi/mapper/mapTreatmentPageBlocks";
import { rememberOfferVariant } from "~/lib/offerVariant";

type AktionConfig = {
  /** Allgemeine www-Behandlungsseite in Strapi (Preise, Bild, Behandlung) */
  strapiPath: string;
  /** Inhalte der Vorlage (shared/adsTemplateV2Content.ts) */
  pathKey: string;
  headline: string;
  title: string;
  /** Name im Buchungsdialog ("Wähle deine Lounge"), sonst der aus Strapi */
  bookingName?: string;
  terms?: Partial<AdsV2Terms>;
  wording?: ReadonlyArray<readonly [string, string]>;
};

const AKTIONEN: Record<string, AktionConfig> = {
  botox: {
    strapiPath: "botox/stirnfalte",
    pathKey: "muskelrelaxans/stirnfalte",
    headline: "Botox – Falten sanft entspannen",
    title: "Botox mit 20 % Neukundenrabatt",
    bookingName: "Botox",
    terms: {
      label: "Botox",
      treatment: "Botox-Behandlung",
      object: "Botox",
      about: "zu Botox",
      subline: "Entspannter, frischer Ausdruck – Behandlung durch Ärzte, ohne Ausfallzeit",
      howItWorks:
        "Botox entspannt gezielt den Muskel, der die Falte macht – etwa an Stirn, Zornesfalte oder Krähenfüßen. Die Haut darüber glättet sich, deine Mimik bleibt.",
    },
    // go.-Texte sagen "Muskelrelaxans"; auf www heisst es wie in der Anzeige.
    wording: [
      ["Ein Muskelrelaxans", "Botox"],
      ["ein Muskelrelaxans", "Botox"],
      ["Muskelrelaxans", "Botox"],
    ],
  },
  lippen: {
    strapiPath: "hyaluron/lippen-aufspritzen",
    pathKey: "hyaluron/lippen-aufspritzen",
    headline: "Lippen aufspritzen",
    title: "Lippen aufspritzen mit 20 % Neukundenrabatt",
  },
};

/** Standorte mit Buchung und Google-Ads-Seiten (shared/adsTemplateV2.ts). */
const STANDORTE = [
  "Aachen", "Berlin", "Duisburg", "Düsseldorf", "Kaiserslautern",
  "Köln", "Leipzig", "Mönchengladbach", "Recklinghausen",
] as const;

// Schlanker Rahmen ohne Menue/Footer-Navigation (app/layouts/landing.vue)
definePageMeta({ layout: "landing" });

const route = useRoute();
const { t } = useI18n();
const { isAdsMode } = useSiteModeFlags();
const { setzeSeitenBehandlung } = useSeitenBehandlung();
const slug = String(route.params.slug ?? "");
const cfg = AKTIONEN[slug];
// Nur www: go. darf den Markennamen nicht zeigen.
if (!cfg || isAdsMode.value) {
  throw createError({ statusCode: 404, statusMessage: "Not found", fatal: true });
}

const { data } = await useAsyncData(`aktion:${slug}`, () =>
  strapiFetch<any>(`/treatment-pages/by-path/${cfg.strapiPath}`, { query: { locale: "de" } }),
);
const treatmentPage = computed<TreatmentPageDto | null>(() => (data.value?.data as TreatmentPageDto) ?? null);
if (!treatmentPage.value) {
  throw createError({ statusCode: 404, statusMessage: "Not found", fatal: true });
}
setzeSeitenBehandlung(
  cfg.bookingName ? { ...treatmentPage.value, name: cfg.bookingName } : treatmentPage.value,
);

const hero = computed(() => {
  const page = treatmentPage.value;
  if (!page) return null;
  const base = mapTreatmentPageFixedBlocks(page, t, false, "de").hero as any;
  return {
    ...base,
    headline: cfg.headline,
    headlinePrefix: null,
    headlineSuffix: null,
    eyebrow: null,
    subline: cfg.terms?.subline ?? base.subline,
    treatmentPathKey: cfg.pathKey,
  };
});

// Tracking: eigene Vorlagenkennung, Variante A (Rabatt-Dialog -> Buchung).
const TEMPLATE = "v2-meta";
if (import.meta.client) {
  (window as any).__myhbPreviewTemplate = TEMPLATE;
  ((window as any).dataLayer = (window as any).dataLayer || []).push({ template: TEMPLATE });
  rememberOfferVariant("a");
}
onBeforeUnmount(() => {
  if (!import.meta.client) return;
  if ((window as any).__myhbPreviewTemplate !== TEMPLATE) return;
  delete (window as any).__myhbPreviewTemplate;
  (window as any).dataLayer?.push({ template: undefined });
});

useHead({
  title: `${cfg.title} | MY HEALTH & BEAUTY`,
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});
</script>
