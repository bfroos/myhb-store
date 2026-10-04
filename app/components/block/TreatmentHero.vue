<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="hero-card" ref="heroCardRef">
        <div v-if="hasMarquee && !isAdsMode" class="hero__marquee-wrapper">
          <div class="hero__marquee" role="marquee" aria-live="polite">
            <div class="hero__marquee-viewport">
              <div
                class="hero__marquee-track"
                :style="{ '--marquee-duration': `${marqueeDurationSeconds}s` }"
              >
                <template
                  v-for="(item, idx) in marqueeTrackItems"
                  :key="`m-${idx}`"
                >
                  <span class="hero__marquee-item">{{ item }}</span>
                  <span
                    v-if="idx !== marqueeTrackItems.length - 1"
                    class="hero__marquee-sep"
                    aria-hidden="true"
                  >
                    <IconAsterisk size=".8em" />
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div
          class="hero"
          :class="{
            'hero--has-marquee': hasMarquee,
            'hero--has-reviews': showReviews,
            'hero--ads-offer': !!newCustomerOffer,
            'hero--ads-buttons': forceBothButtons,
            'hero--ads-compact': isAdsMode,
            'hero--ads-long-title': isAdsMode && (headline?.length ?? 0) > 26,
            'hero--v2': templateV2,
            'hero--ci': templateV2 && (v2Design === 'ci' || v2Design === 'ci-hell'),
            'hero--desk': templateV2 && v2Desktop,
            'hero--preis': templateV2 && v2Design === 'ci-preis',
          }"
        >
          <div v-if="hasCover || heroClip" class="hero__media">
            <UiAtomMediaPicture
              v-if="!heroClip"
              class="hero__media-image"
              :media="cover!"
              :sources="{
                [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
              }"
              priority
            />
            <!-- go.-Vorlage v2: Clip statt Foto; sein Poster ist das
                 LCP-Element (shared/adsClips.ts). -->
            <PagesTreatmentAdsV2HeroClip v-if="heroClip" :clip="heroClip" />
          </div>
          <div class="hero__body">
            <header class="hero__main">
              <!--
                go.: Im ersten Screen nur Bild, H1, EINE Unterzeile, EINE
                Preiszeile, zwei Knoepfe, Google-Sterne (Benjamin, 30.09.2026).
                Eyebrow, Zusatztext, Marquee, Logos, regulaerer Preis und
                Rechnung entfallen dort; Sternchen und regulaerer Preis stehen
                in der Fussnotenzeile am Seitenende (BlockAdsPriceFootnote).
              -->
              <p v-if="eyebrow && !isAdsMode" class="hero__eyebrow">
                {{ eyebrow }}
              </p>
              <h1 v-if="headline" class="hero__title">
                <span
                  v-if="headlinePrefix && !isAdsMode"
                  class="hero__title-prefix"
                >
                  {{ headlinePrefix }}
                </span>
                {{ headline }}
                <span
                  v-if="headlineSuffix && (!isAdsMode || strapiMode)"
                  class="hero__title-suffix"
                >
                  {{ headlineSuffix }}
                </span>
              </h1>
              <!-- go., in Strapi gebaute Seite (ADS_TEMPLATE_V2_EXCLUDE):
                   Unterzeile und Text wie in Strapi, ohne zusaetzliche rote
                   Preiszeile (Redaktion, 02.10.2026). -->
              <template v-if="isAdsMode && !strapiMode">
                <p v-if="adsSubline" class="hero__subline hero__subline--ads">
                  {{ adsSubline }}
                </p>
                <!-- v2 (Agentur-Feedback 01.10.2026): EINE Preis-/Angebotszeile
                     "Ab 119,99 €* – mit 20 % Neukundenrabatt" statt Preis +
                     zweitem Rabatt-Link; Betrag ohne Umbruch. -->
                <p
                  v-if="templateV2 && v2PriceLine"
                  class="hero__price hero__price--v2"
                  :data-offer-kind="newCustomerOffer?.kind ?? 'regular'"
                >
                  <span class="hero__nowrap">{{ v2PriceLine.main }}</span>
                  <span v-if="v2PriceLine.extra" class="hero__price-extra">{{ v2PriceLine.extra }}</span>
                </p>
                <p
                  v-else-if="newCustomerOffer"
                  class="hero__price"
                  :data-offer-kind="newCustomerOffer.kind"
                >
                  <!-- v2: Betrag und "€*" nicht trennen ("239,99" / "€*") -->
                  <template v-if="templateV2">{{ heroPriceParts[0] }}<span class="hero__nowrap">{{ heroPriceParts[1] }}</span></template>
                  <template v-else>{{ newCustomerOffer.heroLine }}</template>
                </p>
              </template>
              <template v-else>
                <p v-if="subline" class="hero__subline">
                  <strong>{{ subline }}</strong>
                </p>
                <p v-if="text" class="hero__text">{{ text }}</p>
              </template>
              <div class="hero__cta">
                <div
                  class="hero__cta-price"
                  :class="{ 'hero__cta-price--with-price': !!priceLabel }"
                >
                  <strong v-if="priceLabel">{{ priceLabel }}</strong>
                  <SharedButton
                    v-if="cta && bookingButtonVisible"
                    :button="cta"
                    :data="{
                      calendlyUrl: calendlyUrl,
                      appBookingUrl: appBookingUrl,
                      locationSlug: locationSlug,
                      appTreatmentSlug: appTreatmentSlug,
                      treatmentType: treatment?.type,
                    }"
                    :button-props="{
                      size: 'lg',
                      variant: 'primary',
                      wide: !priceLabel && !forceBothButtons,
                    }"
                    class="hero-cta-btn"
                  />
                </div>
                <SharedButton
                  v-if="discountButtonVisible && !templateV2"
                  class="hero-cta-btn"
                  :button="{
                    label: discountLabel,
                    method: SharedButtonMethod.ACTION,
                    action: SharedButtonAction.NEWSLETTER_SIGN_UP,
                  }"
                  :data="{
                    calendlyUrl: calendlyUrl,
                    appBookingUrl: appBookingUrl,
                    locationSlug: locationSlug,
                    appTreatmentSlug: appTreatmentSlug,
                    treatmentType: treatment?.type,
                  }"
                  :button-props="{ size: 'lg', variant: 'secondary' }"
                />
                <!-- v2: nur EIN Knopf im Hero. Der zweite rote Rabatt-Link ist
                     weg (Agentur-Feedback 01.10.2026), der Rabatt steht in der
                     Preiszeile; "20 % Rabatt sichern" gibt es weiter unten
                     (Preise, Schlussaufruf). -->
              </div>
              <p v-if="templateV2 && v2Note" class="hero__v2-note">{{ v2Note }}</p>
              <template v-if="showReviews">
                <UiMoleculeReviewsBadge
                  v-if="googlePlaceId"
                  show-text
                  :source="ReviewSource.GOOGLE"
                  :rating="5"
                  :local-rating-threshold="4"
                  :local-min-reviews="5"
                  :google-place-id="googlePlaceId"
                  class="hero__reviews"
                />
                <UiMoleculeReviewsBadge
                  v-else
                  show-text
                  :source="ReviewSource.GOOGLE"
                  :rating="5"
                  class="hero__reviews"
                />
              </template>
            </header>
            <ul v-if="showCompanyLogos && !isAdsMode" class="hero__logos" role="list">
              <li class="hero__logo">
                <ImageBildLogo style="height: 30px" />
              </li>
              <li class="hero__logo">
                <ImageWdrLogo style="height: 18px" />
              </li>
              <li class="hero__logo">
                <ImageTheSunLogo style="height: 20px" />
              </li>
              <li class="hero__logo">
                <ImageRtlLogo style="height: 16px" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>

  <Teleport to="body" v-if="showFloatingCta && isMounted">
    <Transition name="floating-cta">
      <div v-show="showFloatingBanner" class="floating-cta" :class="{ 'floating-cta--ads-mode': isAdsMode, 'floating-cta--v2': templateV2, 'floating-cta--ci': templateV2 && (v2Design === 'ci' || v2Design === 'ci-hell'), 'floating-cta--preis': templateV2 && v2Design === 'ci-preis' }">
        <div class="floating-cta__content">
          <div class="floating-cta__text">
            <strong
              v-if="templateV2 && v2StickyPrice"
              class="floating-cta__price floating-cta__price--offer"
            >
              {{ v2StickyPrice }}
            </strong>
            <strong
              v-else-if="newCustomerOffer"
              class="floating-cta__price floating-cta__price--offer"
            >
              {{ stickyPriceLine }}
            </strong>
            <strong v-else-if="priceLabel" class="floating-cta__price">
              {{ priceLabel }}
            </strong>
            <!-- go.: Leiste einzeilig, nur Preis + Telefon + Buchen (#181) -->
            <span
              v-if="!isAdsMode && (headline || eyebrow)"
              class="floating-cta__title"
            >
              {{ headline || eyebrow }}
            </span>
          </div>
          <div class="floating-cta__actions">
            <a
              v-if="isAdsMode && phoneHref"
              :href="phoneHref"
              class="floating-cta__phone"
              :class="{ 'floating-cta__phone--label': templateV2 }"
              :aria-label="`${t('blocks.locationContact.phone')}: ${phoneNumber}`"
              @click="trackPhoneClick(phoneNumber ?? undefined)"
            >
              <IconPhone :size="templateV2 ? 18 : 22" aria-hidden="true" />
              <!-- v2: Telefon mit Beschriftung (Agentur-Feedback 01.10.2026) -->
              <span v-if="templateV2" class="floating-cta__phone-label">Anrufen</span>
            </a>
            <template v-if="showReviews && !isAdsMode">
              <UiMoleculeReviewsBadge
                v-if="googlePlaceId"
                show-text
                :source="ReviewSource.GOOGLE"
                :rating="5"
                :local-rating-threshold="4"
                :local-min-reviews="5"
                :google-place-id="googlePlaceId"
                class="floating-cta__reviews"
              />
              <UiMoleculeReviewsBadge
                v-else
                show-text
                :source="ReviewSource.GOOGLE"
                :rating="5"
                class="floating-cta__reviews"
              />
            </template>
            <SharedButton
              v-if="cta && bookingButtonVisible"
              :button="stickyCta"
              :data="{
                calendlyUrl: calendlyUrl,
                appBookingUrl: appBookingUrl,
                locationSlug: locationSlug,
                appTreatmentSlug: appTreatmentSlug,
                treatmentType: treatment?.type,
              }"
              :button-props="{
                size: 'md',
                variant: 'primary',
              }"
              class="floating-cta-btn"
              :class="{ 'floating-cta__button--ads-mode': isAdsMode }"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  ReviewSource,
  ImageFormat,
  ImageBreakpoint,
  SharedButtonMethod,
  SharedButtonAction,
} from "~/lib/strapi/dto/enums";
import type { BlockTreatmentHeroDto } from "~/lib/strapi/dto/components";
import { IconAsterisk, IconPhone } from "@tabler/icons-vue";
import { isMediaImage } from "~/utils/media";
import type { AdsClip } from "#shared/adsClips";

const { isAdsMode: siteIsAdsMode } = useSiteModeFlags();

const props = withDefaults(
  defineProps<
    BlockTreatmentHeroDto & {
      showFloatingCta?: boolean;
      /** go.-Vorlage v2 (shared/adsTemplateV2.ts): Knoepfe untereinander. */
      templateV2?: boolean;
      /** go.-Vorlage v2: stummer Clip ueber dem Hero-Foto. */
      heroClip?: AdsClip | null;
      /** Kurzer Text fuer den Knopf der mitlaufenden Leiste. */
      stickyCtaLabel?: string | null;
      /**
       * go.-Vorlage v2: EINE Preis-/Angebotszeile im Hero, z. B.
       * { main: "Ab 119,99 €*", extra: "– mit 20 % Neukundenrabatt" }.
       */
      v2PriceLine?: { main: string; extra?: string | null } | null;
      /** go.-Vorlage v2: kleine Zeile unter dem Knopf (Vertrauen). */
      v2Note?: string | null;
      /** go.-Vorlage v2: Preis in der mitlaufenden Leiste. */
      v2StickyPrice?: string | null;
      /**
       * go.-Vorlage v2: Gestaltung (shared/adsTemplateV2.ts, adsV2Design).
       * "ci"/"ci-hell": Preiszeile schwarz statt rot; rot nur die Leiste.
       * "ci-rot": Preiszeile rot wie heute.
       */
      v2Design?: "v2" | "ci" | "ci-hell" | "ci-rot" | "ci-preis";
      /**
       * go.-Vorlage v2: Desktop-Layout ab 1024 px (shared/adsTemplateV2.ts,
       * isAdsV2DesktopLayout): Text linksbuendig, Hero nicht bildschirmhoch.
       */
      v2Desktop?: boolean;
    }
  >(),
  {
    showFloatingCta: false,
    showBookingButton: true,
    templateV2: false,
    heroClip: null,
    stickyCtaLabel: null,
    v2PriceLine: null,
    v2Note: null,
    v2StickyPrice: null,
    v2Design: "v2",
    v2Desktop: false,
  },
);

// Vorlage v2 verhaelt sich auch auf www wie go. (bundesweite Meta-Seiten,
// app/pages/aktion/[slug].vue); sonst gilt der Modus der Seite.
const isAdsMode = computed(() => siteIsAdsMode.value || props.templateV2);

// Gleicher Knopf (gleiche Aktion, gleiche Daten -> gleiches click_booking),
// nur kuerzer beschriftet.
const stickyCta = computed(() =>
  props.cta && props.stickyCtaLabel
    ? { ...props.cta, label: props.stickyCtaLabel }
    : props.cta,
);
const { t, locale } = useI18n();
const globals = useGlobals();

// go.: Benjamins Vorgabe (29.09.2026) - im Hero stehen immer beide Knoepfe:
// "Termin buchen" (primaer, oeffnet direkt die Buchung) und "20 % Rabatt
// sichern" (sekundaer, erst Newsletter, dann Buchung). Die Strapi-Schalter
// showBookingButton/showDiscount gelten dort nicht, auch nicht auf den
// "-rabatt"-Seiten, die bisher nur den Rabatt-Knopf hatten. Ohne `cta` (Standort
// nimmt keine Buchungen an) bleibt es beim Strapi-Stand. www unveraendert.
// Ausnahme: in Strapi fuer go. gebaute Seiten (ADS_TEMPLATE_V2_EXCLUDE,
// `strapiHero`) - dort gelten die Strapi-Schalter (Redaktion, 02.10.2026).
const strapiMode = computed(
  () => isAdsMode.value && !!props.strapiHero && !props.templateV2,
);
const forceBothButtons = computed(
  () => isAdsMode.value && !!props.cta && !strapiMode.value,
);
// "Termin buchen" bleibt auf go. auch dort fest (Hero und Leiste): Der
// Strapi-Schalter showBookingButton stand am 02.10.2026 auf aus, ohne dass
// das als Wunsch belegt ist - Entscheidung liegt bei Benjamin.
const bookingButtonVisible = computed(
  () =>
    forceBothButtons.value ||
    (strapiMode.value && !!props.cta) ||
    props.showBookingButton,
);
const discountButtonVisible = computed(
  () => forceBothButtons.value || !!props.showGlobalDiscount,
);

// go.: Neukundenpreis (20 % Newsletter-Rabatt eingerechnet). Texte sind
// deutsch; andere Sprachen zeigen nichts.
const newCustomerOffer = useNewCustomerOffer(
  () => props.treatment,
  () => props.treatmentPathKey,
  () => props.templateV2,
);

// v2: "Neukunden " + "ab 239,99 €*" - der Betrag mit "ab" und "€*" bricht
// nicht um (iPhone SE: sonst stand "€*" allein in der zweiten Zeile).
const heroPriceParts = computed<[string, string]>(() => {
  const t = newCustomerOffer.value?.heroLine ?? "";
  const m = /(?:ab\s)?\d[\d.]*(?:,\d{2})?\s?€\*?(?:\s+pro\s+Zone\*?)?/.exec(t);
  if (!m) return [t, ""];
  return [t.slice(0, m.index), t.slice(m.index).replace(/\s/g, "\u00a0")];
});

// go.: Leiste einzeilig - "ab 119,99 €*" ohne "Neukunden" (Sternchen erklaert
// die Fussnote am Seitenende).
const stickyPriceLine = computed(() =>
  (newCustomerOffer.value?.heroLine ?? "").replace(/^Neukunden\s+/, ""),
);

// go.: EINE kurze Unterzeile (Strapi-Subline, sonst der Hero-Text).
const adsSubline = computed(
  () => (props.subline || props.text || "").trim() || null,
);

const { trackPhoneClick } = useGoogleAnalytics();
const phoneHref = computed(() => {
  const digits = (props.phoneNumber ?? "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
});

// Floating CTA logic
const heroCardRef = ref<HTMLElement | null>(null);
const isMounted = ref(false);
const showFloatingBanner = ref(false);

onMounted(() => {
  isMounted.value = true;

  if (!props.showFloatingCta) return;

  const handleScroll = () => {
    if (!heroCardRef.value) return;

    const rect = heroCardRef.value.getBoundingClientRect();
    const isHeroOutOfView = rect.bottom < 0;

    const scrollBottom = window.scrollY + window.innerHeight;
    const pageEnd = document.documentElement.scrollHeight - 80;
    const hasReachedPageEnd = scrollBottom >= pageEnd;

    showFloatingBanner.value = isHeroOutOfView && !hasReachedPageEnd;
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
  });
});

const hasMarquee = computed(
  () => (props.announcementText ?? "").trim().length > 0,
);

const marqueeItems = computed(() => {
  const raw = (props.announcementText ?? "").trim();
  if (!raw) return [];
  return raw
    .split(/\*{3}/g)
    .map((s) => s.trim())
    .filter(Boolean);
});

const marqueeTrackItems = computed(() => {
  const items = marqueeItems.value;
  if (!items.length) return [];

  const minChars = 180;
  const base: string[] = [];
  let chars = 0;
  let guard = 0;

  while (chars < minChars && guard < 50) {
    for (const it of items) {
      base.push(it);
      chars += it.length + 3;
      if (chars >= minChars) break;
    }
    guard++;
  }

  return [...base, ...base];
});

const marqueeDurationSeconds = computed(() => {
  const items = marqueeTrackItems.value;
  if (!items.length) return 0;
  const totalChars = Math.max(1, Math.round(items.join(" ").length / 2));
  const seconds = totalChars / 4;
  return Math.min(60, Math.max(16, Math.round(seconds)));
});

const hasCover = computed(() => !!props.cover && isMediaImage(props.cover));

// #78: dieselbe Quelle wie die Kontextzeile im Buchungsdialog
// (useSeitenBehandlung) — Seite und Dialog zeigen nie zwei Preise.
// go.: Steht der Neukundenpreis im Hero, ist er der Hauptpreis; die Preis-
// Pille mit dem regulaeren Preis entfaellt dann (er steht klein im Kasten).
const priceLabel = computed(() =>
  newCustomerOffer.value
    ? ""
    : treatmentPriceLabel(props.treatment, props.showPrice, t),
);

const discountLabel = computed(() => {
  const pct = globals.value?.ecommerce?.newsletterDiscountPercentage;
  return t("blocks.treatmentHero.discountCta", { pct });
});
</script>

<style scoped>
.hero-card {
  overflow: hidden;
}

.hero {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.hero__media {
  aspect-ratio: 5 / 3;
  /* Conversion-Audit #79: Bildhöhe auf Mobile/Tablet begrenzen, damit
     H1, Preis-CTA und Google-Badge im ersten Viewport bleiben. */
  max-height: min(38svh, 320px);
  flex: 1 1 50%;
  padding-top: var(--space-card-figure-pad);
  padding-left: var(--space-card-figure-pad);
  padding-right: var(--space-card-figure-pad);
  width: 100%;
}

.hero__media-image {
  position: relative;
  display: block;
  height: 100%;
}

.hero__media-image :deep(img) {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: var(--border-radius-card-figure);
}

.hero--has-marquee .hero__media-image :deep(img) {
  border-radius: var(--border-radius-200) var(--border-radius-200)
    var(--border-radius-card-figure) var(--border-radius-card-figure);
}

.hero__body {
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.hero__main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  gap: var(--space-500);
  padding: var(--space-card-pad);
  text-align: center;
}

.hero__title {
  max-width: 18ch;
  margin: 0;
}

.hero--has-reviews .hero__eyebrow + .hero__title {
  margin-top: 0;
}

.hero__title-prefix,
.hero__title-suffix {
  display: block;
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
}

.hero__title-prefix {
  margin-bottom: var(--space-400);
}

.hero__title-suffix {
  margin-top: var(--space-400);
}

.hero__eyebrow {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
  margin: 0;
}

.hero__subline {
  margin: 0;
}

.hero__text {
  max-width: 48ch;
  color: var(--color-text-light);
  margin: 0;
}

/* go.: EINE Unterzeile, EINE grosse Preiszeile (Benjamin, 30.09.2026). */
.hero__subline--ads {
  max-width: 100%;
  font-weight: var(--font-bold);
}

.hero__price {
  margin: 0;
  font-size: var(--font-xl, 1.5rem);
  line-height: 1.2;
  font-weight: var(--font-bold);
  color: #b91c1c;
}

/* go.: Der Hero fuellt den ersten Screen allein - darunter beginnt kein
   weiterer Abschnitt im ersten Viewport (Benjamin, 30.09.2026). */
.hero-card:has(.hero--ads-compact) {
  display: flex;
  flex-direction: column;
  min-height: calc(100svh - 110px);
}

.hero--ads-compact {
  flex: 1;
}

.hero--ads-compact .hero__title {
  hyphens: manual;
}

/* go.-Vorlage v2: Clip an der Stelle des Fotos. Er liegt im Fluss von
   .hero__media und nutzt dessen Innenabstaende (links = rechts). */
.hero--v2 .hero__media {
  position: relative;
  min-width: 0;
}

/* go.: Bild klein, alles Weitere im ersten Screen (375 x 667, #181). */
@media (max-width: 899px) {
  /* Das Bild nimmt den Platz, den Text und Knoepfe freilassen - sonst
     bleibt unter den Sternen eine leere Flaeche (Benjamin, 30.09.2026). */
  .hero--ads-compact .hero__media {
    aspect-ratio: auto;
    flex: 1 1 auto;
    min-height: min(18svh, 130px);
    max-height: none;
    display: flex;
    flex-direction: column;
  }

  .hero--ads-compact .hero__media-image {
    flex: 1 1 auto;
    height: auto;
  }

  .hero--ads-compact .hero__body {
    flex: 0 0 auto;
  }

  .hero--ads-compact .hero__main {
    justify-content: flex-start;
    gap: var(--space-300);
    padding-top: var(--space-500);
  }

  .hero--ads-compact .hero__title {
    font-size: 1.75rem;
    line-height: 1.15;
    max-width: none;
  }

  .hero--ads-long-title .hero__title {
    font-size: 1.5rem;
  }

  /* hoechstens zwei Zeilen, nicht mitten im Wort abgeschnitten */
  .hero--ads-compact .hero__subline--ads {
    font-size: 0.875rem;
    line-height: var(--line-sm);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }

  .hero--ads-compact .hero__reviews {
    margin-top: var(--space-100);
  }

  .hero--ads-buttons .hero__cta {
    flex-wrap: nowrap;
    width: 100%;
    gap: var(--space-200);
  }

  .hero--ads-buttons .hero__cta-price {
    display: contents;
  }

  .hero--ads-buttons .hero-cta-btn {
    flex: 1 1 0;
    min-width: 0;
    padding-inline: var(--space-300);
    white-space: nowrap;
  }

  /* 320er-Handys: "Termin buchen" + "20% Rabatt sichern" passen nicht
     nebeneinander (Text lief uebereinander) - untereinander, volle Breite. */
  @media (max-width: 359px) {
    .hero--ads-buttons .hero__cta {
      flex-direction: column;
    }

    .hero--ads-buttons .hero-cta-btn {
      flex: 0 0 auto;
      width: 100%;
    }
  }

  /* v2: "Kostenlose Beratung buchen" ist zu lang fuer zwei Knoepfe in
     einer Zeile - untereinander, volle Breite. */
  .hero--v2.hero--ads-buttons .hero__cta {
    flex-direction: column;
    flex-wrap: nowrap;
  }

  .hero--v2.hero--ads-buttons .hero-cta-btn {
    flex: 0 0 auto;
    width: 100%;
  }

  /* v2 auf 320er-Handys: H1 und Preis je eine Zeile kuerzer, damit die
     Sterne noch in den ersten Screen passen. */
  @media (max-width: 359px) {
    .hero--v2 .hero__title,
    .hero--v2.hero--ads-long-title .hero__title {
      font-size: 1.375rem;
    }

    .hero--v2 .hero__price {
      font-size: 1.1875rem;
    }

    .hero--v2 .hero__main {
      padding-top: var(--space-400);
    }
  }
}

.hero__nowrap {
  white-space: nowrap;
}

/* v2: Preis gross, der Rabatt-Zusatz kleiner in derselben Zeile; bricht
   nur nach dem Betrag um, nie im Betrag. */
.hero__price--v2 {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  column-gap: 0.35em;
}

.hero__price-extra {
  font-size: var(--font-md, 1rem);
  line-height: 1.3;
}

/* v2: kleine Vertrauenszeile unter dem Knopf */
.hero__v2-note {
  margin: calc(-1 * var(--space-100)) 0 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-400);
}

.hero__cta-price {
  display: contents;
}

.hero__cta-price--with-price {
  display: inline-flex;
  align-items: center;
  gap: var(--space-200);
  padding: var(--space-200);
  background: var(--color-black);
  border-radius: 999px;
  --button-primary-color-bg: var(--color-white);
  --button-primary-color-bg-hover: var(--color-gray-200);
  --button-primary-color-text: var(--color-black);
}

.theme-strong .hero__cta-price--with-price {
  background: var(--color-gray-800);
}

.hero__cta-price--with-price > strong {
  padding-inline: var(--space-300) var(--space-400);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-white);
}

.hero__reviews {
  margin-top: var(--space-500);
}

.hero__logos {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--space-600);
  row-gap: var(--space-400);
  margin-left: var(--space-card-pad);
  margin-right: var(--space-card-pad);
  padding-top: var(--space-card-pad);
  padding-bottom: var(--space-card-pad);
  padding-left: 0;
  padding-right: 0;
  color: var(--color-text-light);
  border-top: 1px solid var(--color-border-mute);
  list-style: none;
}

.hero__logo {
  display: flex;
  align-items: center;
}

.hero__logo :deep(svg) {
  display: block;
  height: auto;
}

/* Marquee */
.hero__marquee-wrapper {
  padding: var(--space-card-figure-pad) var(--space-card-figure-pad) 0
    var(--space-card-figure-pad);
}

.hero__marquee {
  padding-top: var(--space-300);
  padding-bottom: var(--space-300);
  background: linear-gradient(to right, #f6eef6, #fff5f1);
  border-radius: var(--border-radius-card-figure)
    var(--border-radius-card-figure) var(--border-radius-200)
    var(--border-radius-200);
  overflow: hidden;
}

.hero__marquee-viewport {
  min-width: 0;
  width: 100%;
  overflow: hidden;
}

.hero__marquee-track {
  display: inline-flex;
  align-items: center;
  gap: var(--space-300);
  flex-shrink: 0;
  width: max-content;
  line-height: 1;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-gray-900);
  white-space: nowrap;
  will-change: transform;
  animation: hero-marquee var(--marquee-duration, 20s) linear infinite;
}

.hero__marquee-item,
.hero__marquee-sep {
  flex: 0 0 auto;
}

.hero__marquee-sep {
  opacity: 0.6;
}

@keyframes hero-marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__marquee-track {
    animation: none;
    transform: none;
  }
  .hero__marquee-viewport {
    overflow-x: auto;
  }
}

@media (min-width: 900px) {
  .hero {
    flex-direction: row;
  }

  .hero__main {
    margin-top: var(--space-800);
  }

  .hero__media {
    order: 2;
    max-height: none;
    padding: var(--space-card-figure-pad) var(--space-card-figure-pad)
      var(--space-card-figure-pad) 0;
  }

  .hero__body {
    order: 1;
  }

  .hero__logos {
    gap: var(--space-800);
    row-gap: var(--space-600);
  }

  .hero__marquee {
    border-radius: var(--border-radius-card-figure)
      var(--border-radius-card-figure) var(--border-radius-200)
      var(--border-radius-200);
  }

  .hero--has-marquee .hero__media-image :deep(img) {
    border-radius: var(--border-radius-200) var(--border-radius-200)
      var(--border-radius-card-figure) var(--border-radius-card-figure);
  }
}

/* Floating CTA */
.floating-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: var(--color-white);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  padding: var(--space-400);
  backdrop-filter: blur(10px);
}

.theme-strong .floating-cta {
  background: var(--color-gray-900);
}

/* Ads Mode: Red booking button only.
   Scope to the booking button itself (floating-cta__button--ads-mode), NOT to
   every button/a inside .floating-cta__actions — the Google ReviewsBadge renders
   as an <a> when it links to Google Maps and was wrongly getting a red background. */
.floating-cta--ads-mode .floating-cta__button--ads-mode :deep(button),
.floating-cta--ads-mode .floating-cta__button--ads-mode :deep(a),
.floating-cta--ads-mode :deep(button.floating-cta__button--ads-mode),
.floating-cta--ads-mode :deep(a.floating-cta__button--ads-mode) {
  background-color: #dc2626 !important; /* red-600 */
  border-color: #dc2626 !important;
}

.floating-cta--ads-mode .floating-cta__button--ads-mode :deep(button:hover),
.floating-cta--ads-mode .floating-cta__button--ads-mode :deep(a:hover),
.floating-cta--ads-mode :deep(button.floating-cta__button--ads-mode:hover),
.floating-cta--ads-mode :deep(a.floating-cta__button--ads-mode:hover) {
  background-color: #b91c1c !important; /* red-700 */
  border-color: #b91c1c !important;
}

.floating-cta__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-400);
  max-width: 1400px;
  margin: 0 auto;
}

.floating-cta__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-100);
  min-width: 0;
  flex: 1;
}

.floating-cta__price {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
  color: var(--color-text);
}

.floating-cta__title {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Transition */
.floating-cta-enter-active,
.floating-cta-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.floating-cta-enter-from,
.floating-cta-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.floating-cta__actions {
  display: flex;
  align-items: center;
  gap: var(--space-400);
  flex-shrink: 0;
}

.floating-cta__reviews {
  display: none;
}

.floating-cta__price--offer {
  color: #b91c1c;
}

/* go.: Leiste einzeilig - Preis links, Telefon + "Termin buchen" rechts
   (#181, Benjamin 30.09.2026). */
.floating-cta__phone {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  background: var(--color-white);
}

@media (max-width: 767px) {
  .floating-cta--ads-mode {
    padding: var(--space-300) var(--space-400);
  }

  .floating-cta--ads-mode .floating-cta__content {
    gap: var(--space-300);
  }

  .floating-cta--ads-mode .floating-cta__price {
    font-size: var(--font-md);
    line-height: var(--line-md);
    white-space: nowrap;
  }

  .floating-cta--ads-mode .floating-cta__actions {
    gap: var(--space-200);
  }

  .floating-cta--ads-mode .floating-cta-btn {
    white-space: nowrap;
  }
}

/* v2: "Beratung buchen" ist laenger als "Termin buchen" - Preis kleiner,
   damit die Leiste einzeilig bleibt. */
@media (max-width: 767px) {
  .floating-cta--v2 .floating-cta__price {
    font-size: var(--font-sm);
    line-height: var(--line-sm);
  }

  .floating-cta--v2 .floating-cta__phone {
    width: 40px;
    height: 40px;
  }
}

/* v2 (Agentur-Feedback 01.10.2026): Telefon mit Beschriftung "Anrufen".
   Preis, "Anrufen" und "Kostenlose Beratung" passen erst ab 480 px in eine
   Zeile; darunter zeigt die Leiste nur die beiden Knoepfe (der Preis steht
   im Hero und in den Preisen), einzeilig bis 320 px. */
.floating-cta__phone--label {
  width: auto;
  gap: 6px;
  padding: 0 14px;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  white-space: nowrap;
  text-decoration: none;
}

@media (max-width: 767px) {
  .floating-cta--v2 .floating-cta__phone--label {
    width: auto;
    height: 44px;
  }
}

@media (max-width: 479px) {
  .floating-cta--v2 .floating-cta__text {
    display: none;
  }

  .floating-cta--v2 .floating-cta__content {
    justify-content: stretch;
  }

  .floating-cta--v2 .floating-cta__actions {
    flex: 1 1 auto;
    min-width: 0;
  }

  .floating-cta--v2 .floating-cta-btn {
    flex: 1 1 auto;
    min-width: 0;
  }

  .floating-cta--v2 .floating-cta-btn :deep(button),
  .floating-cta--v2 :deep(button.floating-cta-btn) {
    width: 100%;
    padding-inline: var(--space-300);
  }
}

@media (max-width: 359px) {
  .floating-cta--v2 .floating-cta__phone--label {
    padding: 0 10px;
  }

  .floating-cta--v2 .floating-cta-btn :deep(button),
  .floating-cta--v2 :deep(button.floating-cta-btn) {
    font-size: var(--font-sm);
    padding-inline: var(--space-200);
  }
}

@media (min-width: 768px) {
  .floating-cta {
    padding: var(--space-500) var(--space-600);
    border-radius: var(--border-radius-card) var(--border-radius-card) 0 0;
  }

  .floating-cta__content {
    gap: var(--space-600);
  }

  .floating-cta__text {
    flex-direction: row;
    align-items: center;
    gap: var(--space-400);
  }

  .floating-cta__title {
    white-space: normal;
  }
}

@media (min-width: 900px) {
  .floating-cta__reviews {
    display: flex;
  }
}
/* go.-Vorlage v2, Gestaltung "ci"/"ci-hell" (Feedback 02.10.2026): Preis
   schwarz, Rabatt-Zusatz grau; Knopf schwarz wie auf www. Rot bleibt nur
   der Buchungsknopf der mitlaufenden Leiste (#dc2626, weiss darauf 4,8:1). */
.hero--ci .hero__price {
  color: var(--color-text);
}

.hero--ci .hero__price-extra {
  color: var(--color-text-light);
  font-weight: var(--font-regular);
}

.floating-cta--ci .floating-cta__price--offer {
  color: var(--color-text);
}

/* go.-Vorlage v2, Desktop-Layout ab 1024 px (Feedback 02.10.2026): Text
   linksbuendig mit grossem Titel, Hero nicht mehr bildschirmhoch, damit
   darunter der naechste Abschnitt anschaut. Mobil unveraendert. */
@media (min-width: 1024px) {
  .hero-card:has(.hero--desk) {
    min-height: 0;
  }

  .hero--desk {
    min-height: min(620px, calc(100svh - 200px));
  }

  .hero--desk .hero__body {
    flex: 1 1 46%;
  }

  .hero--desk .hero__media {
    flex: 1 1 54%;
  }

  .hero--desk .hero__main {
    align-items: flex-start;
    justify-content: center;
    margin-top: 0;
    padding: var(--space-1000) var(--space-900);
    text-align: left;
  }

  .hero--desk .hero__title {
    max-width: 14ch;
    font-size: var(--font-5xl);
    line-height: var(--line-5xl);
  }

  .hero--desk .hero__subline--ads {
    max-width: 40ch;
    font-size: var(--font-lg);
    line-height: var(--line-lg);
  }

  .hero--desk .hero__price--v2 {
    justify-content: flex-start;
    font-size: var(--font-2xl);
  }

  .hero--desk .hero__cta {
    justify-content: flex-start;
  }

  .hero--desk .hero__reviews {
    margin-top: var(--space-300);
  }
}
/* Koelner CI-Seiten ("ci-preis", Michael 03.10.2026): Neukundenpreis fett
   und im kraeftigen Rot der Leiste (#dc2626, weiss: 4,8:1) */
.hero--preis .hero__price {
  font-weight: 700;
  color: #dc2626;
}

.floating-cta--preis .floating-cta__price--offer {
  color: #dc2626;
}
/* v2 (03.10.2026): Unterzeilen mit "Behandlung durch Aerzte" sind laenger -
   bis zu drei Zeilen statt zwei, damit nichts abgeschnitten wird; das Bild
   darueber gibt den Platz ab (flex). */
@media (max-width: 899px) {
  .hero--v2.hero--ads-compact .hero__subline--ads {
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }
}
</style>
