<template>
  <!--
    go.* Seitenvorlage v2 (bfroos/myhb-store#203, Playbook Kapitel 3):
    Hero -> Clips -> Vertrauenszeile -> Steckbrief -> Wirkweise (Zonenbild)
    -> Aufruf -> Ablauf (Zeitachse) -> Preise -> Weitere Zonen -> Aerzt:innen
    -> Beratungsfoto -> Bewertungen -> Einwaende ("Noch unsicher?") ->
    Standort -> Fragen + Nachsorge -> Schlussaufruf, dazu die mitlaufende
    Leiste des Heros. Kein SEO-Langtext.
    Agentur-Feedback 01.10.2026 (Beispielseite Lippen): eine Preis-/Angebots-
    zeile + ein Knopf im Hero, Leiste "Kostenlose Beratung" + "Anrufen",
    Steckbrief mit Icons, Hervorhebungen in Fliesstexten, Zonen und
    Bewertungen mobil als Wischreihe, Standort vor den Fragen, Aufruf auch
    ueber dem Ablauf, Ueberschriften zentriert, Einwand-Abschnitt.
    Umschaltung: shared/adsTemplateV2.ts (ADS_TEMPLATE_V2_PAGES); Inhalte je
    Behandlung: shared/adsTemplateV2Content.ts.
  -->
  <div class="v2">
    <BlockTreatmentHero
      v-bind="hero"
      :subline="terms?.subline ?? hero.subline"
      :cta="heroCta"
      show-floating-cta
      template-v2
      :hero-clip="clips.hero ?? null"
      :sticky-cta-label="ADS_V2_CTA.sticky"
      :v2-price-line="heroPriceLine"
      :v2-sticky-price="stickyPrice"
      :v2-note="heroNote"
    />

    <!-- Clips direkt nach dem Hero (Benjamin, 01.10.2026: "so sieht es bei
         uns aus", noch vor der Vertrauenszeile) -->
    <UiLayoutSectionBlock v-if="clips.carousel.length" spacing="sibling">
      <div class="v2-card" data-track-placement="v2_clips">
        <h2 class="v2-h2">{{ H.clips }}</h2>
        <PagesTreatmentAdsV2ClipCarousel :clips="clips.carousel" />
      </div>
    </UiLayoutSectionBlock>

    <!-- Vertrauenszeile: Google -> Garantie -> Aerzt:innen -> ohne Termin -->
    <UiLayoutSectionBlock spacing="sibling">
      <ul class="v2-trust" role="list" data-track-placement="v2_trust">
        <li v-if="rating" class="v2-trust__item">
          <IconStarFilled class="v2-trust__icon v2-trust__icon--star" size="22" aria-hidden="true" />
          <span>
            <strong>Google {{ ratingLabel }}</strong>
            <span class="v2-trust__text">{{ ratingCountLabel }} {{ atLocation }}</span>
          </span>
        </li>
        <li v-for="item in trustItems" :key="item.key" class="v2-trust__item">
          <component :is="trustIcon(item.key)" class="v2-trust__icon" size="22" aria-hidden="true" />
          <span>
            <strong>{{ item.title }}</strong>
            <span v-if="item.text" class="v2-trust__text">{{ item.text }}</span>
          </span>
        </li>
      </ul>
    </UiLayoutSectionBlock>

    <!-- 1. Steckbrief: Icon, Bezeichnung klein, Kernwert fett -->
    <UiLayoutSectionBlock v-if="facts.length">
      <div class="v2-card" data-track-placement="v2_facts">
        <h2 class="v2-h2">{{ H.facts }}</h2>
        <dl class="v2-facts">
          <div v-for="f in facts" :key="f.key" class="v2-facts__row" :class="{ 'v2-facts__row--price': f.key === 'preis' }">
            <component :is="factIcon(f.key)" class="v2-facts__icon" size="22" aria-hidden="true" />
            <dt>{{ f.label }}</dt>
            <dd>{{ f.value }}</dd>
          </div>
        </dl>
      </div>
    </UiLayoutSectionBlock>

    <!-- 2. Wirkweise mit Zonenbild -->
    <UiLayoutSectionBlock v-if="terms">
      <div class="v2-card" data-track-placement="v2_how">
        <h2 class="v2-h2">{{ H.how }}</h2>
        <div class="v2-how" :class="{ 'v2-how--text': !zoneImage }">
          <img
            v-if="zoneImage"
            class="v2-how__img"
            :src="zoneImage.src"
            :alt="zoneImage.alt"
            width="160"
            height="216"
            loading="lazy"
            decoding="async"
          />
          <p class="v2-how__text"><PagesTreatmentAdsV2Emph :parts="howParts" /></p>
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Aufruf auch direkt ueber dem Ablauf (Agentur-Feedback 01.10.2026) -->
    <UiLayoutSectionBlock>
      <div class="v2-card v2-card--accent v2-final" data-track-placement="v2_cta_mid">
        <p class="v2-h2 v2-final__title">{{ H.final }}</p>
        <p v-if="finalPrice" class="v2-final__price">
          {{ priceParts(finalPrice)[0] }}<span class="v2-nowrap">{{ priceParts(finalPrice)[1] }}</span>
        </p>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
          <SharedButton v-if="discountButton" :button="discountButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'secondary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Ablauf (5. Zeitachse) -->
    <UiLayoutSectionBlock>
      <div class="v2-card v2-card--soft" data-track-placement="v2_steps">
        <h2 class="v2-h2">{{ H.steps }}</h2>
        <ol v-if="timeline.length" class="v2-timeline">
          <li v-for="item in timeline" :key="item.when" class="v2-timeline__item">
            <span class="v2-timeline__when">{{ item.when }}</span>
            <strong class="v2-steps__title">{{ item.title }}</strong>
            <span class="v2-steps__text"><PagesTreatmentAdsV2Emph :parts="emph(item.text)" /></span>
          </li>
        </ol>
        <ol v-else class="v2-steps">
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
        <h2 class="v2-h2">{{ H.prices }}</h2>
        <p v-if="offerShown" class="v2-lead">
          Neukundenpreis mit {{ discountPct }} % Rabatt – so sicherst du ihn dir: „{{ discountLabel }}“ antippen.
        </p>
        <ul class="v2-prices" role="list" :style="{ '--cols': String(Math.min(priceCards.length, 3)) }">
          <li v-for="card in priceCards" :key="card.key" class="v2-price" :class="{ 'v2-price--package': card.isPackage }">
            <span class="v2-price__label">{{ card.label }}</span>
            <strong v-if="card.offer" class="v2-price__offer">{{ card.offer }}</strong>
            <span v-if="card.regular" class="v2-price__regular">{{ keepAmount(card.regular) }}</span>
            <span v-if="card.note" class="v2-price__note">{{ keepAmount(card.note) }}</span>
          </li>
        </ul>
        <ul class="v2-notes" role="list">
          <li>{{ priceInclusion }}</li>
          <li v-if="productNote">{{ productNote }}</li>
        </ul>
        <!-- Raten nur ueber einen vorab gekauften Gutschein (Benjamin,
             01.10.2026); ohne Fremdlogos. Knopf auf den Geschenkgutschein im Shop. -->
        <div class="v2-pay" data-track-placement="v2_payment">
          <div class="v2-pay__body">
            <IconCreditCard class="v2-pay__icon" size="22" aria-hidden="true" />
            <p class="v2-pay__text">
              <strong>{{ ADS_V2_PAYMENT_TITLE }}</strong>
              <span>{{ ADS_V2_PAYMENT_NOTE }}</span>
            </p>
          </div>
          <a
            class="v2-pay__cta"
            :href="voucherUrl"
            target="_blank"
            rel="noopener"
            data-track-placement="v2_voucher"
            @click="trackVoucherClick"
          >
            <span>{{ ADS_V2_VOUCHER_LABEL }}</span>
            <IconArrowRight class="v2-pay__arrow" size="20" aria-hidden="true" />
          </a>
        </div>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
          <SharedButton v-if="discountButton" :button="discountButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'secondary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- 7. Weitere Zonen: mobil Wischreihe, ab 900 px Raster -->
    <UiLayoutSectionBlock v-if="zoneTiles.length">
      <div class="v2-card" data-track-placement="v2_zones">
        <h2 class="v2-h2">{{ H.zones }}</h2>
        <p v-if="zoneHint" class="v2-lead">{{ zoneHint }}</p>
        <!-- Jede Kachel mit Bild: Poster des Behandlungsclips, sonst Zonenbild -->
        <ul class="v2-zones" :class="{ 'v2-zones--text': !zoneTilesHaveImages }" role="list">
          <li v-for="tile in zoneTiles" :key="tile.key" class="v2-zones__item">
            <a class="v2-zone" :class="{ 'v2-zone--photo': !!tile.photo }" :href="tile.href" data-track-placement="v2_zone_tile">
              <img
                v-if="tile.photo"
                class="v2-zone__photo"
                :src="tile.photo"
                alt=""
                width="180"
                height="240"
                loading="lazy"
                decoding="async"
              />
              <img
                v-else-if="tile.image"
                class="v2-zone__img"
                :src="tile.image.src"
                alt=""
                width="64"
                height="86"
                loading="lazy"
                decoding="async"
              />
              <span v-else-if="zoneTilesHaveImages" class="v2-zone__img v2-zone__img--empty" aria-hidden="true" />
              <span class="v2-zone__label">{{ tile.label }}</span>
            </a>
          </li>
        </ul>
      </div>
    </UiLayoutSectionBlock>

    <!-- Aerzt:innen des Centers -->
    <UiLayoutSectionBlock v-if="doctors.length">
      <div class="v2-card v2-card--soft" data-track-placement="v2_doctors">
        <h2 class="v2-h2">{{ H.doctors }}</h2>
        <ul class="v2-doctors" role="list">
          <li v-for="doc in doctors" :key="doc.id ?? doc.name" class="v2-doctor">
            <div class="v2-doctor__photo">
              <UiAtomMediaPicture :media="doc.photo" />
            </div>
            <span class="v2-doctor__name">
              <span class="v2-doctor__title">{{ doc.title || "\u00a0" }}</span>
              <strong class="v2-doctor__full">{{ doc.fullName }}</strong>
            </span>
          </li>
        </ul>
        <p class="v2-lead">{{ doctorsLead }}</p>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- 8. Beratungsfoto (leer = aus) -->
    <UiLayoutSectionBlock v-if="consultPhoto">
      <div class="v2-card" data-track-placement="v2_consult">
        <h2 class="v2-h2">{{ H.consult }}</h2>
        <img
          class="v2-consult__img"
          :src="consultPhoto.src"
          :alt="consultPhoto.alt"
          :width="consultPhoto.width"
          :height="consultPhoto.height"
          loading="lazy"
          decoding="async"
        />
      </div>
    </UiLayoutSectionBlock>

    <!-- Bewertungen des Standorts: Video mittig, Texte mobil als Wischreihe -->
    <UiLayoutSectionBlock v-if="reviews.length || clips.feedback.length">
      <div class="v2-card" data-track-placement="v2_reviews">
        <h2 class="v2-h2">{{ H.reviews }}</h2>
        <p v-if="rating" class="v2-lead">
          <IconStarFilled class="v2-star" size="18" aria-hidden="true" />
          <strong>{{ ratingLabel }}</strong> · {{ ratingCountLabel }} bei Google {{ atLocation }}
        </p>
        <!-- Kundenfeedback-Videos (Benjamin, 01.10.2026): tippen zum Abspielen, mit Ton -->
        <div v-if="clips.feedback.length" class="v2-feedback" data-track-placement="v2_feedback">
          <PagesTreatmentAdsV2ClipCarousel :clips="clips.feedback" tap-to-play placement="v2_feedback" />
        </div>
        <ul v-if="reviews.length" class="v2-reviews" role="list">
          <li v-for="review in reviews" :key="review.id ?? review.author" class="v2-review">
            <span class="v2-review__stars" role="img" aria-label="5 von 5 Sternen">
              <IconStarFilled v-for="n in 5" :key="n" size="16" aria-hidden="true" />
            </span>
            <p class="v2-review__text">„{{ review.text }}“</p>
            <span class="v2-review__author">{{ review.author }}</span>
          </li>
        </ul>
        <div class="v2-center">
          <a
            v-if="rating?.placeUrl"
            class="v2-link"
            :href="rating.placeUrl"
            target="_blank"
            rel="noopener noreferrer"
          >Alle Bewertungen bei Google</a>
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Einwaende (Agentur-Feedback 01.10.2026): nur Aussagen, die schon auf
         der Seite stehen; Texte in shared/adsTemplateV2Content.ts -->
    <UiLayoutSectionBlock v-if="objections.length">
      <div class="v2-card v2-card--soft" data-track-placement="v2_objections">
        <h2 class="v2-h2">Noch unsicher?</h2>
        <p class="v2-lead">Das hören wir oft – und das antworten wir.</p>
        <ul class="v2-objections" role="list">
          <li v-for="o in objections" :key="o.key" class="v2-objection">
            <component :is="objectionIcon(o.key)" class="v2-objection__icon" size="22" aria-hidden="true" />
            <div class="v2-objection__body">
              <strong class="v2-objection__q">{{ o.question }}</strong>
              <p class="v2-objection__a"><PagesTreatmentAdsV2Emph :parts="emph(o.answer, 0)" /></p>
              <a
                v-if="o.action === 'voucher'"
                class="v2-objection__link"
                :href="voucherUrl"
                target="_blank"
                rel="noopener"
                data-track-placement="v2_objection_voucher"
                @click="trackVoucherClick"
              >{{ ADS_V2_VOUCHER_LABEL }}<IconArrowRight size="16" aria-hidden="true" /></a>
            </div>
          </li>
        </ul>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Standort (Agentur-Feedback 01.10.2026: vor den Fragen) -->
    <UiLayoutSectionBlock>
      <div id="standort" class="v2-card" data-track-placement="v2_location">
        <h2 class="v2-h2">{{ H.location }}</h2>
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

    <!-- Fragen + Nachsorge -->
    <UiLayoutSectionBlock>
      <div class="v2-card v2-card--soft" data-track-placement="v2_faq">
        <h2 class="v2-h2">{{ H.faq }}</h2>
        <div class="v2-faq">
          <details v-for="(faq, i) in faqs" :key="faq.question" class="v2-faq__item" :open="i === 0">
            <summary class="v2-faq__q">{{ faq.question }}</summary>
            <p class="v2-faq__a"><PagesTreatmentAdsV2Emph :parts="emph(faq.answer)" /></p>
          </details>
        </div>
        <template v-if="aftercare.length">
          <h2 class="v2-h2 v2-h2--sub">{{ H.aftercare }}</h2>
          <ul class="v2-aftercare" role="list">
            <li v-for="tip in aftercare" :key="tip">{{ tip }}</li>
          </ul>
        </template>
      </div>
    </UiLayoutSectionBlock>

    <!-- Schlussaufruf -->
    <UiLayoutSectionBlock>
      <div class="v2-card v2-card--accent v2-final" data-track-placement="v2_final">
        <h2 class="v2-h2">{{ H.final }}</h2>
        <p v-if="finalPrice" class="v2-final__price">
          {{ priceParts(finalPrice)[0] }}<span class="v2-nowrap">{{ priceParts(finalPrice)[1] }}</span>
        </p>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
          <SharedButton v-if="discountButton" :button="discountButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'secondary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Variante B ohne Sternchen-Preise: keine Fussnote -->
    <BlockAdsPriceFootnote v-if="!isB" :treatment="hero.treatment" :treatment-path-key="hero.treatmentPathKey" />
  </div>
</template>

<script setup lang="ts">
import {
  IconArmchair,
  IconArrowRight,
  IconCalendarCheck,
  IconCircleCheck,
  IconClock,
  IconCreditCard,
  IconHourglass,
  IconMapPin,
  IconMessageCircle,
  IconMoodSmile,
  IconPhone,
  IconRepeat,
  IconShieldCheck,
  IconSnowflake,
  IconSparkles,
  IconStarFilled,
  IconStethoscope,
  IconTag,
  IconWalk,
} from "@tabler/icons-vue";
import type { BlockTreatmentHeroDto } from "~/lib/strapi/dto/components";
import type { LocationDto, TreatmentPageDto } from "~/lib/strapi/dto/collections";
import { SharedButtonAction, SharedButtonMethod } from "~/lib/strapi/dto/enums";
import {
  ADS_V2_CTA,
  ADS_V2_PAYMENT_NOTE,
  ADS_V2_PAYMENT_TITLE,
  ADS_V2_VOUCHER_LABEL,
  adsV2Faqs,
  adsV2PriceCards,
  adsV2ProductNote,
  adsV2Steps,
  adsV2TreatmentSlug,
  adsV2TrustItems,
  adsV2VoucherUrl,
  employeeDisplayName,
  openingHoursSummary,
  pickAdsV2Reviews,
  shortenText,
} from "#shared/adsTemplateV2";
import { adsClipsFor } from "#shared/adsClips";
import {
  adsV2Aftercare,
  adsV2ConsultPhoto,
  adsV2Facts,
  adsV2FaqsV2,
  adsV2Headings,
  adsV2Terms,
  adsV2Timeline,
  adsV2ZoneHint,
  adsV2ZoneImage,
  adsV2ZoneTiles,
  adsV2PriceInclusion,
  adsV2AtLocation,
  adsV2Emphasize,
  adsV2HowParts,
  adsV2Objections,
} from "#shared/adsTemplateV2Content";
import { DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT, formatEuroCent } from "#shared/newCustomerOffer";
import {
  adsOfferBPath,
  adsOfferRegularCards,
  adsOfferRegularPriceLine,
} from "#shared/adsOfferVariant";
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
const { trackPhoneClick, trackEvent } = useGoogleAnalytics();

const pathKey = computed(() => props.hero.treatmentPathKey ?? props.treatmentPage?.pathKey ?? "");
const locationName = computed(() => props.location?.name ?? "");

// Gutschein fuer Ratenzahlung: eigenes Ereignis, bewusst (noch) nicht in der
// GTM-Ereignisliste; nur Behandlung, Standort, Vorlage, keine Personendaten.
const voucherUrl = computed(() => adsV2VoucherUrl(pathKey.value, citySlug));
function trackVoucherClick() {
  trackEvent("click_voucher", {
    treatment: adsV2TreatmentSlug(pathKey.value),
    location: locSlug || citySlug,
    template: "v2",
  });
}
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
  props.hero.cta && offerVariant.value !== "b"
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

// Angebots-Test (shared/adsOfferVariant.ts): Variante B unter
// /ab-beratung/... - keine Rabattbotschaft, regulaere Preise (Strapi
// priceInEuroCent wie www), Vertrauenszeile im Hero. A = heutiger Stand.
const offerVariant = useAdsOfferVariant();
const isB = computed(() => offerVariant.value === "b");
/** Neukundenangebot, wie es die Seite zeigt (B: keins). */
const offerShown = computed(() => (isB.value ? null : offer.value));
const regularLine = computed(() =>
  adsOfferRegularPriceLine(props.hero.treatment as any, formatEuroCent),
);
const heroNote = computed(() =>
  isB.value
    ? ["Nur Ärztinnen und Ärzte", "Zufriedenheitsgarantie", "auch ohne Termin"]
        .map((v) => v.replace(/ /g, "\u00a0"))
        .join(" · ")
    : null,
);

/** "ab 119,99 €*" / "ab 79,99 € pro Zone*" (ohne "Neukunden"); B: "ab 149,99 €". */
const shortPrice = computed(() =>
  isB.value
    ? regularLine.value
    : offer.value
      ? offer.value.heroLine.replace(/^Neukunden\s+/, "")
      : null,
);
// Hero (Agentur-Feedback 01.10.2026): EINE Zeile "Ab 119,99 €* – mit 20 %
// Neukundenrabatt" statt Preis + zweitem Rabatt-Link.
const heroPriceLine = computed(() => {
  const p = shortPrice.value;
  if (!p) return null;
  return {
    main: `${p[0]!.toUpperCase()}${p.slice(1)}`.replace(/\s/g, "\u00a0"),
    extra: isB.value ? null : `– mit ${discountPct.value}\u00a0% Neukundenrabatt`,
  };
});
const stickyPrice = computed(() => shortPrice.value);
const finalPrice = computed(() => (isB.value ? regularLine.value : offer.value?.heroLine ?? null));

// Stadt der Seite: Clips mit fremdem Stadtnamen im Bild fallen weg.
// Betrag und Euro-Zeichen nicht trennen ("149,99" / "€" auf zwei Zeilen in
// den schmalen Preiskarten).
/**
 * "Neukunden ab 239,99 €*" -> ["Neukunden ", "ab 239,99 €*"]: der Betrag samt
 * "ab" und "€*" bricht nicht um (iPhone SE, 320 px).
 */
function priceParts(text: string | null | undefined): [string, string] {
  const t = String(text ?? "");
  const m = /(?:ab\s)?\d[\d.]*(?:,\d{2})?\s?€\*?(?:\s+pro\s+Zone\*?)?/.exec(t);
  if (!m) return [t, ""];
  return [t.slice(0, m.index), t.slice(m.index).replace(/\s/g, "\u00a0")];
}

function keepAmount(text: string | null | undefined): string {
  return String(text ?? "").replace(/(\d) (€)/g, "$1\u00a0$2");
}

const clips = computed(() => adsClipsFor(pathKey.value, citySlug));
const trustItems = computed(() => adsV2TrustItems(pathKey.value));
const priceInclusion = computed(() => adsV2PriceInclusion(pathKey.value));
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
const faqs = computed(() => {
  const v2 = adsV2FaqsV2(pathKey.value);
  if (v2.length) return v2;
  return adsV2Faqs(pathKey.value, {
    effectDuration: details.value?.effectDuration,
    initialResults: details.value?.initialResults,
  });
});

// Glowtox-Punkte 1-8 (shared/adsTemplateV2Content.ts); ohne Eintrag fuer die
// Behandlung bleiben die bisherigen Texte.
const terms = computed(() => adsV2Terms(pathKey.value));
const H = computed(() => {
  if (terms.value) return adsV2Headings(terms.value, locationName.value);
  const at = locationName.value ? ` in ${locationName.value}` : "";
  return {
    facts: "", how: "", clips: "So sieht die Behandlung aus", steps: "So läuft dein Termin ab",
    prices: `Preise${at}`, zones: "", doctors: `Dein Ärzteteam${at}`, consult: "",
    reviews: "Das sagen Kundinnen und Kunden", faq: "Häufige Fragen", aftercare: "",
    location: "So findest du uns", final: "Bereit für deine kostenlose Beratung?",
  };
});
// Steckbrief + Preis (Agentur-Feedback 01.10.2026: Kernwerte wie Dauer,
// Wirkung, Preis auf einen Blick). Preis = dieselbe Zeile wie im Hero.
const facts = computed(() => {
  const rows = adsV2Facts(pathKey.value, details.value?.duration);
  if (rows.length && shortPrice.value) {
    rows.splice(1, 0, { key: "preis", label: "Preis", value: shortPrice.value });
  }
  return rows;
});
const FACT_ICONS: Record<string, any> = {
  dauer: IconClock,
  preis: IconTag,
  wirkung: IconSparkles,
  ergebnis: IconCircleCheck,
  haltbarkeit: IconHourglass,
  sitzungen: IconRepeat,
  betaeubung: IconSnowflake,
  ausfall: IconWalk,
  vorab: IconStethoscope,
  ablauf: IconArmchair,
};
function factIcon(key: string) {
  return FACT_ICONS[key] ?? IconCircleCheck;
}
const howParts = computed(() => adsV2HowParts(pathKey.value));
/** Fliesstext mit fetten Schluesselwoertern (ab ca. drei Zeilen). */
function emph(text: string, minChars?: number) {
  return adsV2Emphasize(text, minChars === undefined ? {} : { minChars });
}
const objections = computed(() =>
  adsV2Objections(pathKey.value, {
    price: shortPrice.value,
    discountPct: offerShown.value ? discountPct.value : null,
    strapiDuration: details.value?.duration,
  }),
);
const OBJECTION_ICONS: Record<string, any> = {
  result: IconMoodSmile,
  pain: IconSnowflake,
  price: IconCreditCard,
  time: IconCalendarCheck,
  info: IconMessageCircle,
};
function objectionIcon(key: string) {
  return OBJECTION_ICONS[key] ?? IconCircleCheck;
}
const timeline = computed(() => adsV2Timeline(pathKey.value));
const aftercare = computed(() => adsV2Aftercare(pathKey.value));
const zoneImage = computed(() => adsV2ZoneImage(terms.value?.zone));
// Variante B bleibt beim Wechsel auf eine andere Zone in B.
const zoneTiles = computed(() =>
  adsV2ZoneTiles(pathKey.value, citySlug, locSlug).map((t) =>
    isB.value ? { ...t, href: adsOfferBPath(t.href) } : t,
  ),
);
// Ohne ein einziges Zonenbild (Skinbooster, Infusionen): schlichte Textkacheln.
const zoneTilesHaveImages = computed(() => zoneTiles.value.some((t) => !!t.image));
const doctorsLead = "Bei uns behandeln nur Ärztinnen und Ärzte – von der Beratung bis zur Nachkontrolle.";
// "in den Köln Arcaden", "im Minto" (ohne Umbruch im Namen)
const atLocation = computed(() => adsV2AtLocation(locationName.value));
const zoneHint = computed(() => adsV2ZoneHint(priceCards.value));
const consultPhoto = computed(() => adsV2ConsultPhoto(pathKey.value));
const priceCards = computed(() => {
  const cards = adsV2PriceCards(pathKey.value, props.hero.treatment as any, discountPct.value);
  return isB.value ? adsOfferRegularCards(cards) : cards;
});
const productNote = computed(() => adsV2ProductNote(pathKey.value));

/**
 * Zwei feste Zeilen (Benjamin, 01.10.2026: "Arzt Wisam" einzeilig neben
 * "Arzt / Mamdoh" zweizeilig): oben die Anrede ("Arzt", "Ärztin", "Dr."),
 * darunter der Name. Die Anrede steht in Strapi teils im Vornamen.
 */
function doctorLines(display: string): { title: string; fullName: string } {
  const m = /^((?:Dr\.\s*(?:med\.\s*)?(?:dent\.\s*)?)|Ärztin|Arzt|Prof\.\s*(?:Dr\.\s*)?)\s*(.+)$/.exec(display.trim());
  return m ? { title: m[1]!.trim(), fullName: m[2]!.trim() } : { title: "", fullName: display.trim() };
}

const doctors = computed(() =>
  (extras.value?.doctors ?? [])
    .map((d: any) => ({
      id: d.id,
      name: employeeDisplayName(d),
      ...doctorLines(employeeDisplayName(d)),
      photo: d.photo,
    }))
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

/* Alle Abschnittsueberschriften fett und zentriert, einheitlich (Agentur-
   Feedback 01.10.2026). */
.v2-h2 {
  margin: 0 0 var(--space-400);
  font-size: 1.375rem;
  line-height: 1.2;
  font-weight: var(--font-bold);
  text-align: center;
  text-wrap: balance;
  /* keine Silbentrennung in Ueberschriften ("Vit-amin") */
  hyphens: manual;
}

.v2-lead {
  margin: 0 0 var(--space-400);
  color: var(--color-text-light);
  text-align: center;
}

.v2-center {
  text-align: center;
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

.v2-h2--sub {
  margin-top: var(--space-600, 32px);
  font-size: 1.125rem;
}

/* 1. Steckbrief (Agentur-Feedback 01.10.2026): mobil Liste mit kleinem
   Icon, Bezeichnung klein und grau, Kernwert fett darunter; ab 900 px
   Kacheln in drei Spalten. */
.v2-facts {
  display: grid;
  margin: 0;
}

.v2-facts__row {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  grid-template-rows: auto auto;
  column-gap: var(--space-300);
  padding: var(--space-300) 0;
  border-top: 1px solid var(--color-border-mute);
}

.v2-facts__row:first-child {
  border-top: 0;
  padding-top: 0;
}

.v2-facts__icon {
  grid-row: 1 / span 2;
  margin-top: 2px;
  color: #b91c1c;
}

.v2-facts dt {
  font-size: var(--font-xs);
  line-height: 1.3;
  color: var(--color-text-light);
}

.v2-facts dd {
  margin: 0;
  min-width: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  font-weight: var(--font-bold);
  color: var(--color-text);
  hyphens: auto;
}

.v2-facts__row--price dd {
  color: #b91c1c;
}

@media (min-width: 900px) {
  .v2-facts {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-300);
  }

  .v2-facts__row,
  .v2-facts__row:first-child {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto;
    row-gap: var(--space-100);
    align-content: start;
    padding: var(--space-400);
    border: 0;
    border-radius: var(--border-radius-200, 12px);
    background: var(--color-card-bg-soft);
  }

  .v2-facts__icon {
    grid-row: auto;
    margin: 0 0 var(--space-100);
  }

  .v2-facts dd {
    font-size: var(--font-md, 1rem);
    line-height: 1.35;
  }
}

/* 7-8 Kernwerte: vier Spalten statt einer einzelnen Kachel in der letzten Reihe */
@media (min-width: 1100px) {
  .v2-facts {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* 2. Wirkweise */
.v2-how {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: var(--space-400);
  align-items: center;
}

.v2-how__img {
  width: 112px;
  height: auto;
}

/* ohne Zonenbild: Text ueber die ganze Breite */
.v2-how.v2-how--text {
  grid-template-columns: minmax(0, 1fr);
}

/* Kacheln ohne Bilder: nur Text, niedriger */
.v2-zones--text .v2-zone {
  justify-content: center;
  min-height: 64px;
}

.v2-how__text {
  margin: 0;
  min-width: 0;
  color: var(--color-text-light);
  hyphens: auto;
}

/* 320-374 px: Zonenbild kleiner */
@media (max-width: 374px) {
  .v2-how {
    grid-template-columns: 72px minmax(0, 1fr);
    align-items: start;
    gap: var(--space-300);
    font-size: var(--font-sm);
    line-height: var(--line-sm);
  }

  .v2-how__img {
    width: 72px;
  }
}

/* 5. Zeitachse */
.v2-timeline {
  position: relative;
  display: grid;
  gap: var(--space-400);
  margin: 0;
  padding: 0 0 0 var(--space-500);
  list-style: none;
  border-left: 2px solid #f1c9c9;
}

.v2-timeline__item {
  position: relative;
}

.v2-timeline__item::before {
  content: "";
  position: absolute;
  left: calc(-1 * var(--space-500) - 6px);
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #b91c1c;
}

.v2-timeline__when {
  display: block;
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #b91c1c;
}

/* Standortnamen mit geschuetztem Bindestrich ("Gesundbrunnen-Center") sind
   ein Wort: nicht ueber den Kartenrand hinaus. */
.v2-h2 {
  overflow-wrap: break-word;
}

/* 7. Weitere Zonen: mobil Wischreihe mit Einrasten (Agentur-Feedback
   01.10.2026), Kacheln ca. 44 % breit, die naechste schaut an. */
.v2-zones {
  display: flex;
  gap: var(--space-300);
  margin: 0 calc(-1 * var(--space-card-pad));
  padding: 0 var(--space-card-pad) var(--space-200);
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--space-card-pad);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.v2-zones__item {
  flex: 0 0 min(44%, 200px);
  min-width: 132px;
  scroll-snap-align: start;
}

.v2-zones--text .v2-zones__item {
  flex-basis: min(48%, 220px);
}

@media (min-width: 900px) {
  .v2-zones {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    max-width: 720px;
    margin: 0 auto;
    padding: 0;
    overflow: visible;
  }

  .v2-zones__item {
    min-width: 0;
  }
}

.v2-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-200);
  height: 100%;
  padding: var(--space-300) var(--space-200);
  border: 1px solid var(--color-border-mute);
  border-radius: var(--border-radius-200, 12px);
  color: inherit;
  text-align: center;
  text-decoration: none;
}

.v2-zone__img {
  width: 64px;
  height: 86px;
}

/* Kachel mit Foto (Poster des Behandlungsclips): Bild fuellt die Breite */
.v2-zone--photo {
  padding: 0 0 var(--space-300);
  overflow: hidden;
}

.v2-zone__photo {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  object-position: center 40%;
  background: #fbf7f5;
}

.v2-zone--photo .v2-zone__label {
  padding: 0 var(--space-200);
}

.v2-zone__img--empty {
  display: block;
  border-radius: 12px;
  background: #fbf7f5;
}

.v2-zone__label {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  line-height: 1.2;
  hyphens: auto;
}

/* 8. Beratungsfoto */
.v2-consult__img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--border-radius-200, 12px);
}

/* 6. Nachsorge */
.v2-aftercare {
  display: grid;
  gap: var(--space-200);
  margin: 0;
  padding: 0 0 0 1.1rem;
  list-style: disc;
  color: var(--color-text-light);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
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

/* Zwei feste Zeilen (Titel / Name), damit alle Namen auf einer Hoehe stehen */
.v2-doctor__name {
  display: grid;
  grid-template-rows: auto auto;
  width: 100%;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.v2-doctor__title {
  color: var(--color-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v2-doctor__full {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  min-height: calc(2em * var(--line-sm, 1.5));
  hyphens: auto;
}

/* Ratenzahlung ueber Gutschein */
.v2-pay {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  margin-top: var(--space-400);
  padding: var(--space-400);
  border-radius: var(--border-radius-200, 12px);
  background: #fbeeee;
}

.v2-pay__body {
  display: flex;
  align-items: flex-start;
  gap: var(--space-300);
}

.v2-pay__icon {
  flex: 0 0 auto;
  color: #b91c1c;
}

.v2-pay__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-100);
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

/* Sekundaerknopf, aber klar als Knopf: weisse Fuellung, dunkler Rahmen,
   Pfeil, mind. 48 px hoch; darf auf 320 px umbrechen statt ueberzulaufen. */
.v2-pay__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-200);
  width: 100%;
  min-height: 48px;
  padding: 10px 20px;
  border: 2px solid var(--color-black, #111);
  border-radius: 999px;
  background: #fff;
  color: var(--color-black, #111);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  line-height: 1.25;
  text-align: center;
  text-wrap: balance;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s linear, color 0.15s linear;
}

.v2-pay__cta:hover {
  background: var(--color-black, #111);
  color: #fff;
}

.v2-pay__cta:focus-visible {
  outline: 2px solid var(--color-text, #111);
  outline-offset: 3px;
}

.v2-pay__cta:active {
  transform: scale(0.98);
}

.v2-pay__arrow {
  flex: 0 0 auto;
}

/* Kundenfeedback-Videos ueber den Textbewertungen: mittig, solange sie in
   die Breite passen; mehr wischt (auto-Raender statt justify-content, sonst
   waere der erste Clip abgeschnitten). */
.v2-feedback {
  margin-bottom: var(--space-500);
}

.v2-feedback :deep(.clips__item:first-child) {
  margin-left: auto;
}

.v2-feedback :deep(.clips__item:last-child) {
  margin-right: auto;
}

.v2-nowrap {
  white-space: nowrap;
}

/* Bewertungen */
.v2-star {
  color: #f5a623;
  vertical-align: -3px;
}

/* Bewertungen mobil als Wischreihe (Agentur-Feedback 01.10.2026) */
.v2-reviews {
  display: flex;
  gap: var(--space-300);
  margin: 0 calc(-1 * var(--space-card-pad));
  padding: 0 var(--space-card-pad) var(--space-200);
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--space-card-pad);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.v2-review {
  flex: 0 0 85%;
  scroll-snap-align: start;
  padding: var(--space-400);
  border: 1px solid var(--color-border-mute);
  border-radius: var(--border-radius-200, 12px);
  background: var(--color-card-bg-light, #fff);
}

/* Einwaende */
.v2-objections {
  display: grid;
  gap: var(--space-300);
  margin: 0;
  padding: 0;
  list-style: none;
}

.v2-objection {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: var(--space-300);
  padding: var(--space-400);
  border-radius: var(--border-radius-200, 12px);
  background: var(--color-card-bg-light, #fff);
}

.v2-objection__icon {
  margin-top: 1px;
  color: #b91c1c;
}

.v2-objection__body {
  min-width: 0;
}

.v2-objection__q {
  display: block;
  margin-bottom: var(--space-100);
}

.v2-objection__a {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

.v2-objection__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-100);
  margin-top: var(--space-200);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: inherit;
}

@media (min-width: 900px) {
  .v2-objections {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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

.v2-final__title {
  margin-bottom: var(--space-300);
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
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: 0;
    padding: 0;
    overflow: visible;
  }
}
</style>
