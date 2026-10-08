<template>
  <!-- go.* Auswahl am Standort (shared/adsChooser.ts): Behandlung -> v2-Seite -->
  <PagesAdsChooserList
    v-if="view"
    :title="view.title"
    :eyebrow="view.eyebrow"
    :lead="view.lead"
    :groups="view.groups"
    :back="view.back"
    placement="chooser_treatment_at_location"
  />
</template>

<script setup lang="ts">
import {
  ADS_CHOOSER_CATEGORIES,
  ADS_CHOOSER_PATH,
  ADS_LOCATION_CHOOSER_PATH,
  adsChooserCategory,
  adsChooserLocation,
  adsChooserTreatments,
} from "#shared/adsChooser";
import { adsV2Terms } from "#shared/adsTemplateV2Content";

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

const view = computed(() => {
  const [city, loc, cat] = slug.value;
  if (!city || !loc || slug.value.length > 3) return null;
  const location = adsChooserLocation(city, loc);
  if (!location) return null;
  const category = cat ? adsChooserCategory(cat) : null;
  if (cat && !category) return null;

  const base = `/standorte/${location.key}`;
  const categories = category ? [category] : ADS_CHOOSER_CATEGORIES;
  return {
    eyebrow: `${location.city} · ${location.name}`,
    title: category ? `${category.label}: welche Behandlung?` : "Welche Behandlung interessiert dich?",
    lead: "Wähle deine Behandlung – dort siehst du Preise, Ablauf und freie Termine.",
    groups: categories.map((c) => ({
      label: category ? undefined : c.label,
      items: adsChooserTreatments(c.key).map((key) => ({ href: `${base}/${key}`, title: label(key) })),
    })),
    back: category
      ? { href: `${ADS_LOCATION_CHOOSER_PATH}/${location.key}`, label: "Alle Behandlungen hier" }
      : { href: ADS_CHOOSER_PATH, label: "Andere Behandlung oder anderer Standort" },
  };
});

if (!view.value) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found", fatal: true });
}

useHead({
  title: computed(() => `${view.value?.title ?? ""} – ${view.value?.eyebrow ?? ""} | MY HEALTH & BEAUTY`),
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});
</script>
