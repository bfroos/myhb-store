<template>
  <!--
    E24 SEO-Pilot: Stadtseite "Lippen aufspritzen {Stadt}" (Konzept 2.2/2.3,
    shared/seoPilotLippen.ts). Bausteine von go. (naechster Termin live,
    Clips, Feedback-Videos, Aerzt:innen, Weg-Video), Texte und Fakten nur fuer
    diesen Standort. Kein Neukundenrabatt (www), kein Vorher-Nachher.
  -->
  <div class="seo-page">
    <!-- 0. Hero -->
    <UiLayoutSectionBlock>
      <div class="seo-card seo-hero" :class="{ 'seo-hero--media': !!heroClip }">
        <div class="seo-hero__text">
          <h1 class="seo-h1">{{ content.h1 }}</h1>
          <p class="seo-hero__sub">{{ content.subline }}</p>
          <p class="seo-hero__price" data-track-placement="seo_hero_price">
            <span v-for="p in prices" :key="p.label"><strong>{{ p.value }}</strong> {{ p.label }}</span>
          </p>
          <div class="seo-hero__actions">
            <SharedButton :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" />
            <a v-if="whatsAppHref" class="seo-btn" :href="whatsAppHref" target="_blank" rel="noopener" @click="track('whatsapp_click', 'seo_hero')">
              <IconBrandWhatsapp size="20" aria-hidden="true" /> WhatsApp
            </a>
            <a v-if="phoneHref" class="seo-btn" :href="phoneHref" @click="trackPhoneClick(phoneNumber ?? undefined)">
              <IconPhone size="20" aria-hidden="true" /> Anrufen
            </a>
          </div>
          <div class="seo-hero__meta">
            <span v-if="nextSlot.label.value" data-track-placement="seo_next_slot">
              <span class="seo-dot" aria-hidden="true" />Nächster freier Termin: <strong>{{ nextSlot.label.value }}</strong>
            </span>
            <span v-if="openNow">
              <span class="seo-dot" :class="{ 'seo-dot--off': !openNow.open }" aria-hidden="true" />{{ openNow.text }}
            </span>
            <span v-if="rating" class="seo-rating">
              <span class="seo-rating__stars" aria-hidden="true">★★★★★</span>
              <strong>{{ rating.label }}</strong> aus {{ rating.count }} Google-Bewertungen ({{ content.center }})
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

    <!-- 1. Einleitung (eigener Text dieses Standorts, Link auf den Hub) -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card">
        <PagesTreatmentSeoText v-for="(p, i) in content.intro" :key="i" :parts="p" :class="{ 'seo-lead': i === 0 }" />
      </div>
    </UiLayoutSectionBlock>

    <!-- 2. Kosten -->
    <UiLayoutSectionBlock spacing="sibling">
      <div id="kosten" class="seo-card seo-card--soft" data-track-placement="seo_prices">
        <h2 class="seo-h2">Lippen aufspritzen in {{ content.city }}: Kosten</h2>
        <div class="seo-prices">
          <div v-for="p in prices" :key="p.label" class="seo-price">
            <span class="seo-price__label">{{ p.label }} Hyaluron</span>
            <span class="seo-price__value">{{ p.value }}</span>
          </div>
        </div>
        <p>{{ content.costLocal }} Wir verwenden Hyaluron von Aliaxin® (IBSA).</p>
        <p>
          <NuxtLink :to="`${SEO_PILOT_HUB_PATH}#kosten`">Was im Preis enthalten ist und wie viel ml du brauchst</NuxtLink>
        </p>
      </div>
    </UiLayoutSectionBlock>

    <!-- So sieht es bei uns aus: Clips von go. -->
    <UiLayoutSectionBlock v-if="clips.carousel.length" spacing="sibling">
      <div class="seo-card" data-track-placement="seo_clips">
        <h2 class="seo-h2">So läuft eine Lippenbehandlung bei uns ab</h2>
        <PagesTreatmentAdsV2ClipCarousel :clips="clips.carousel" placement="seo_clip" />
      </div>
    </UiLayoutSectionBlock>

    <!-- 3. Team vor Ort -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card" data-track-placement="seo_team">
        <h2 class="seo-h2">Deine Ärztinnen und Ärzte in den {{ content.center }}</h2>
        <p>
          Bei uns behandeln ausschließlich approbierte Ärztinnen und Ärzte – von der Beratung bis zur Nachkontrolle.
          {{ content.languages }}
        </p>
        <ul v-if="doctors.length" class="seo-team" role="list">
          <li v-for="d in doctors" :key="d.id" class="seo-team__card">
            <component :is="d.slug ? NuxtLinkComp : 'div'" :to="d.slug ? `/aerzte/${d.slug}` : undefined">
              <img v-if="d.photoUrl" :src="d.photoUrl" :alt="`${d.name}, ${content.center}`" loading="lazy" decoding="async" width="300" height="400" />
              <span class="seo-team__name">{{ d.name }}</span>
            </component>
          </li>
        </ul>
        <p class="seo-muted">Medizinisch verantwortlich: Dr. Gero Ruppert, Chefarzt.</p>
      </div>
    </UiLayoutSectionBlock>

    <!-- 4. Anfahrt -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card seo-card--soft" data-track-placement="seo_directions">
        <h2 class="seo-h2">So findest du uns in den {{ content.center }}</h2>
        <div class="seo-split">
          <div>
            <h3 class="seo-h3">{{ content.whereHeadline }}</h3>
            <ol class="seo-list">
              <li v-for="s in content.whereSteps" :key="s">{{ s }}</li>
            </ol>
            <p>
              <strong>Adresse:</strong> {{ content.center }}, {{ addressLine }}<br />
              <strong>Öffnungszeiten:</strong> {{ hours }}
            </p>
            <h3 class="seo-h3">Mit Bus und Bahn</h3>
            <ul class="seo-list">
              <li v-for="s in content.transit" :key="s">{{ s }}</li>
            </ul>
            <h3 class="seo-h3">Mit dem Auto und parken</h3>
            <ul class="seo-list">
              <li v-for="s in [...content.car, ...content.parking]" :key="s">{{ s }}</li>
            </ul>
            <p>{{ content.accessibility }}</p>
            <p class="seo-muted">{{ content.factsSource }}</p>
            <div class="seo-hero__actions">
              <a v-if="routeHref" class="seo-btn" :href="routeHref" target="_blank" rel="noopener" @click="track('route_click', 'seo_directions')">
                <IconRoute size="20" aria-hidden="true" /> Route planen
              </a>
              <a v-if="phoneHref" class="seo-btn" :href="phoneHref" @click="trackPhoneClick(phoneNumber ?? undefined)">
                <IconPhone size="20" aria-hidden="true" /> {{ phoneNumber }}
              </a>
            </div>
          </div>
          <div v-if="wayClip" class="seo-way">
            <video
              :src="wayClip.url"
              :poster="wayClip.posterUrl"
              muted
              playsinline
              controls
              preload="none"
              :aria-label="wayClip.caption"
            />
            <p class="seo-muted">{{ wayClip.caption }}</p>
          </div>
        </div>
        <h3 class="seo-h3">Aus diesen Stadtteilen und Orten kommen Kundinnen zu uns</h3>
        <p>{{ content.serviceAreaText }}</p>
        <ul class="seo-places" role="list">
          <li v-for="p in content.serviceArea" :key="p">{{ p }}</li>
        </ul>
      </div>
    </UiLayoutSectionBlock>

    <!-- 5. Bewertungen dieses Google-Profils -->
    <UiLayoutSectionBlock v-if="reviews.length || clips.feedback.length" spacing="sibling">
      <div class="seo-card" data-track-placement="seo_reviews">
        <h2 class="seo-h2">Bewertungen aus den {{ content.center }}</h2>
        <p v-if="rating">
          <span class="seo-rating__stars" aria-hidden="true">★★★★★</span>
          <strong>{{ rating.label }}</strong> von 5 aus {{ rating.count }} Google-Bewertungen für MY HEALTH &amp; BEAUTY {{ content.center }}.
          <UiMoleculeReviewAuthenticityNote with-label />
        </p>
        <PagesTreatmentAdsV2ClipCarousel v-if="clips.feedback.length" :clips="clips.feedback" tap-to-play placement="seo_feedback" />
        <div v-if="reviews.length" class="seo-reviews">
          <figure v-for="r in reviews" :key="r.id ?? r.text" class="seo-review">
            <span class="seo-rating__stars" aria-label="5 von 5 Sternen">★★★★★</span>
            <blockquote>„{{ r.text }}“</blockquote>
            <figcaption>{{ r.author }} · Google</figcaption>
          </figure>
        </div>
        <p v-if="googleProfileHref">
          <a :href="googleProfileHref" target="_blank" rel="noopener">Alle Bewertungen der {{ content.center }} bei Google</a>
        </p>
      </div>
    </UiLayoutSectionBlock>

    <!-- 6. Ablauf -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card seo-card--soft" data-track-placement="seo_process">
        <h2 class="seo-h2">Ablauf deiner Lippenbehandlung in {{ content.city }}</h2>
        <PagesTreatmentSeoFacts :facts="facts" />
        <PagesTreatmentSeoTimeline :steps="timeline" />
        <p>{{ content.processLocal }}</p>
      </div>
    </UiLayoutSectionBlock>

    <!-- 7. Profilthema dieses Standorts -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card">
        <h2 class="seo-h2">{{ content.profileHeadline }}</h2>
        <PagesTreatmentSeoText v-for="(p, i) in content.profile" :key="i" :parts="p" />
      </div>
    </UiLayoutSectionBlock>

    <!-- Lounge -->
    <UiLayoutSectionBlock v-if="lounge.images.length" spacing="sibling">
      <div class="seo-card seo-card--soft">
        <h2 class="seo-h2">{{ lounge.own ? `Unsere Lounge in den ${content.center}` : "Einblicke in unsere MY Lounges" }}</h2>
        <div class="seo-gallery">
          <img
            v-for="img in lounge.images.slice(0, 4)"
            :key="img.id"
            :src="imageUrl(img.url, 600)"
            :alt="lounge.own ? `MY Lounge ${content.center}` : 'MY Lounge'"
            loading="lazy"
            decoding="async"
            width="600"
            height="450"
          />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- 8. Fragen -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card" data-track-placement="seo_faq">
        <h2 class="seo-h2">Häufige Fragen: Lippen aufspritzen in {{ content.city }}</h2>
        <PagesTreatmentSeoFaq :faqs="content.faqs" />
        <h3 class="seo-h3">Nach der Behandlung</h3>
        <ul class="seo-list">
          <li v-for="a in aftercare" :key="a">{{ a }}</li>
        </ul>
      </div>
    </UiLayoutSectionBlock>

    <!-- 9. Querlinks -->
    <UiLayoutSectionBlock spacing="sibling">
      <div class="seo-card seo-card--soft">
        <p>
          <strong>Lippen aufspritzen auch in:</strong>
          <template v-for="(o, i) in otherCities" :key="o.href">
            <NuxtLink :to="o.href">{{ o.name }}</NuxtLink><span v-if="i < otherCities.length - 1"> · </span>
          </template>
        </p>
        <p>
          <NuxtLink :to="SEO_PILOT_HUB_PATH">Alles über Lippen aufspritzen mit Hyaluron</NuxtLink>
          · <NuxtLink :to="`/standorte/${content.citySlug}/${content.locationSlug}`">MY HEALTH &amp; BEAUTY {{ content.center }}</NuxtLink>
        </p>
        <div class="seo-hero__actions">
          <SharedButton :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" />
        </div>
      </div>
    </UiLayoutSectionBlock>
  </div>
</template>

<script setup lang="ts">
import { IconBrandWhatsapp, IconPhone, IconRoute } from "@tabler/icons-vue";
import { resolveComponent } from "vue";
import type { BlockTreatmentHeroDto } from "~/lib/strapi/dto/components";
import type { LocationDto, TreatmentPageDto } from "~/lib/strapi/dto/collections";
import { SharedButtonAction, SharedButtonMethod } from "~/lib/strapi/dto/enums";
import {
  SEO_PILOT_HUB_PATH,
  SEO_PILOT_PATH_KEY,
  hasSeoCityPage,
  paragraphText,
  seoCityLippenPath,
  type SeoCityContent,
} from "#shared/seoPilotLippen";
import { adsV2Aftercare, adsV2Facts, adsV2Timeline } from "#shared/adsTemplateV2Content";
import { employeeDisplayName, openingHoursSummary, pickAdsV2Reviews, shortenText } from "#shared/adsTemplateV2";
import { adsClipsFor, adsLoungeGalleryFor, adsWayClipFor } from "#shared/adsClips";
import { getGoogleReviewForPlace, locationEntityId } from "~/utils/schemaLocation";
import { medicalProcedureId } from "~/utils/schemaTreatment";
import { lipPrices, openStatus } from "~/utils/seoPilot";

const props = defineProps<{
  hero: BlockTreatmentHeroDto;
  treatmentPage?: TreatmentPageDto | null;
  location?: LocationDto | null;
  content: SeoCityContent;
}>();

const NuxtLinkComp = resolveComponent("NuxtLink");
const { trackPhoneClick, trackEvent } = useGoogleAnalytics();
const config = useRuntimeConfig();
const route = useRoute();

const loc = computed(() => props.content.locationSlug);
const { data: extras } = await useFetch<{ reviews?: any[]; doctors?: any[] }>(
  `/api/seo-pilot/${props.content.citySlug}/${props.content.locationSlug}`,
  { key: `seo-pilot:${props.content.key}`, default: () => ({}) },
);

const treatment = computed<any>(() => (props.treatmentPage as any)?.treatment ?? props.hero.treatment ?? null);
const prices = computed(() => lipPrices(treatment.value));

const bookingButton = {
  label: "Termin wählen",
  method: SharedButtonMethod.ACTION,
  action: SharedButtonAction.APPOINTMENT_BOOKING,
};
const bookingData = computed(() => ({
  calendlyUrl: props.hero.calendlyUrl,
  appBookingUrl: props.hero.appBookingUrl ?? (props.location as any)?.appBookingUrl,
  locationSlug: props.hero.locationSlug ?? props.content.locationSlug,
  appTreatmentSlug: props.hero.appTreatmentSlug,
  treatmentType: treatment.value?.type,
}));

const nextSlot = useNextSlot(
  () => bookingData.value.appBookingUrl,
  () => props.hero.appTreatmentSlug || SEO_PILOT_PATH_KEY.split("/").pop() || "",
);

const week = computed(() => (props.location as any)?.openingHours?.week ?? null);
const hours = computed(() => openingHoursSummary(week.value));
// "Jetzt geoeffnet bis ..." erst im Browser (ISR-Seite, Uhrzeit wechselt).
const now = ref<Date | null>(null);
onMounted(() => {
  now.value = new Date();
});
const openNow = computed(() => (now.value ? openStatus(week.value, now.value) : null));

const rating = computed(() => {
  const r = getGoogleReviewForPlace((props.location as any)?.googlePlaceId);
  if (!r) return null;
  return {
    label: r.rating.toLocaleString("de-DE", { minimumFractionDigits: 1 }),
    count: r.userRatingsTotal.toLocaleString("de-DE"),
    placeUrl: r.placeUrl,
  };
});
const googleProfileHref = computed(() => rating.value?.placeUrl ?? null);

const reviews = computed(() =>
  pickAdsV2Reviews(extras.value?.reviews ?? [], props.content.city, SEO_PILOT_PATH_KEY, 4).map((r: any) => ({
    ...r,
    text: shortenText(r.text, 260),
  })),
);

const doctors = computed(() =>
  (extras.value?.doctors ?? [])
    .map((d: any) => ({
      id: d.id,
      slug: d.slug ?? null,
      name: employeeDisplayName(d),
      photoUrl: d.photo?.formats?.small?.url ?? d.photo?.url ?? null,
    }))
    .filter((d: any) => d.name),
);

const clips = computed(() => adsClipsFor(SEO_PILOT_PATH_KEY, props.content.citySlug));
const heroClip = computed(() => clips.value.hero ?? null);
const wayClip = computed(() => adsWayClipFor(loc.value));
const lounge = computed(() => adsLoungeGalleryFor(loc.value));
function imageUrl(url: string, width: number) {
  return /media\.myhealthandbeauty\.app/.test(url)
    ? `https://media.myhealthandbeauty.app/cdn-cgi/image/width=${width},format=auto/${url.replace(/^https:\/\/media\.myhealthandbeauty\.app\//, "")}`
    : url;
}

const facts = computed(() => adsV2Facts(SEO_PILOT_PATH_KEY, (props.treatmentPage as any)?.treatmentDetails?.duration));
const timeline = computed(() => adsV2Timeline(SEO_PILOT_PATH_KEY));
const aftercare = computed(() => adsV2Aftercare(SEO_PILOT_PATH_KEY));

const addressLine = computed(() => {
  const a: any = props.location?.address;
  if (!a) return "";
  return [[a.street, a.houseNumber].filter(Boolean).join(" "), [a.postalCode, a.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
});
const phoneNumber = computed<string | null>(() => (props.location as any)?.contact?.phoneNumber ?? null);
const phoneHref = computed(() => {
  const digits = String(phoneNumber.value ?? "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
});
const whatsAppHref = computed(() => {
  const digits = String((props.location as any)?.contact?.whatsAppNumber ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const text = `Hallo, ich habe eine Frage zum Lippen aufspritzen (${props.content.center}).`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
});
const routeHref = computed(() => {
  const c: any = (props.location as any)?.coordinates;
  if (c?.lat && c?.long) return `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.long}`;
  return addressLine.value ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressLine.value)}` : null;
});
function track(name: string, placement: string) {
  trackEvent(name, { placement, location: loc.value, template: "seo-pilot" });
}

// Querlinks: andere Standorte mit Lippen (Anker mit Begriff nur fuer
// ausgebaute Stadtseiten, Konzept 3.3).
const { locations: bookable, fetchLocations } = useLocationFinder();
await fetchLocations({ treatmentType: treatment.value?.type, pathKey: SEO_PILOT_PATH_KEY });
const otherCities = computed(() =>
  (bookable.value ?? [])
    .filter((l: any) => l.slug !== loc.value && l.city?.slug && l.city?.name)
    .map((l: any) => ({
      name: l.city.name,
      href: seoCityLippenPath(l.city.slug, l.slug),
      own: hasSeoCityPage(l.city.slug, l.slug),
    }))
    .sort((a, b) => Number(b.own) - Number(a.own) || a.name.localeCompare(b.name, "de")),
);

// ---------------------------------------------------------------- Schema
const pageUrl = computed(() => `${config.public.publicUrl}${route.path}`);
const clinicId = computed(() => locationEntityId(String(config.public.publicUrl || ""), props.location as any));
useSchemaOrg(
  computed(() => ({
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "@id": medicalProcedureId(String(config.public.publicUrl || ""), route.path),
    name: `Lippen aufspritzen in ${props.content.city}`,
    alternateName: ["Lippenunterspritzung", "Lip Filler", "Lippen unterspritzen"],
    procedureType: "https://schema.org/NoninvasiveProcedure",
    bodyLocation: "Lippen",
    description: paragraphText(props.content.intro[0] ?? []),
    howPerformed:
      "Nach ärztlicher Beratung und Betäubung mit Creme wird Hyaluronsäure (0,5 oder 1 ml) mit feiner Nadel in Kontur und Lippenkörper gesetzt. Dauer 30–45 Minuten.",
    followup: "Kostenlose Nachkontrolle nach 14 Tagen.",
    url: pageUrl.value,
    isPartOf: { "@id": `${config.public.publicUrl}${SEO_PILOT_HUB_PATH}#procedure` },
    ...(clinicId.value ? { availableAtOrFrom: { "@id": clinicId.value } } : {}),
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
