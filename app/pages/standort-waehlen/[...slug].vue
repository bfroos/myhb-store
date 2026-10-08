<template>
  <!-- go.* Auswahl ohne Standort (shared/adsChooser.ts): Behandlung -> Standort -> v2-Seite -->
  <PagesAdsChooserList
    v-if="view"
    :title="view.title"
    :eyebrow="view.eyebrow"
    :lead="view.lead"
    :groups="view.groups"
    :back="view.back"
    :placement="view.placement"
  />
</template>

<script setup lang="ts">
import {
  ADS_CHOOSER_CATEGORIES,
  ADS_CHOOSER_PATH,
  adsChooserCategory,
  adsChooserLocations,
  adsChooserTreatments,
  isAdsChooserTreatment,
} from "#shared/adsChooser";
import { adsV2Terms } from "#shared/adsTemplateV2Content";
import type { AdsChooserGroup } from "~/components/pages/adsChooser/List.vue";

const { isAdsMode } = useSiteModeFlags();
if (!isAdsMode.value) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found", fatal: true });
}

const route = useRoute();
const slug = computed(() => {
  const raw = route.params.slug;
  return (Array.isArray(raw) ? raw : [raw]).filter((s): s is string => !!s);
});

const label = (key: string) => adsV2Terms(key)?.label ?? key.split("/")[1]!;
const treatmentItems = (cat: string) =>
  adsChooserTreatments(cat).map((key) => ({ href: `${ADS_CHOOSER_PATH}/${key}`, title: label(key) }));

const view = computed(() => {
  const [cat, treatment] = slug.value;

  if (!cat) {
    return {
      title: "Welche Behandlung interessiert dich?",
      lead: "Wähle deine Behandlung, danach deinen Standort.",
      groups: ADS_CHOOSER_CATEGORIES.map<AdsChooserGroup>((c) => ({ label: c.label, items: treatmentItems(c.key) })),
      back: null,
      placement: "chooser_treatment",
    };
  }

  const category = adsChooserCategory(cat);
  if (!category || slug.value.length > 2) return null;

  if (!treatment) {
    return {
      eyebrow: category.label,
      title: "Welche Behandlung interessiert dich?",
      lead: "Wähle deine Behandlung, danach deinen Standort.",
      groups: [{ items: treatmentItems(cat) }],
      back: { href: ADS_CHOOSER_PATH, label: "Alle Behandlungen" },
      placement: "chooser_treatment",
    };
  }

  const key = `${cat}/${treatment}`;
  if (!isAdsChooserTreatment(key)) return null;
  return {
    eyebrow: `${category.label} · ${label(key)}`,
    title: "Wo möchtest du behandelt werden?",
    lead: "Wähle deine Lounge – dort siehst du Preise, Ärzt:innen und freie Termine.",
    groups: [
      {
        items: adsChooserLocations().map((l) => ({
          href: `/standorte/${l.key}/${key}`,
          title: l.city,
          sub: l.name,
        })),
      },
    ],
    back: { href: `${ADS_CHOOSER_PATH}/${cat}`, label: `Andere ${category.label}-Behandlung` },
    placement: "chooser_location",
  };
});

if (!view.value) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found", fatal: true });
}

useHead({
  title: computed(() => `${view.value?.eyebrow ? `${view.value.eyebrow} – ` : ""}${view.value?.title ?? ""} | MY HEALTH & BEAUTY`),
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});
</script>
