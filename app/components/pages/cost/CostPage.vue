<template>
  <!-- E24 #313: Kostenseite je Hauptthema (shared/costPages.ts) -->
  <div class="cost">
    <UiLayoutSectionBlock>
      <div class="cost-card cost-hero">
        <h1 class="cost-h1">{{ config.h1 }}</h1>
        <p class="cost-sub">{{ config.subline }}</p>
        <p class="cost-answer" data-speakable>{{ fill(config.answer) }}</p>
        <div class="cost-actions">
          <SharedButton :button="bookingButton" :button-props="{ size: 'lg', variant: 'primary' }" />
          <a class="cost-btn" href="#standorte">Preise an deinem Standort</a>
        </div>
        <p class="cost-muted">Preise an allen 9 Standorten gleich · Stand {{ priceDate }}</p>
      </div>
    </UiLayoutSectionBlock>

    <!-- Zonen (Muskelrelaxans) -->
    <UiLayoutSectionBlock v-if="zoneRows.length" spacing="sibling">
      <div class="cost-card cost-card--soft" data-track-placement="cost_zones">
        <h2 class="cost-h2">{{ config.zoneTable!.headline }}</h2>
        <p>{{ config.zoneTable!.intro }}</p>
        <div class="cost-table-wrap">
          <table class="cost-table">
            <thead><tr><th scope="col">Zonen</th><th scope="col">Preis</th><th scope="col">je Zone</th></tr></thead>
            <tbody>
              <tr v-for="z in zoneRows" :key="z.zones">
                <td>{{ z.zones }} {{ z.zones === 1 ? "Zone" : "Zonen" }}</td>
                <td class="cost-num">{{ z.price }}</td>
                <td class="cost-num cost-muted-cell">{{ z.perZone }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Behandlungen -->
    <UiLayoutSectionBlock v-if="treatmentRows.length" spacing="sibling">
      <div class="cost-card" data-track-placement="cost_table">
        <h2 class="cost-h2">{{ config.tableHeadline }}</h2>
        <div class="cost-table-wrap">
          <table class="cost-table">
            <thead><tr><th scope="col">{{ config.tableLabel }}</th><th scope="col">Preis</th></tr></thead>
            <tbody>
              <tr v-for="t in treatmentRows" :key="t.name">
                <td><NuxtLink v-if="t.href" :to="t.href">{{ t.name }}</NuxtLink><template v-else>{{ t.name }}</template></td>
                <td class="cost-num">{{ t.price }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Praeparate je ml (Hyaluron) -->
    <UiLayoutSectionBlock v-if="config.showProducts && productRows.length" spacing="sibling">
      <div class="cost-card cost-card--soft" data-track-placement="cost_products">
        <h2 class="cost-h2">Preise je Präparat und Menge</h2>
        <div class="cost-table-wrap">
          <table class="cost-table">
            <thead><tr><th scope="col">Präparat</th><th scope="col">Menge</th><th scope="col">Preis</th></tr></thead>
            <tbody>
              <tr v-for="p in productRows" :key="p.key">
                <td>{{ p.product }}</td>
                <td>{{ p.amount }}</td>
                <td class="cost-num">{{ p.price }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Inklusive + Faktoren -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="cost-card cost-split">
        <div>
          <h2 class="cost-h2">Im Preis enthalten</h2>
          <ul class="cost-list">
            <li v-for="x in config.inclusive" :key="x">{{ x }}</li>
          </ul>
        </div>
        <div>
          <h2 class="cost-h2">{{ config.factorsHeadline }}</h2>
          <ul class="cost-list">
            <li v-for="x in factors" :key="x">{{ x }}</li>
          </ul>
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Standorte -->
    <UiLayoutSectionBlock spacing="sibling">
      <div id="standorte" class="cost-card cost-card--soft" data-track-placement="cost_locations">
        <h2 class="cost-h2">Preise an deinem Standort</h2>
        <p>Die Preise gelten an allen Standorten gleich. Behandlungen, Öffnungszeiten und freie Termine findest du auf der Seite deiner Stadt:</p>
        <ul class="cost-places" role="list">
          <li v-for="l in locationLinks" :key="l.href"><NuxtLink :to="l.href">{{ l.label }}</NuxtLink></li>
        </ul>
      </div>
    </UiLayoutSectionBlock>

    <!-- Fragen -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="cost-card" data-track-placement="cost_faq">
        <h2 class="cost-h2">Häufige Fragen zu den Kosten</h2>
        <div class="cost-faq">
          <details v-for="(f, i) in faqs" :key="f.question" class="cost-faq__item" :open="i === 0">
            <summary class="cost-faq__q">{{ f.question }}</summary>
            <p class="cost-faq__a">{{ f.answer }}</p>
          </details>
        </div>
        <p class="cost-links">
          <template v-for="(l, i) in config.links" :key="l.href">
            <NuxtLink :to="l.href">{{ l.text }}</NuxtLink><span v-if="i < config.links.length - 1"> · </span>
          </template>
        </p>
      </div>
    </UiLayoutSectionBlock>
  </div>
</template>

<script setup lang="ts">
import { SharedButtonAction, SharedButtonMethod } from "~/lib/strapi/dto/enums";
import {
  costPagePrices,
  fillPrices,
  formatEuro,
  type CostCategory,
  type CostPageConfig,
} from "#shared/costPages";

const props = defineProps<{ config: CostPageConfig }>();

const { fetchPage, productCategories } = usePricesPage();
await fetchPage();
const categories = computed<CostCategory[]>(() => (productCategories.value ?? []) as CostCategory[]);
const category = computed(() => categories.value.find((c) => c.slug === props.config.categorySlug) ?? null);
const prices = computed(() => costPagePrices(categories.value));
const fill = (t: string) => fillPrices(t, prices.value);
const priceDate = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date());

const bookingButton = {
  label: "Termin buchen",
  method: SharedButtonMethod.ACTION,
  action: SharedButtonAction.APPOINTMENT_BOOKING,
};

const zoneRows = computed(() => {
  const zt = props.config.zoneTable;
  if (!zt) return [];
  const product = (category.value?.products ?? []).find((p) => zt.productName.test(String(p.name ?? "")));
  return (product?.variants ?? [])
    .map((v) => ({ m: /^(\d)-zonen?$/.exec(String(v.slug ?? "")), v }))
    .filter((x) => x.m && x.v.priceInEuroCent && x.v.isActive !== false)
    .map(({ m, v }) => {
      const zones = Number(m![1]);
      const per = v.priceInEuroCent! / zones / 100;
      return { zones, price: formatEuro(v.priceInEuroCent!), perZone: zones === 1 ? "–" : `ca. ${Math.round(per)}\u00a0€` };
    })
    .sort((a, b) => a.zones - b.zones);
});

const treatmentRows = computed(() =>
  (category.value?.treatments ?? [])
    .filter((t) => t.priceInEuroCent)
    .map((t) => ({
      name: String(t.name ?? "").trim(),
      href: t.treatmentPage?.pathKey ? `/behandlungen/${t.treatmentPage.pathKey}` : null,
      price: formatEuro(t.priceInEuroCent!, !!t.isStartingPrice),
      cent: t.priceInEuroCent!,
    }))
    .sort((a, b) => a.cent - b.cent || a.name.localeCompare(b.name, "de")),
);

const productRows = computed(() =>
  (category.value?.products ?? []).flatMap((p) =>
    (p.variants ?? [])
      .filter((v) => v.priceInEuroCent && v.isActive !== false)
      .map((v) => ({
        key: `${p.name}-${v.slug}`,
        product: String(p.name ?? "").trim(),
        amount: String(v.label ?? v.name ?? "").trim(),
        price: formatEuro(v.priceInEuroCent!),
      })),
  ),
);

const factors = computed(() => props.config.factors.map(fill).filter(Boolean));
const faqs = computed(() =>
  props.config.faqs.map((f) => ({ question: f.question, answer: fill(f.answer) })).filter((f) => f.answer),
);

// Standorte (dieselbe Quelle wie die Standortkacheln)
const { data: bookable } = await useAsyncData("cost:bookable", () =>
  strapiFetch<{ data: any[] }>("/locations/bookable", { query: { locale: "de" } }).catch(() => ({ data: [] })),
);
const locationLinks = computed(() =>
  (bookable.value?.data ?? [])
    .filter((l: any) => l?.slug && l.city?.slug && l.type !== "clinic")
    .map((l: any) => ({
      label: `${l.city.name} – ${l.name}`,
      href: `/standorte/${l.city.slug}/${l.slug}/${props.config.locationCategoryPath}`,
    }))
    .sort((a: any, b: any) => a.label.localeCompare(b.label, "de")),
);

// ---------------------------------------------------------------- Schema
const runtime = useRuntimeConfig();
const route = useRoute();
const pageUrl = computed(() => `${runtime.public.publicUrl}${route.path}`);
useSchemaOrg(
  computed(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.value.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  })),
);
useSchemaOrg(
  computed(() => {
    const rows = treatmentRows.value;
    if (!rows.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      name: props.config.h1,
      url: pageUrl.value,
      itemListElement: rows.map((t) => ({
        "@type": "Offer",
        price: (t.cent / 100).toFixed(2),
        priceCurrency: "EUR",
        ...(t.href ? { url: `${runtime.public.publicUrl}${t.href}` } : {}),
        itemOffered: { "@type": "Service", name: t.name },
      })),
    };
  }),
);
</script>

<style src="./cost.css"></style>
