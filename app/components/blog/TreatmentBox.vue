<template>
  <!-- E24 #316: Ratgeber -> Buchung (shared/blogTreatment.ts) -->
  <UiLayoutSectionBlock v-if="name" :spacing="compact ? 'sibling' : undefined">
    <p v-if="compact" class="btb-line" data-track-placement="blog_price_line">
      <strong>{{ name }} bei MY HEALTH &amp; BEAUTY:</strong>
      {{ price ? `${price}, ` : "" }}ärztlich, an {{ cities.length || 9 }} Standorten –
      <a href="#in-deiner-stadt">Termin in deiner Stadt</a>
    </p>
    <section v-else id="in-deiner-stadt" class="btb" data-track-placement="blog_city_box">
      <h2 class="btb__title">{{ name }} in deiner Stadt</h2>
      <p>
        Bei MY HEALTH &amp; BEAUTY{{ price ? ` ${price}` : "" }} – es behandeln ausschließlich
        Ärztinnen und Ärzte, an allen Standorten zum gleichen Preis, nach Verfügbarkeit auch ohne Termin.
      </p>
      <ul class="btb__cities" role="list">
        <li v-for="c in cities" :key="c.href"><NuxtLink :to="c.href">{{ c.label }}</NuxtLink></li>
      </ul>
      <p class="btb__links">
        <NuxtLink :to="`/behandlungen/${pathKey}`">{{ name }}: Wirkung, Ablauf und Risiken</NuxtLink>
        <template v-if="cost"> · <NuxtLink :to="cost.href">{{ cost.text }}</NuxtLink></template>
      </p>
      <SharedButton :button="bookingButton" :button-props="{ size: 'lg', variant: 'primary' }" />
    </section>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { SharedButtonAction, SharedButtonMethod } from "~/lib/strapi/dto/enums";
import { costPageForPathKey } from "#shared/blogTreatment";

const props = defineProps<{ pathKey: string; compact?: boolean }>();

const { data } = await useAsyncData(`blog-treatment:${props.pathKey}`, async () => {
  const [page, locs] = await Promise.all([
    strapiFetch<any>(`/treatment-pages/by-path/${props.pathKey}`, { query: { locale: "de" } }).catch(() => null),
    strapiFetch<{ data: any[] }>("/locations/bookable", { query: { locale: "de", pathKey: props.pathKey } }).catch(() => ({ data: [] })),
  ]);
  const t = page?.data?.treatment;
  return {
    name: String(page?.data?.name ?? "").replace(/®/g, "").trim(),
    cent: t?.priceInEuroCent ?? null,
    ab: t?.isStartingPrice !== false,
    locations: (locs?.data ?? [])
      .filter((l: any) => l?.slug && l.city?.slug && l.type !== "clinic")
      .map((l: any) => ({ label: l.city.name, href: `/standorte/${l.city.slug}/${l.slug}/${props.pathKey}` })),
  };
});

const name = computed(() => data.value?.name ?? "");
const price = computed(() =>
  data.value?.cent
    ? `${data.value.ab ? "ab " : ""}${(data.value.cent / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
    : null,
);
const cities = computed(() => [...(data.value?.locations ?? [])].sort((a, b) => a.label.localeCompare(b.label, "de")));
const cost = computed(() => costPageForPathKey(props.pathKey));
const bookingButton = {
  label: "Termin buchen",
  method: SharedButtonMethod.ACTION,
  action: SharedButtonAction.APPOINTMENT_BOOKING,
};
</script>

<style scoped>
.btb,
.btb-line {
  background: var(--color-card-bg-light, #fff);
  border-radius: var(--border-radius-card, 24px);
  padding: var(--space-card-pad);
  line-height: 1.6;
}
.btb-line {
  margin: 0;
  padding: var(--space-500) var(--space-card-pad-xs);
}
.btb > * + * {
  margin-top: var(--space-500);
}
.btb p {
  margin-bottom: 0;
}
.btb a,
.btb-line a {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.btb__title {
  margin: 0;
  font-size: clamp(1.375rem, 1.1rem + 1vw, 1.875rem);
  font-weight: var(--font-bold);
  line-height: 1.2;
}
.btb__cities {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-300);
  margin: var(--space-500) 0 0;
  padding: 0;
  list-style: none;
}
.btb__cities li {
  border: 1px solid var(--color-gray-200, #e5e5e5);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: var(--font-sm);
}
</style>
