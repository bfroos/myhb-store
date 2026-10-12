<template>
  <BlockRenderer v-if="headerBlocks" :blocks="headerBlocks" />
  <!-- E24 #313: Wegweiser zu den Kostenseiten je Thema (nur www) -->
  <UiLayoutSectionBlock v-if="!isAdsMode" spacing="sibling">
    <nav class="priceGuide" aria-label="Kosten nach Thema">
      <NuxtLink v-for="g in guides" :key="g.href" :to="g.href" class="priceGuide__item">
        <strong>{{ g.title }}</strong>
        <span>{{ g.text }}</span>
      </NuxtLink>
    </nav>
  </UiLayoutSectionBlock>
  <BlockProductCategoryPriceOverview :productCategories="shownCategories" />
  <BlockRenderer v-if="bottomBlocks" :blocks="bottomBlocks" />
</template>

<script setup lang="ts">
import { costPagePrices, fillPrices } from "#shared/costPages";

const { fetchPage, productCategories, seo, topBlocks, bottomBlocks } =
  usePricesPage();

const pageLoaded = await fetchPage();

// Schema.org ItemList (Service + Offer) for the treatment prices
const config = useRuntimeConfig();
const { isAdsMode } = useSiteModeFlags();
const prices = computed(() => costPagePrices((productCategories.value ?? []) as any));

// #313: www-Title/H1 mit "Kosten" und konkreten Preisen; Strapi-Text bleibt.
const SEO_TITLE = "Preise & Kosten 2026 – Faltenbehandlung, Hyaluron & mehr";
const SEO_DESCRIPTION =
  "Alle Preise bei MY HEALTH & BEAUTY: Faltenbehandlung 1 Zone {z1}, Lippen 0,5 ml {lips05}, Profhilo® {profhilo}. Ärztlich, an 9 Standorten gleich.";
if (pageLoaded) {
  await setPageSeo(
    isAdsMode.value
      ? seo.value
      : ({
          ...(seo.value ?? {}),
          metaTitle: SEO_TITLE,
          metaDescription: fillPrices(SEO_DESCRIPTION, prices.value),
        } as any),
  );
}
const headerBlocks = computed(() =>
  isAdsMode.value
    ? topBlocks.value
    : (topBlocks.value ?? []).map((b: any) =>
        b?.__component === "blocks.page-header" ? { ...b, headline: "Preise und Kosten" } : b,
      ),
);
const guides = computed(() => [
  {
    href: "/p/botox-kosten",
    title: "Faltenbehandlung",
    text: fillPrices("Muskelrelaxans pro Zone ab {z1}", prices.value) || "Preise pro Zone",
  },
  {
    href: "/behandlungen/hyaluron/lippen-aufspritzen#kosten",
    title: "Lippen aufspritzen",
    text: fillPrices("0,5 ml {lips05}, 1 ml {lips1}", prices.value) || "Preise je ml",
  },
  {
    href: "/p/hyaluron-spritzen-kosten",
    title: "Hyaluron",
    text: "Preise je Bereich und Menge",
  },
  {
    href: "/p/skinbooster-preise",
    title: "Skinbooster",
    text: fillPrices("Profhilo® {profhilo} pro Sitzung", prices.value) || "Preise pro Sitzung",
  },
]);

// go.: keine Schoenheits-OPs anbieten (Benjamin, 29.09.2026) - deren
// Seiten gibt es im Ads-Baum auch nicht (z. B. Lidstraffung lief auf 404).
const shownCategories = computed(() =>
  isAdsMode.value
    ? (productCategories.value ?? []).filter(
        (c: { slug?: string }) => !/^schoenheit/.test(c?.slug ?? ""),
      )
    : productCategories.value,
);
const priceListSchema = computed(() =>
  buildPriceListSchema(
    shownCategories.value,
    (config.public.publicUrl as string) || "",
    { omitOffers: isAdsMode.value },
  ),
);
useSchemaOrg(priceListSchema);
</script>

<style scoped>
.priceGuide {
  display: grid;
  gap: var(--space-400);
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
.priceGuide__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-500);
  border-radius: 16px;
  background: var(--color-card-bg-light, #fff);
  color: inherit;
  text-decoration: none;
  border: 1px solid var(--color-gray-200, #e5e5e5);
}
.priceGuide__item:hover {
  border-color: var(--color-gray-700, #444);
}
.priceGuide__item span {
  color: var(--color-text-muted, #666);
  font-size: var(--font-sm);
}
</style>
