<template>
  <!--
    E24 SEO-Pilot: Hub "Lippen aufspritzen" (Konzept 2.1,
    shared/seoPilotLippen.ts). Traegt den ganzen Themen- und Kostencluster
    ohne Ort; verlinkt jede Stadtseite mit "Lippen aufspritzen in {Stadt}".
    Kein Neukundenrabatt (www), kein Vorher-Nachher.
  -->
  <div class="seo-page">
    <!-- 0. Hero -->
    <UiLayoutSectionBlock>
      <div class="seo-card seo-hero" :class="{ 'seo-hero--media': !!heroClip }">
        <div class="seo-hero__text">
          <h1 class="seo-h1">{{ content.h1 }}</h1>
          <p class="seo-hero__sub">{{ content.subline }}</p>
          <p class="seo-hero__price">
            <span v-for="p in prices" :key="p.label"><strong>{{ p.value }}</strong> {{ p.label }}</span>
          </p>
          <div class="seo-hero__actions">
            <SharedButton :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" />
            <a class="seo-btn" href="#standorte">Standort und freien Termin finden</a>
          </div>
          <div v-if="aggregate" class="seo-hero__meta">
            <span class="seo-rating">
              <span class="seo-rating__stars" aria-hidden="true">★★★★★</span>
              <strong>{{ aggregate.label }}</strong> aus {{ aggregate.count }} Google-Bewertungen unserer {{ aggregate.locations }} Standorte
              <UiMoleculeReviewAuthenticityNote />
            </span>
          </div>
        </div>
        <div v-if="heroClip" class="seo-hero__media">
          <video
            :src="heroClip.url"
            :poster="heroClip.posterUrl"
            muted
            playsinline
            autoplay
            loop
            preload="metadata"
            :aria-label="heroClip.caption || 'Lippenbehandlung bei MY HEALTH & BEAUTY'"
          />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- 1. Auf einen Blick: Kurzantwort + Steckbrief -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card" data-track-placement="seo_facts">
        <h2 class="seo-h2">Lippen aufspritzen auf einen Blick</h2>
        <p class="seo-answer" data-speakable>{{ content.answer }}</p>
        <PagesTreatmentSeoFacts :facts="facts" />
        <UiMoleculeMedicalReviewerSignature :reviewer="DEFAULT_MEDICAL_REVIEWER" :date="updatedAt" inline />
      </div>
    </UiLayoutSectionBlock>

    <!-- 2. Kosten -->
    <UiLayoutSectionBlock spacing="sibling">
      <div id="kosten" class="seo-card seo-card--soft" data-track-placement="seo_prices">
        <h2 class="seo-h2">Lippen aufspritzen Kosten</h2>
        <p>{{ content.costIntro }}</p>
        <div class="seo-table-wrap">
          <table class="seo-table">
            <thead>
              <tr><th scope="col">Behandlung</th><th scope="col">Preis</th></tr>
            </thead>
            <tbody>
              <tr v-for="p in prices" :key="p.label">
                <td>Lippen aufspritzen, {{ p.label }} Hyaluron</td>
                <td class="seo-num">{{ p.value }}</td>
              </tr>
              <tr v-for="r in compareRows.filter((x) => x.pathKey !== SEO_PILOT_PATH_KEY && x.price)" :key="r.pathKey">
                <td><NuxtLink :to="r.href">{{ r.name }}</NuxtLink></td>
                <td class="seo-num">{{ r.price }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 class="seo-h3">Im Preis enthalten</h3>
        <ul class="seo-list">
          <li v-for="x in content.costInclusive" :key="x">{{ x }}</li>
        </ul>
        <PagesTreatmentSeoText :parts="content.costMarket" />
        <p class="seo-muted">Preise an allen Standorten gleich, Stand {{ priceDate }}.</p>
      </div>
    </UiLayoutSectionBlock>

    <!-- 3. Standorte mit naechstem freien Termin -->
    <UiLayoutSectionBlock spacing="sibling">
      <div id="standorte" class="seo-card" data-track-placement="seo_locations">
        <h2 class="seo-h2">Lippen aufspritzen in deiner Nähe</h2>
        <p>An {{ locationRows.length }} Standorten in Deutschland, alle in Einkaufszentren und auch ohne Termin. Der nächste freie Termin kommt live aus unserem Buchungssystem.</p>
        <div class="seo-table-wrap">
          <table class="seo-table">
            <thead>
              <tr>
                <th scope="col">Stadt</th>
                <th scope="col">Lounge</th>
                <th scope="col">Nächster freier Termin</th>
                <th scope="col">Google</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in locationRows" :key="l.slug">
                <td>
                  <NuxtLink :to="l.href">{{ l.own ? `Lippen aufspritzen in ${l.city}` : l.city }}</NuxtLink>
                </td>
                <td>{{ l.name }}</td>
                <td>{{ slotLabels[l.appLocation] ?? (slotsLoaded ? "auf Anfrage" : "…") }}</td>
                <td class="seo-num">{{ l.rating ?? "–" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="seo-muted">Google-Noten der Standortprofile. <UiMoleculeReviewAuthenticityNote with-label /></p>
      </div>
    </UiLayoutSectionBlock>

    <!-- Clips von go. -->
    <UiLayoutSectionBlock v-if="clips.carousel.length" spacing="sibling">
      <div class="seo-card seo-card--soft" data-track-placement="seo_clips">
        <h2 class="seo-h2">So läuft eine Lippenbehandlung bei uns ab</h2>
        <PagesTreatmentAdsV2ClipCarousel :clips="clips.carousel" placement="seo_clip" />
      </div>
    </UiLayoutSectionBlock>

    <!-- 4. Wirkweise -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card">
        <div class="seo-split">
          <div>
            <h2 class="seo-h2">{{ content.howHeadline }}</h2>
            <PagesTreatmentSeoText v-for="(p, i) in content.how" :key="i" :parts="p" />
          </div>
          <img v-if="zoneImage" class="seo-zone" :src="zoneImage.src" :alt="zoneImage.alt" width="320" height="320" loading="lazy" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- 5. Menge -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card seo-card--soft">
        <h2 class="seo-h2">{{ content.mlHeadline }}</h2>
        <PagesTreatmentSeoText v-for="(p, i) in content.ml" :key="i" :parts="p" />
      </div>
    </UiLayoutSectionBlock>

    <!-- 6. Ablauf -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card" data-track-placement="seo_process">
        <h2 class="seo-h2">Ablauf: von der Beratung bis zur Nachkontrolle</h2>
        <PagesTreatmentSeoTimeline :steps="timeline" />
      </div>
    </UiLayoutSectionBlock>

    <!-- 7. Vergleich -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card seo-card--soft">
        <h2 class="seo-h2">{{ content.compareHeadline }}</h2>
        <p>{{ content.compareIntro }}</p>
        <div class="seo-table-wrap">
          <table class="seo-table">
            <thead>
              <tr><th scope="col">Behandlung</th><th scope="col">Wofür</th><th scope="col">Preis</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in compareRows" :key="r.pathKey">
                <td><NuxtLink :to="r.href">{{ r.name }}</NuxtLink></td>
                <td>{{ r.what }}</td>
                <td class="seo-num">{{ r.price ?? r.fallbackPrice ?? "–" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- 8. Eignung und Risiken -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card">
        <h2 class="seo-h2">{{ content.riskHeadline }}</h2>
        <p>Nicht geeignet ist die Behandlung zum Beispiel:</p>
        <ul class="seo-list">
          <li v-for="x in content.riskNotFor" :key="x">{{ x }}</li>
        </ul>
        <PagesTreatmentSeoText v-for="(p, i) in content.riskSide" :key="i" :parts="p" />
      </div>
    </UiLayoutSectionBlock>

    <!-- 9. Natuerlich -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card seo-card--soft">
        <h2 class="seo-h2">{{ content.naturalHeadline }}</h2>
        <PagesTreatmentSeoText v-for="(p, i) in content.natural" :key="i" :parts="p" />
      </div>
    </UiLayoutSectionBlock>

    <!-- 10. Wer behandelt -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card">
        <h2 class="seo-h2">{{ content.whoHeadline }}</h2>
        <PagesTreatmentSeoText v-for="(p, i) in content.who" :key="i" :parts="p" />
      </div>
    </UiLayoutSectionBlock>

    <!-- 11. Erfahrungen -->
    <UiLayoutSectionBlock v-if="reviews.length || clips.feedback.length" spacing="sibling">
      <div class="seo-card seo-card--soft" data-track-placement="seo_reviews">
        <h2 class="seo-h2">Erfahrungen unserer Kundinnen</h2>
        <p>Echte Google-Bewertungen aus unseren Standorten. <UiMoleculeReviewAuthenticityNote with-label /></p>
        <PagesTreatmentAdsV2ClipCarousel v-if="clips.feedback.length" :clips="clips.feedback" tap-to-play placement="seo_feedback" />
        <div v-if="reviews.length" class="seo-reviews">
          <figure v-for="r in reviews" :key="r.id ?? r.text" class="seo-review">
            <span class="seo-rating__stars" aria-label="5 von 5 Sternen">★★★★★</span>
            <blockquote>„{{ r.text }}“</blockquote>
            <figcaption>{{ r.author }} · Google</figcaption>
          </figure>
        </div>
        <p>
          Mehr Erfahrungen:
          <NuxtLink to="/blog/lippen-aufspritzen-erfahrungen">Lippen aufspritzen – Erfahrungen</NuxtLink> ·
          <NuxtLink to="/blog/lippen-aufspritzen-hyaluron-guide">Ratgeber Lippen aufspritzen mit Hyaluron</NuxtLink>
        </p>
      </div>
    </UiLayoutSectionBlock>

    <!-- 12. Nachsorge + 13. Fragen -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card" data-track-placement="seo_faq">
        <h2 class="seo-h2">Häufige Fragen zum Lippen aufspritzen</h2>
        <PagesTreatmentSeoFaq :faqs="content.faqs" />
        <h3 class="seo-h3">Nach der Behandlung</h3>
        <ul class="seo-list">
          <li v-for="a in aftercare" :key="a">{{ a }}</li>
        </ul>
        <div class="seo-hero__actions">
          <SharedButton :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" />
        </div>
      </div>
    </UiLayoutSectionBlock>
  </div>
</template>

<script setup lang="ts">
import type { BlockTreatmentHeroDto } from "~/lib/strapi/dto/components";
import type { TreatmentPageDto } from "~/lib/strapi/dto/collections";
import { SharedButtonAction, SharedButtonMethod } from "~/lib/strapi/dto/enums";
import {
  SEO_LIPPEN_COMPARE,
  SEO_PILOT_HUB_PATH,
  SEO_PILOT_PATH_KEY,
  hasSeoCityPage,
  paragraphText,
  seoCityLippenPath,
  type SeoHubContent,
} from "#shared/seoPilotLippen";
import { adsV2Aftercare, adsV2Facts, adsV2Timeline, adsV2ZoneImage } from "#shared/adsTemplateV2Content";
import { pickAdsV2Reviews, shortenText } from "#shared/adsTemplateV2";
import { adsClipsFor } from "#shared/adsClips";
import { getGoogleReviewAggregate, getGoogleReviewForPlace } from "~/utils/schemaLocation";
import { lipPrices, startingPrice } from "~/utils/seoPilot";

const props = defineProps<{
  hero: BlockTreatmentHeroDto;
  treatmentPage?: TreatmentPageDto | null;
  content: SeoHubContent;
}>();

const config = useRuntimeConfig();
const route = useRoute();

const treatment = computed<any>(() => (props.treatmentPage as any)?.treatment ?? props.hero.treatment ?? null);
const prices = computed(() => lipPrices(treatment.value));
const updatedAt = computed<string | null>(() => (props.treatmentPage as any)?.updatedAt ?? null);
const priceDate = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date());

const bookingButton = {
  label: "Termin wählen",
  method: SharedButtonMethod.ACTION,
  action: SharedButtonAction.APPOINTMENT_BOOKING,
};
const bookingData = computed(() => ({
  calendlyUrl: props.hero.calendlyUrl,
  appBookingUrl: props.hero.appBookingUrl,
  locationSlug: props.hero.locationSlug,
  appTreatmentSlug: props.hero.appTreatmentSlug,
  treatmentType: treatment.value?.type,
}));

// Preise der Geschwister-Behandlungen aus Strapi (nicht im Code, damit eine
// Preisaenderung in Strapi hier mitkommt).
const { data: siblings } = await useAsyncData("seo-pilot:lippen-siblings", async () => {
  const keys = SEO_LIPPEN_COMPARE.map((r) => r.pathKey).filter((k) => k !== SEO_PILOT_PATH_KEY);
  const res = await Promise.all(
    keys.map((k) =>
      strapiFetch<any>(`/treatment-pages/by-path/${k}`, { query: { locale: "de" } })
        .then((r) => [k, startingPrice(r?.data?.treatment)] as const)
        .catch(() => [k, null] as const),
    ),
  );
  return Object.fromEntries(res) as Record<string, string | null>;
});
const compareRows = computed(() =>
  SEO_LIPPEN_COMPARE.map((r) => ({
    ...r,
    price:
      r.pathKey === SEO_PILOT_PATH_KEY
        ? prices.value[0]
          ? `ab ${prices.value[0].value}`
          : null
        : (siblings.value?.[r.pathKey] ?? null),
  })),
);

// Standorte mit Lippen (dieselbe Quelle wie die Standortkacheln)
const { locations: bookable, fetchLocations } = useLocationFinder();
await fetchLocations({ treatmentType: treatment.value?.type, pathKey: SEO_PILOT_PATH_KEY });
const locationRows = computed(() =>
  (bookable.value ?? [])
    .filter((l: any) => l.city?.slug && l.slug)
    .map((l: any) => {
      const r = getGoogleReviewForPlace(l.googlePlaceId);
      return {
        slug: l.slug,
        city: l.city.name,
        name: l.name,
        href: seoCityLippenPath(l.city.slug, l.slug),
        own: hasSeoCityPage(l.city.slug, l.slug),
        appLocation: appLocationFromBookingUrl(l.appBookingUrl),
        rating: r ? `${r.rating.toLocaleString("de-DE", { minimumFractionDigits: 1 })} (${r.userRatingsTotal.toLocaleString("de-DE")})` : null,
      };
    })
    .sort((a, b) => a.city.localeCompare(b.city, "de")),
);

// Naechster freier Termin je Standort, im Browser (ISR) und jede Minute neu.
const slotLabels = ref<Record<string, string>>({});
const slotsLoaded = ref(false);
async function loadSlots() {
  const treatmentSlug = props.hero.appTreatmentSlug || SEO_PILOT_PATH_KEY.split("/").pop()!;
  const entries = await Promise.all(
    locationRows.value
      .filter((l) => l.appLocation)
      .map(async (l) => {
        try {
          const s = await $fetch<{ date?: string; time?: string }>("/api/naechster-termin", {
            query: { location: l.appLocation, treatment: treatmentSlug },
          });
          return [l.appLocation, formatNextSlot(s)] as const;
        } catch {
          return [l.appLocation, null] as const;
        }
      }),
  );
  slotLabels.value = Object.fromEntries(entries.filter((e): e is readonly [string, string] => !!e[1]));
  slotsLoaded.value = true;
}
let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  loadSlots();
  timer = setInterval(loadSlots, 60_000);
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

const agg = getGoogleReviewAggregate();
const aggregate = agg
  ? {
      label: agg.rating.toLocaleString("de-DE", { minimumFractionDigits: 1 }),
      count: agg.userRatingsTotal.toLocaleString("de-DE"),
      locations: agg.locations,
    }
  : null;

// Bewertungen aller Standorte, Lippen zuerst (gleiche Auswahl wie go.)
const { data: extras } = await useFetch<{ reviews?: any[] }>("/api/ads-template-v2/bundesweit", {
  key: "seo-pilot:bundesweit",
  default: () => ({}),
});
const reviews = computed(() =>
  pickAdsV2Reviews(extras.value?.reviews ?? [], null, SEO_PILOT_PATH_KEY, 6).map((r: any) => ({
    ...r,
    text: shortenText(r.text, 260),
  })),
);

const clips = computed(() => adsClipsFor(SEO_PILOT_PATH_KEY, null));
const heroClip = computed(() => clips.value.hero ?? null);
const facts = computed(() => adsV2Facts(SEO_PILOT_PATH_KEY, null));
const timeline = computed(() => adsV2Timeline(SEO_PILOT_PATH_KEY));
const aftercare = computed(() => adsV2Aftercare(SEO_PILOT_PATH_KEY));
const zoneImage = adsV2ZoneImage("lippen");

// ---------------------------------------------------------------- Schema
const pageUrl = computed(() => `${config.public.publicUrl}${route.path}`);
useSchemaOrg(
  computed(() => ({
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "@id": `${config.public.publicUrl}${SEO_PILOT_HUB_PATH}#procedure`,
    name: "Lippen aufspritzen mit Hyaluron",
    alternateName: ["Lippenunterspritzung", "Lip Filler", "Lippen unterspritzen", "Lippen mit Hyaluron"],
    procedureType: "https://schema.org/NoninvasiveProcedure",
    bodyLocation: "Lippen",
    description: props.content.answer,
    howPerformed:
      "Nach ärztlicher Beratung und Betäubung mit Creme wird Hyaluronsäure (0,5 oder 1 ml) mit feiner Nadel in Kontur und Lippenkörper gesetzt. Dauer 30–45 Minuten.",
    followup: "Kostenlose Nachkontrolle nach 14 Tagen.",
    url: pageUrl.value,
    availableAtOrFrom: locationRows.value.map((l) => ({
      "@id": `${config.public.publicUrl}${l.href.replace(`/${SEO_PILOT_PATH_KEY}`, "")}#clinic`,
    })),
    ...(prices.value.length
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "EUR",
            lowPrice: Math.min(...prices.value.map((p) => p.cent)) / 100,
            highPrice: Math.max(...prices.value.map((p) => p.cent)) / 100,
            offerCount: prices.value.length,
            url: `${pageUrl.value}#kosten`,
          },
        }
      : {}),
  })),
);
useSchemaOrg(
  computed(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: props.content.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: paragraphText(f.answer) },
    })),
  })),
);
</script>

<style src="./seo.css"></style>
