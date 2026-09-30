<template>
  <!--
    go.* Seitenvorlage v2 (bfroos/myhb-store#203, Playbook Kapitel 3):
    Hero -> Vertrauenszeile -> Clips -> Ablauf -> Preise -> Aerzt:innen ->
    Bewertungen -> Einwaende -> Standort -> Schlussaufruf, dazu die
    mitlaufende Leiste des Heros. Keine Querlinks, kein SEO-Langtext.
    Umschaltung: shared/adsTemplateV2.ts (ADS_TEMPLATE_V2_PAGES).
  -->
  <div class="v2">
    <BlockTreatmentHero
      v-bind="hero"
      :cta="heroCta"
      show-floating-cta
      template-v2
      :hero-clip="clips.hero ?? null"
      :sticky-cta-label="ADS_V2_CTA.sticky"
    />

    <!-- Vertrauenszeile -->
    <UiLayoutSectionBlock spacing="sibling">
      <ul class="v2-trust" role="list" data-track-placement="v2_trust">
        <li v-for="item in trustItems" :key="item.key" class="v2-trust__item">
          <component :is="trustIcon(item.key)" class="v2-trust__icon" size="22" aria-hidden="true" />
          <span>
            <strong>{{ item.title }}</strong>
            <span v-if="item.text" class="v2-trust__text">{{ item.text }}</span>
          </span>
        </li>
        <li v-if="rating" class="v2-trust__item">
          <IconStarFilled class="v2-trust__icon v2-trust__icon--star" size="22" aria-hidden="true" />
          <span>
            <strong>Google {{ ratingLabel }}</strong>
            <span class="v2-trust__text">{{ ratingCountLabel }} in {{ locationName }}</span>
          </span>
        </li>
      </ul>
    </UiLayoutSectionBlock>

    <!-- Clips -->
    <UiLayoutSectionBlock v-if="clips.carousel.length">
      <div class="v2-card" data-track-placement="v2_clips">
        <h2 class="v2-h2">So sieht die Behandlung aus</h2>
        <PagesTreatmentAdsV2ClipCarousel :clips="clips.carousel" />
      </div>
    </UiLayoutSectionBlock>

    <!-- Ablauf -->
    <UiLayoutSectionBlock>
      <div class="v2-card v2-card--soft" data-track-placement="v2_steps">
        <h2 class="v2-h2">So läuft dein Termin ab</h2>
        <ol class="v2-steps">
          <li v-for="(step, i) in steps" :key="step.title" class="v2-steps__item">
            <span class="v2-steps__num" aria-hidden="true">{{ i + 1 }}</span>
            <span>
              <strong class="v2-steps__title">{{ step.title }}</strong>
              <span class="v2-steps__text">{{ step.text }}</span>
            </span>
          </li>
        </ol>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Preise -->
    <UiLayoutSectionBlock v-if="priceCards.length">
      <div class="v2-card" data-track-placement="v2_prices">
        <h2 class="v2-h2">Preise in {{ locationName }}</h2>
        <p v-if="offer" class="v2-lead">
          Neukundenpreis mit {{ discountPct }} % Rabatt – so sicherst du ihn dir: „{{ discountLabel }}“ antippen.
        </p>
        <ul class="v2-prices" role="list" :style="{ '--cols': String(Math.min(priceCards.length, 3)) }">
          <li v-for="card in priceCards" :key="card.key" class="v2-price" :class="{ 'v2-price--package': card.isPackage }">
            <span class="v2-price__label">{{ card.label }}</span>
            <strong v-if="card.offer" class="v2-price__offer">{{ card.offer }}</strong>
            <span class="v2-price__regular">{{ keepAmount(card.regular) }}</span>
            <span v-if="card.note" class="v2-price__note">{{ keepAmount(card.note) }}</span>
          </li>
        </ul>
        <ul class="v2-notes" role="list">
          <li>Inklusive Beratung und Nachkontrolle.</li>
          <li v-if="productNote">{{ productNote }}</li>
          <li>{{ ADS_V2_PAYMENT_NOTE }}</li>
        </ul>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
          <SharedButton v-if="discountButton" :button="discountButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'secondary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Aerzt:innen des Centers -->
    <UiLayoutSectionBlock v-if="doctors.length">
      <div class="v2-card v2-card--soft" data-track-placement="v2_doctors">
        <h2 class="v2-h2">Dein Ärzteteam in {{ locationName }}</h2>
        <ul class="v2-doctors" role="list">
          <li v-for="doc in doctors" :key="doc.id ?? doc.name" class="v2-doctor">
            <div class="v2-doctor__photo">
              <UiAtomMediaPicture :media="doc.photo" />
            </div>
            <strong class="v2-doctor__name">{{ doc.name }}</strong>
          </li>
        </ul>
        <p class="v2-lead">Bei uns behandeln nur Ärztinnen und Ärzte – von der Beratung bis zur Nachkontrolle.</p>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Bewertungen des Standorts -->
    <UiLayoutSectionBlock v-if="reviews.length">
      <div class="v2-card" data-track-placement="v2_reviews">
        <h2 class="v2-h2">Das sagen Kundinnen und Kunden</h2>
        <p v-if="rating" class="v2-lead">
          <IconStarFilled class="v2-star" size="18" aria-hidden="true" />
          <strong>{{ ratingLabel }}</strong> · {{ ratingCountLabel }} bei Google für {{ locationName }}
        </p>
        <ul class="v2-reviews" role="list">
          <li v-for="review in reviews" :key="review.id ?? review.author" class="v2-review">
            <span class="v2-review__stars" role="img" aria-label="5 von 5 Sternen">
              <IconStarFilled v-for="n in 5" :key="n" size="16" aria-hidden="true" />
            </span>
            <p class="v2-review__text">„{{ review.text }}“</p>
            <span class="v2-review__author">{{ review.author }}</span>
          </li>
        </ul>
        <a
          v-if="rating?.placeUrl"
          class="v2-link"
          :href="rating.placeUrl"
          target="_blank"
          rel="noopener noreferrer"
        >Alle Bewertungen bei Google</a>
      </div>
    </UiLayoutSectionBlock>

    <!-- Einwaende -->
    <UiLayoutSectionBlock>
      <div class="v2-card v2-card--soft" data-track-placement="v2_faq">
        <h2 class="v2-h2">Häufige Fragen</h2>
        <div class="v2-faq">
          <details v-for="(faq, i) in faqs" :key="faq.question" class="v2-faq__item" :open="i === 0">
            <summary class="v2-faq__q">{{ faq.question }}</summary>
            <p class="v2-faq__a">{{ faq.answer }}</p>
          </details>
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Standort -->
    <UiLayoutSectionBlock>
      <div id="standort" class="v2-card" data-track-placement="v2_location">
        <h2 class="v2-h2">So findest du uns</h2>
        <div class="v2-location">
          <div v-if="location?.buildingImage" class="v2-location__image">
            <UiAtomMediaPicture :media="location.buildingImage" />
          </div>
          <div class="v2-location__body">
            <strong>{{ location?.name }}</strong>
            <span v-if="addressLine">{{ addressLine }}</span>
            <span v-if="location?.directions?.headline" class="v2-location__muted">{{ location.directions.headline }}</span>
            <span v-if="hours" class="v2-location__muted">{{ hours }}</span>
            <span class="v2-location__muted">Auch ohne Termin – komm vorbei und frag, ob gerade Zeit ist.</span>
          </div>
        </div>
        <div class="v2-actions v2-actions--row">
          <UiAtomBaseButton v-if="phoneHref" as="a" :href="phoneHref" variant="secondary" size="lg" class="v2-btn" @click="trackPhoneClick(phoneNumber ?? undefined)">
            <IconPhone size="18" aria-hidden="true" /> Anrufen
          </UiAtomBaseButton>
          <UiAtomBaseButton v-if="routeHref" as="a" :href="routeHref" target="_blank" rel="noopener noreferrer" variant="secondary" size="lg" class="v2-btn">
            <IconMapPin size="18" aria-hidden="true" /> Route planen
          </UiAtomBaseButton>
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Schlussaufruf -->
    <UiLayoutSectionBlock>
      <div class="v2-card v2-card--accent v2-final" data-track-placement="v2_final">
        <h2 class="v2-h2">Bereit für deine kostenlose Beratung?</h2>
        <p v-if="offer" class="v2-final__price">{{ offer.heroLine }}</p>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
          <SharedButton v-if="discountButton" :button="discountButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'secondary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <BlockAdsPriceFootnote :treatment="hero.treatment" :treatment-path-key="hero.treatmentPathKey" />
  </div>
</template>

<script setup lang="ts">
import {
  IconMapPin,
  IconPhone,
  IconShieldCheck,
  IconStarFilled,
  IconStethoscope,
  IconWalk,
} from "@tabler/icons-vue";
import type { BlockTreatmentHeroDto } from "~/lib/strapi/dto/components";
import type { LocationDto, TreatmentPageDto } from "~/lib/strapi/dto/collections";
import { SharedButtonAction, SharedButtonMethod } from "~/lib/strapi/dto/enums";
import {
  ADS_V2_CTA,
  ADS_V2_PAYMENT_NOTE,
  adsV2Faqs,
  adsV2PriceCards,
  adsV2ProductNote,
  adsV2Steps,
  adsV2TrustItems,
  employeeDisplayName,
  openingHoursSummary,
  pickAdsV2Reviews,
  shortenText,
} from "#shared/adsTemplateV2";
import { adsClipsFor } from "#shared/adsClips";
import { DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT } from "#shared/newCustomerOffer";
import { getGoogleReviewForPlace } from "~/utils/schemaLocation";

const props = defineProps<{
  hero: BlockTreatmentHeroDto;
  treatmentPage?: TreatmentPageDto | null;
  location?: LocationDto | null;
}>();

// Bewertungen und Aerzt:innen des Standorts: eigener Endpunkt, nur hier
// abgerufen (server/api/ads-template-v2).
const route = useRoute();
const citySlug = String(route.params.citySlug ?? "");
const locSlug = String(route.params.locationSlug ?? "");
const { data: extras } = await useFetch<{ reviews?: any[]; doctors?: any[] }>(
  `/api/ads-template-v2/${encodeURIComponent(citySlug)}/${encodeURIComponent(locSlug)}`,
  { key: `ads-template-v2:${citySlug}:${locSlug}`, default: () => ({}) },
);

const { t } = useI18n();
const globals = useGlobals();
const { trackPhoneClick } = useGoogleAnalytics();

const pathKey = computed(() => props.hero.treatmentPathKey ?? props.treatmentPage?.pathKey ?? "");
const locationName = computed(() => props.location?.name ?? "");
const discountPct = computed(
  () => globals.value?.ecommerce?.newsletterDiscountPercentage || DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT,
);

// Alle Buchungsknoepfe: dieselbe Aktion und dieselben Daten wie der Hero
// -> derselbe Dialog, dasselbe click_booking (A/B-Weiche unveraendert).
const bookingData = computed(() => ({
  calendlyUrl: props.hero.calendlyUrl,
  appBookingUrl: props.hero.appBookingUrl,
  locationSlug: props.hero.locationSlug,
  appTreatmentSlug: props.hero.appTreatmentSlug,
  treatmentType: props.hero.treatment?.type,
}));
const heroCta = computed(() =>
  props.hero.cta ? { ...props.hero.cta, label: ADS_V2_CTA.primary } : props.hero.cta,
);
const bookingButton = computed(() =>
  props.hero.cta
    ? {
        label: ADS_V2_CTA.primary,
        method: SharedButtonMethod.ACTION,
        action: SharedButtonAction.APPOINTMENT_BOOKING,
      }
    : null,
);
const discountLabel = computed(() =>
  t("blocks.treatmentHero.discountCta", { pct: discountPct.value }),
);
const discountButton = computed(() =>
  props.hero.cta
    ? {
        label: discountLabel.value,
        method: SharedButtonMethod.ACTION,
        action: SharedButtonAction.NEWSLETTER_SIGN_UP,
      }
    : null,
);

const offer = useNewCustomerOffer(
  () => props.hero.treatment,
  () => props.hero.treatmentPathKey,
);

// Stadt der Seite: Clips mit fremdem Stadtnamen im Bild fallen weg.
// Betrag und Euro-Zeichen nicht trennen ("149,99" / "€" auf zwei Zeilen in
// den schmalen Preiskarten).
function keepAmount(text: string | null | undefined): string {
  return String(text ?? "").replace(/(\d) (€)/g, "$1\u00a0$2");
}

const clips = computed(() => adsClipsFor(pathKey.value, citySlug));
const trustItems = adsV2TrustItems();
function trustIcon(key: string) {
  if (key === "garantie") return IconShieldCheck;
  if (key === "walkin") return IconWalk;
  return IconStethoscope;
}

const rating = computed(() => getGoogleReviewForPlace(props.location?.googlePlaceId));
const ratingLabel = computed(() =>
  rating.value
    ? rating.value.rating.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : "",
);
const ratingCountLabel = computed(() =>
  rating.value ? `${rating.value.userRatingsTotal.toLocaleString("de-DE")} Bewertungen` : "",
);

const details = computed(() => (props.treatmentPage as any)?.treatmentDetails ?? null);
const steps = computed(() => adsV2Steps(pathKey.value, details.value?.duration));
const faqs = computed(() =>
  adsV2Faqs(pathKey.value, {
    effectDuration: details.value?.effectDuration,
    initialResults: details.value?.initialResults,
  }),
);
const priceCards = computed(() =>
  adsV2PriceCards(pathKey.value, props.hero.treatment as any, discountPct.value),
);
const productNote = computed(() => adsV2ProductNote(pathKey.value));

const doctors = computed(() =>
  (extras.value?.doctors ?? [])
    .map((d: any) => ({ id: d.id, name: employeeDisplayName(d), photo: d.photo }))
    .filter((d) => d.name && d.photo),
);
const reviews = computed(() =>
  pickAdsV2Reviews(extras.value?.reviews ?? [], props.location?.city?.name, pathKey.value).map(
    (r: any) => ({ ...r, text: shortenText(r.text, 220) }),
  ),
);

const addressLine = computed(() => {
  const a: any = props.location?.address;
  if (!a) return "";
  return [[a.street, a.houseNumber].filter(Boolean).join(" "), [a.postalCode, a.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
});
const hours = computed(() => openingHoursSummary((props.location as any)?.openingHours?.week));
const phoneNumber = computed(() => (props.location as any)?.contact?.phoneNumber ?? null);
const phoneHref = computed(() => {
  const digits = String(phoneNumber.value ?? "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
});
const routeHref = computed(() => {
  const c: any = (props.location as any)?.coordinates;
  if (c?.lat && c?.long) {
    return `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.long}`;
  }
  return addressLine.value
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressLine.value)}`
    : null;
});
</script>

<style scoped>
.v2-card {
  padding: var(--space-card-pad);
  border-radius: var(--border-radius-card);
  background: var(--color-card-bg-light, #fff);
}

.v2-card--soft {
  background: var(--color-card-bg-soft);
}

.v2-card--accent {
  background: #fbeeee;
}

.v2-h2 {
  margin: 0 0 var(--space-400);
  font-size: 1.375rem;
  line-height: 1.2;
}

.v2-lead {
  margin: 0 0 var(--space-400);
  color: var(--color-text-light);
}

.v2-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  margin-top: var(--space-500);
}

.v2-actions--row {
  flex-direction: row;
  flex-wrap: wrap;
}

/* "Anrufen" + "Route planen" nebeneinander; auf 320 px untereinander statt
   ueber den Kartenrand hinaus. */
.v2-actions--row .v2-btn {
  flex: 1 1 8.5rem;
  min-width: 0;
}

.v2-btn {
  width: 100%;
}

/* Vertrauenszeile */
.v2-trust {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-300);
  margin: 0;
  padding: var(--space-500) var(--space-card-pad);
  list-style: none;
  border-radius: var(--border-radius-card);
  background: var(--color-card-bg-light, #fff);
}

.v2-trust__item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-300);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.v2-trust__icon {
  flex: 0 0 auto;
  color: #b91c1c;
}

.v2-trust__icon--star {
  color: #f5a623;
}

.v2-trust__text {
  display: block;
  color: var(--color-text-light);
}

/* Ablauf */
.v2-steps {
  display: grid;
  gap: var(--space-400);
  margin: 0;
  padding: 0;
  list-style: none;
}

.v2-steps__item {
  display: flex;
  gap: var(--space-400);
}

.v2-steps__num {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--color-black);
  color: var(--color-white);
  font-weight: var(--font-bold);
}

.v2-steps__title {
  display: block;
}

.v2-steps__text {
  display: block;
  color: var(--color-text-light);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

/* Preise */
.v2-prices {
  display: grid;
  grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
  gap: var(--space-300);
  margin: 0;
  padding: 0;
  list-style: none;
}

.v2-price {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-100);
  padding: var(--space-400) var(--space-200);
  border: 1px solid var(--color-border-mute);
  border-radius: var(--border-radius-200, 12px);
  text-align: center;
}

.v2-price--package {
  border-color: #b91c1c;
}

.v2-price__label {
  font-weight: var(--font-bold);
}

.v2-price__offer {
  font-size: 1.0625rem;
  white-space: nowrap;
  line-height: 1.2;
  color: #b91c1c;
}

.v2-price__regular,
.v2-price__note {
  font-size: var(--font-xs);
  line-height: 1.3;
  color: var(--color-text-light);
}

/* Unter 375 px passen drei Preiskarten nicht nebeneinander ("239,99 €*" lief
   ueber den Kartenrand): untereinander, Name links, Preis rechts. */
@media (max-width: 374px) {
  .v2-prices {
    grid-template-columns: minmax(0, 1fr);
  }

  .v2-price {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: baseline;
    column-gap: var(--space-300);
    padding: var(--space-300) var(--space-400);
    text-align: left;
  }

  .v2-price__offer {
    text-align: right;
  }

  .v2-price__regular,
  .v2-price__note {
    grid-column: 1 / -1;
  }
}

.v2-notes {
  margin: var(--space-400) 0 0;
  padding: 0;
  list-style: none;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

/* Aerzt:innen */
.v2-doctors {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-300);
  margin: 0 0 var(--space-400);
  padding: 0;
  list-style: none;
}

.v2-doctor {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-200);
  text-align: center;
}

.v2-doctor__photo {
  position: relative;
  width: 100%;
  /* Tablet: drei Spalten waeren sonst ~200 px grosse Kreise */
  max-width: 150px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-gray-200);
}

.v2-doctor__photo :deep(img) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 25%;
}

.v2-doctor__name {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

/* Bewertungen */
.v2-star {
  color: #f5a623;
  vertical-align: -3px;
}

.v2-reviews {
  display: grid;
  gap: var(--space-300);
  margin: 0;
  padding: 0;
  list-style: none;
}

.v2-review {
  padding: var(--space-400);
  border: 1px solid var(--color-border-mute);
  border-radius: var(--border-radius-200, 12px);
}

.v2-review__stars {
  display: inline-flex;
  color: #f5a623;
}

.v2-review__text {
  margin: var(--space-200) 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.v2-review__author {
  font-size: var(--font-xs);
  color: var(--color-text-light);
}

.v2-link {
  display: inline-block;
  margin-top: var(--space-400);
  color: inherit;
  font-weight: var(--font-bold);
}

/* FAQ */
.v2-faq__item {
  border-top: 1px solid var(--color-border-mute);
}

.v2-faq__item:last-child {
  border-bottom: 1px solid var(--color-border-mute);
}

.v2-faq__q {
  padding: var(--space-400) 0;
  font-weight: var(--font-bold);
  cursor: pointer;
}

.v2-faq__a {
  margin: 0 0 var(--space-400);
  color: var(--color-text-light);
}

/* Standort */
.v2-location {
  display: grid;
  gap: var(--space-400);
}

.v2-location__image {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--border-radius-200, 12px);
  background: var(--color-gray-200);
}

.v2-location__image :deep(img) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.v2-location__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-100);
}

.v2-location__muted {
  color: var(--color-text-light);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

/* Schluss */
.v2-final {
  text-align: center;
}

.v2-final__price {
  margin: 0;
  font-size: 1.5rem;
  font-weight: var(--font-bold);
  color: #b91c1c;
}


@media (min-width: 900px) {
  .v2-trust {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .v2-actions {
    flex-direction: row;
    justify-content: center;
  }

  .v2-btn {
    width: auto;
  }

  .v2-location {
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }

  .v2-reviews {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
