<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="hero-card" ref="heroCardRef">
        <div v-if="hasMarquee" class="hero__marquee-wrapper">
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
          }"
        >
          <div v-if="hasCover" class="hero__media">
            <UiAtomMediaPicture
              class="hero__media-image"
              :media="cover!"
              :sources="{
                [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
              }"
              priority
            />
          </div>
          <div class="hero__body">
            <header class="hero__main">
              <p v-if="eyebrow" class="hero__eyebrow">{{ eyebrow }}</p>
              <h1 v-if="headline" class="hero__title">
                <span v-if="headlinePrefix" class="hero__title-prefix">
                  {{ headlinePrefix }}
                </span>
                {{ headline }}
                <span v-if="headlineSuffix" class="hero__title-suffix">
                  {{ headlineSuffix }}
                </span>
              </h1>
              <p v-if="subline" class="hero__subline">
                <strong>{{ subline }}</strong>
              </p>
              <p v-if="text" class="hero__text">{{ text }}</p>
              <div
                v-if="newCustomerOffer"
                class="hero__offer"
                :data-offer-kind="newCustomerOffer.kind"
              >
                <p class="hero__offer-headline">
                  {{ newCustomerOffer.headline }}
                </p>
                <p class="hero__offer-regular">{{ newCustomerOffer.regular }}</p>
                <p v-if="newCustomerOffer.calculation" class="hero__offer-calc">
                  {{ newCustomerOffer.calculation }}
                </p>
                <p class="hero__offer-footnote">
                  {{ newCustomerOffer.footnote }}
                </p>
              </div>
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
                  v-if="discountButtonVisible"
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
              </div>
              <p
                v-if="newCustomerOffer?.footnote2"
                class="hero__offer-footnote hero__offer-footnote--page"
              >
                {{ newCustomerOffer.footnote2 }}
              </p>
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
            <ul v-if="showCompanyLogos" class="hero__logos" role="list">
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
      <div v-show="showFloatingBanner" class="floating-cta" :class="{ 'floating-cta--ads-mode': isAdsMode }">
        <div class="floating-cta__content">
          <div class="floating-cta__text">
            <strong
              v-if="newCustomerOffer"
              class="floating-cta__price floating-cta__price--offer"
            >
              {{ newCustomerOffer.headline }}
            </strong>
            <strong v-else-if="priceLabel" class="floating-cta__price">
              {{ priceLabel }}
            </strong>
            <span v-if="headline || eyebrow" class="floating-cta__title">
              {{ headline || eyebrow }}
            </span>
          </div>
          <div class="floating-cta__actions">
            <template v-if="showReviews">
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
              :button="cta"
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
            <!-- go.: zweiter Knopf auch in der mitlaufenden Leiste -->
            <SharedButton
              v-if="isAdsMode && discountButtonVisible"
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
              :button-props="{ size: 'md', variant: 'secondary' }"
              class="floating-cta-btn floating-cta-btn--discount"
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
import { IconAsterisk } from "@tabler/icons-vue";
import { isMediaImage } from "~/utils/media";
import { buildNewCustomerOffer } from "#shared/newCustomerOffer";

const { isAdsMode } = useSiteModeFlags();

const props = withDefaults(
  defineProps<BlockTreatmentHeroDto & { showFloatingCta?: boolean }>(),
  {
    showFloatingCta: false,
    showBookingButton: true,
  },
);
const { t, locale } = useI18n();
const globals = useGlobals();

// go.: Benjamins Vorgabe (29.09.2026) - im Hero stehen immer beide Knoepfe:
// "Termin buchen" (primaer, oeffnet direkt die Buchung) und "20 % Rabatt
// sichern" (sekundaer, erst Newsletter, dann Buchung). Die Strapi-Schalter
// showBookingButton/showDiscount gelten dort nicht, auch nicht auf den
// "-rabatt"-Seiten, die bisher nur den Rabatt-Knopf hatten. Ohne `cta` (Standort
// nimmt keine Buchungen an) bleibt es beim Strapi-Stand. www unveraendert.
const forceBothButtons = computed(() => isAdsMode.value && !!props.cta);
const bookingButtonVisible = computed(
  () => forceBothButtons.value || props.showBookingButton,
);
const discountButtonVisible = computed(
  () => forceBothButtons.value || !!props.showGlobalDiscount,
);

// go.: Neukundenpreis (20 % Newsletter-Rabatt eingerechnet) neben dem
// regulaeren Preis. Texte sind deutsch; andere Sprachen zeigen nichts.
const newCustomerOffer = computed(() => {
  if (!isAdsMode.value) return null;
  if (!String(locale.value || "de").startsWith("de")) return null;
  const treatment = props.treatment;
  if (!treatment) return null;
  const twoZonePriceCent = (treatment.products ?? [])
    .flatMap((product) => product.variants ?? [])
    .find((variant) => variant.slug === "2-zonen" && variant.isActive !== false)
    ?.priceInEuroCent;
  return buildNewCustomerOffer({
    pathKey: props.treatmentPathKey,
    priceCent: treatment.priceInEuroCent || treatment.cheapestPriceInEuroCent,
    isStartingPrice: treatment.isStartingPrice,
    twoZonePriceCent,
    discountPct: globals.value?.ecommerce?.newsletterDiscountPercentage,
  });
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

.hero__offer {
  display: flex;
  flex-direction: column;
  gap: var(--space-100);
  max-width: 44ch;
  padding: var(--space-300) var(--space-400);
  background: linear-gradient(to right, #f6eef6, #fff5f1);
  border-radius: var(--border-radius-200);
  color: var(--color-gray-900);
}

.hero__offer p {
  margin: 0;
}

.hero__offer-headline {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
  color: #b91c1c;
}

.hero__offer-regular {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  font-weight: var(--font-bold);
}

.hero__offer-calc,
.hero__offer-footnote {
  font-size: var(--font-xs, 0.75rem);
  line-height: var(--line-xs, 1.35);
  color: var(--color-gray-700, #374151);
}

.hero__offer-footnote--page {
  max-width: 44ch;
  margin: 0;
}

/* go.: Preis und beide Knoepfe im ersten Screen (375 x 667, #181). */
@media (max-width: 899px) {
  .hero--ads-buttons .hero__media {
    max-height: min(20svh, 150px);
  }

  .hero--ads-buttons .hero__main {
    gap: var(--space-300);
    padding-top: var(--space-400);
  }

  .hero--ads-buttons .hero__eyebrow {
    font-size: var(--font-sm);
    line-height: var(--line-sm);
  }

  .hero--ads-buttons .hero__title {
    font-size: 1.75rem;
    line-height: 1.15;
    max-width: none;
  }

  .hero--ads-buttons .hero__subline {
    display: none;
  }

  .hero--ads-buttons .hero__text {
    font-size: var(--font-sm);
    line-height: var(--line-sm);
  }

  .hero--ads-offer .hero__offer {
    padding: var(--space-200) var(--space-300);
  }

  .hero--ads-offer .hero__offer-headline {
    font-size: var(--font-md);
    line-height: var(--line-md);
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

/* go.: Zwei Knoepfe passen auf dem Handy nur untereinander zum Text. */
@media (max-width: 767px) {
  .floating-cta--ads-mode .floating-cta__content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-200);
  }

  .floating-cta--ads-mode .floating-cta__actions {
    gap: var(--space-200);
  }

  .floating-cta--ads-mode .floating-cta-btn {
    flex: 1 1 0;
    min-width: 0;
    padding-inline: var(--space-300);
    white-space: nowrap;
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
</style>
