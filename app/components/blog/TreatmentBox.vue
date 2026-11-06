<template>
  <!-- E24 #316: Ratgeber -> Buchung (shared/blogTreatment.ts) -->
  <!-- Ratgeber-Layout (myhb-os#418): variant "card" steht im Artikel, mit Bild,
       Preis, Dauer und zwei Wegen (buchen oder mehr lesen). -->
  <section v-if="name && card" class="btc" data-track-placement="blog_treatment_card">
    <NuxtLink :to="`/behandlungen/${pathKey}`" class="btc__bild" tabindex="-1" aria-hidden="true">
      <UiAtomMediaPicture v-if="cover" :media="cover" :default-format="ImageFormat.MEDIUM" />
    </NuxtLink>
    <div class="btc__text">
      <p class="btc__eyebrow">Behandlung bei MY HEALTH &amp; BEAUTY</p>
      <h2 class="btc__titel">{{ name }}</h2>
      <p v-if="teaser" class="btc__teaser">{{ teaser }}</p>
      <ul class="btc__fakten" role="list">
        <li v-if="price"><strong>{{ price }}</strong></li>
        <li v-if="duration">{{ duration }}</li>
        <li>nur Ärzte, {{ cities.length || 9 }} Standorte</li>
      </ul>
      <div class="btc__knoepfe">
        <SharedButton :button="bookingButton" :button-props="{ size: 'md', variant: 'primary' }" />
        <NuxtLink :to="`/behandlungen/${pathKey}`" class="btc__mehr">Mehr zur Behandlung →</NuxtLink>
      </div>
    </div>
  </section>
  <UiLayoutSectionBlock v-else-if="name" :spacing="compact ? 'sibling' : undefined">
    <p v-if="compact" class="btb-line" data-track-placement="blog_price_line">
      <strong>{{ name }} bei MY HEALTH &amp; BEAUTY:</strong>
      {{ price ? `${price}, ` : "" }}ärztlich, an {{ cities.length || 9 }} Standorten –
      <a href="#in-deiner-stadt">Termin in deiner Stadt</a>
    </p>
    <section v-else id="in-deiner-stadt" class="btb" data-track-placement="blog_city_box">
      <h2 class="btb__title">{{ name }} in deiner Stadt</h2>
      <p>
        Bei MY HEALTH &amp; BEAUTY{{ price ? ` ${price}` : "" }} – es behandeln ausschließlich
        Ärzte, an allen Standorten zum gleichen Preis, nach Verfügbarkeit auch ohne Termin.
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
import { ImageFormat, SharedButtonAction, SharedButtonMethod } from "~/lib/strapi/dto/enums";
import { costPageForPathKey } from "#shared/blogTreatment";

const props = defineProps<{ pathKey: string; compact?: boolean; card?: boolean }>();

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
    cover: page?.data?.hero?.cover ?? page?.data?.teaser?.image ?? null,
    teaser: String(page?.data?.teaser?.description ?? page?.data?.teaser?.shortDescription ?? "").replace(/®/g, "").trim(),
    duration: kurzeDauer(page?.data?.treatmentDetails?.duration),
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
const cover = computed(() => data.value?.cover ?? null);
const teaser = computed(() => data.value?.teaser || "");
const duration = computed(() => (data.value?.duration ? `Dauer ${data.value.duration}` : ""));

/** "dauert in der Regel 10 bis 20 Minuten …" -> "10–20 Min."; sonst nichts. */
function kurzeDauer(text?: string | null): string {
  const t = String(text ?? "");
  const spanne = t.match(/(\d+)\s*(?:bis|–|-)\s*(\d+)\s*Min/i);
  if (spanne) return `${spanne[1]}–${spanne[2]} Min.`;
  const einzeln = t.match(/(\d+)\s*Min/i);
  return einzeln ? `${einzeln[1]} Min.` : "";
}
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
.btc {
  /* Heller Knopf auf der dunklen Karte */
  --button-primary-color-bg: var(--color-white, #fff);
  --button-primary-color-bg-hover: var(--color-gray-200, #e5e5e5);
  --button-primary-color-text: var(--color-black, #111);
  display: grid;
  gap: 0;
  margin: 2.4em 0;
  overflow: hidden;
  background: var(--color-card-bg-strong, #111);
  color: var(--color-text-on-dark, #fff);
  border-radius: var(--border-radius-card, 24px);
}
.btc__bild {
  display: block;
  aspect-ratio: 16 / 9;
}
.btc__bild :deep(picture),
.btc__bild :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.btc__text {
  padding: var(--space-card-pad);
}
.btc__eyebrow {
  margin: 0 0 0.4em;
  font-size: var(--font-sm);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.7;
}
.btc__titel {
  margin: 0 0 0.4em;
  font-size: clamp(1.375rem, 1.2rem + 0.7vw, 1.75rem);
  line-height: 1.2;
}
.btc__teaser {
  margin: 0 0 1em;
  line-height: 1.5;
  opacity: 0.9;
}
.btc__fakten {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 1.2em;
  padding: 0;
  list-style: none;
}
.btc__fakten li {
  padding: 4px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  font-size: var(--font-sm);
}
.btc__knoepfe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-500);
}
.btc__mehr {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}
@media screen and (min-width: 700px) {
  .btc {
    grid-template-columns: 2fr 3fr;
  }
  .btc__bild {
    aspect-ratio: auto;
    min-height: 100%;
  }
}
</style>
