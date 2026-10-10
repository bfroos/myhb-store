<template>
  <footer class="appFooter">
    <!-- go.-Vorlage v2 (Vorschau): Minimal-Footer ohne Querlinks -->
    <UiLayoutSectionBlock v-if="!isAdsTemplateV2">
      <UiLayoutCardSurface>
        <div class="appFooter__inner">
          <aside class="appFooter__newsletter">
            <h2>{{ $t("newsletter.marketingText.headline") }}</h2>
            <UiMoleculeNewsletterSubscriptionForm />
          </aside>
          <div class="appFooter__content theme-soft">
            <div class="appFooter__brand">
              <ImageAppLogo width="140" />
            </div>
            <div class="appFooter__navs">
              <!-- go.: Behandlungen nur mit go.-internen Zielen (useAdsNav) -->
              <nav
                v-if="isAdsMode && adsCategories.length > 0"
                :aria-label="$t('navigation.footer.treatments')"
              >
                <h2 class="appFooter__navTitle">
                  {{ $t("navigation.footer.treatments") }}
                </h2>
                <ul>
                  <li v-for="category in adsCategories" :key="category.id">
                    <NuxtLinkLocale :to="category.href">
                      {{ category.name }}
                    </NuxtLinkLocale>
                  </li>
                </ul>
              </nav>
              <nav
                v-if="isAdsMode && adsOverviewLinks.length > 0"
                :aria-label="$t('navigation.footer.company')"
              >
                <h2 class="appFooter__navTitle">
                  {{ $t("navigation.footer.company") }}
                </h2>
                <ul>
                  <li v-for="link in adsOverviewLinks" :key="link.slug">
                    <NuxtLinkLocale :to="`/${link.slug}`">
                      {{ link.name }}
                    </NuxtLinkLocale>
                  </li>
                </ul>
              </nav>
              <nav
                v-if="!isAdsMode && treatmentPages.length > 0"
                :aria-label="$t('navigation.footer.treatments')"
              >
                <h2 class="appFooter__navTitle">
                  {{ $t("navigation.footer.treatments") }}
                </h2>
                <ul>
                  <li v-for="category in treatmentPages" :key="category.id">
                    <NuxtLinkLocale :to="`/behandlungen/${category.slug}`">
                      {{ category.name }}
                    </NuxtLinkLocale>
                  </li>
                </ul>
              </nav>
              <nav
                v-if="!isAdsMode"
                :aria-label="$t('navigation.footer.company')"
              >
                <h2 class="appFooter__navTitle">
                  {{ $t("navigation.footer.company") }}
                </h2>
                <ul>
                  <li>
                    <NuxtLinkLocale to="/ueber-uns">
                      {{ $t("navigation.secondary.aboutUs") }}
                    </NuxtLinkLocale>
                  </li>
                  <li>
                    <NuxtLinkLocale to="/standorte">
                      {{ $t("navigation.secondary.locations") }}
                    </NuxtLinkLocale>
                  </li>
                  <li>
                    <NuxtLinkLocale to="/karriere">
                      {{ $t("navigation.secondary.careers") }}
                    </NuxtLinkLocale>
                  </li>
                  <li>
                    <NuxtLinkLocale to="/aerzte">
                      {{ $t("navigation.secondary.doctors") }}
                    </NuxtLinkLocale>
                  </li>
                  <li>
                    <NuxtLinkLocale to="/blog">
                      {{ $t("navigation.secondary.blog") }}
                    </NuxtLinkLocale>
                  </li>
                  <li v-if="clubUrl">
                    <a
                      :href="clubUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ $t("navigation.secondary.myClub") }}
                    </a>
                  </li>
                  <li v-if="kontoLink.enabled.value">
                    <a
                      :href="kontoLink.href('footer')"
                      @click="kontoLink.trackClick('footer')"
                    >
                      {{ $t("navigation.footer.myAccount") }}
                    </a>
                  </li>
                  <li v-if="locale === 'de'">
                    <NuxtLinkLocale to="/p/kunden-erfahrungen">
                      Kunden Erfahrungen
                    </NuxtLinkLocale>
                  </li>
                </ul>
              </nav>
              <nav
                v-if="!isAdsMode && productCategories.length > 0"
                :aria-label="$t('navigation.footer.prices')"
              >
                <h2 class="appFooter__navTitle">
                  {{ $t("navigation.footer.prices") }}
                </h2>
                <ul>
                  <li v-for="category in productCategories" :key="category.id">
                    <NuxtLinkLocale :to="priceCategoryLink(category)">
                      {{ category.name }}
                    </NuxtLinkLocale>
                  </li>
                </ul>
              </nav>
              <nav
                v-if="!isAdsMode"
                class="appFooter__preferredSourceNav"
                :aria-label="$t('navigation.footer.preferredSourceTitle')"
              >
                <a
                  class="appFooter__preferredSource"
                  href="https://www.google.com/preferences/source?q=myhealthandbeauty.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 48 48" width="32" height="32" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{{ $t("navigation.footer.preferredSource") }}</span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </UiLayoutCardSurface>
    </UiLayoutSectionBlock>
    <div class="appFooter__outer">
      <nav class="appFooter__legal">
        <ul>
          <li>
            <NuxtLinkLocale to="/p/impressum">
              {{ $t("navigation.meta.imprint") }}
            </NuxtLinkLocale>
          </li>
          <li>
            <NuxtLinkLocale to="/p/datenschutz">
              {{ $t("navigation.meta.privacyPolicy") }}
            </NuxtLinkLocale>
          </li>
          <li>
            <NuxtLinkLocale to="/p/agb">
              {{ $t("navigation.meta.terms") }}
            </NuxtLinkLocale>
          </li>
          <li>
            <UiAtomBaseButton
              type="button"
              variant="text"
              @click="openCookieSettings"
            >
              {{ $t("navigation.meta.cookieSettings") }}
            </UiAtomBaseButton>
          </li>
        </ul>
      </nav>
      <ul class="appFooter__paymentTypes">
        <li>
          <ImagePaymentTypesPaymentCash />
        </li>
        <li>
          <ImagePaymentTypesPaymentVisa />
        </li>
        <li>
          <ImagePaymentTypesPaymentAmex />
        </li>
        <li>
          <ImagePaymentTypesPaymentApplePay />
        </li>
        <li>
          <ImagePaymentTypesPaymentMastercard />
        </li>
        <li>
          <ImagePaymentTypesPaymentGooglePay />
        </li>
        <li>
          <ImagePaymentTypesPaymentKlarna />
        </li>
        <li>
          <ImagePaymentTypesPaymentMaestro />
        </li>
        <li>
          <ImagePaymentTypesPaymentPaypal />
        </li>
      </ul>
      <nav class="appFooter__socialNetworks theme-soft">
        <ul>
          <li>
            <UiAtomBaseButton
              as="a"
              icon-only
              variant="quaternary"
              href="https://www.facebook.com/myhealthbeautylounge"
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="Facebook"
            >
              <IconBrandFacebook />
            </UiAtomBaseButton>
          </li>
          <li>
            <UiAtomBaseButton
              as="a"
              icon-only
              variant="quaternary"
              href="https://de.linkedin.com/company/my-health-beauty"
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="Linkedin"
            >
              <IconBrandLinkedin />
            </UiAtomBaseButton>
          </li>
          <li>
            <UiAtomBaseButton
              as="a"
              icon-only
              variant="quaternary"
              href="https://www.instagram.com/myhealthandbeauty.app/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="Instagram"
            >
              <IconBrandInstagram />
            </UiAtomBaseButton>
          </li>
          <li>
            <UiAtomBaseButton
              as="a"
              icon-only
              variant="quaternary"
              href="https://www.tiktok.com/@myhealthandbeauty.com"
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="Tiktok"
            >
              <IconBrandTiktok />
            </UiAtomBaseButton>
          </li>
        </ul>
      </nav>
    </div>
  </footer>
</template>
<script setup lang="ts">
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
} from "@tabler/icons-vue";

const { isAdsMode } = useSiteModeFlags();
const isAdsTemplateV2 = useAdsTemplateV2();
const { locale } = useI18n();
const { treatmentPages, productCategories } = useMenu(() =>
  isAdsMode.value ? "treatment-pages" : "treatment-pages,product-categories",
);
const { categories: adsCategories, overviewLinks: adsOverviewLinks } =
  await useAdsNav();
const { openCookieSettings } = useCookiebot();
const globals = useGlobals();
const clubUrl = computed(() => globals.value?.ecommerce?.clubUrl ?? null);
// #282: "Mein Konto" zur Kunden-App, hinter NUXT_PUBLIC_KONTO_LINK.
const kontoLink = useKontoLink();

// Overrides for specific price categories that should link to a dedicated
// page instead of the default /preise#<slug> anchor.
const PRICE_LINK_OVERRIDES: Record<string, string> = {
  botox: "/p/botox-kosten",
  skinbooster: "/p/skinbooster-preise",
  "hyaluron-und-filler": "/p/hyaluron-spritzen-kosten",
};

function priceCategoryLink(category: { slug: string }) {
  return PRICE_LINK_OVERRIDES[category.slug] ?? `/preise#${category.slug}`;
}
</script>
<style scoped>
.appFooter a:not(.button) {
  display: inline-block;
  padding: var(--space-200) 0;
  text-decoration: none;
}

.appFooter a:not(.button):hover {
  text-decoration: underline;
}

.appFooter__inner {
  overflow: hidden;
  border-radius: var(--border-radius-card);
}

.appFooter__newsletter {
  padding: var(--space-card-pad);
  background: var(--color-card-bg-strong);
  color: var(--color-white);
}

.appFooter__newsletter > h2 {
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-400);
}

.appFooter__content {
  display: flex;
  flex-direction: column;
}

.appFooter__brand {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-card-pad);
  border-bottom: 1px solid var(--color-border-mute);
}

.appFooter__navs {
  padding: var(--space-card-pad);
  display: flex;
  flex-direction: column;
  gap: var(--space-600);
}

.appFooter__navTitle {
  font-size: var(--font-md);
  line-height: var(--line-md);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-300);
}

.appFooter__preferredSourceNav {
  display: flex;
  align-items: center;
  justify-content: center;
}

.appFooter a.appFooter__preferredSource {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-300);
  padding: var(--space-500);
  max-width: 24ch;
  text-align: center;
  font-weight: var(--font-bold);
  background: var(--color-white);
  border: 1px solid var(--color-border-mute);
  border-radius: var(--border-radius-card);
  transition: box-shadow 0.2s;
}

.appFooter a.appFooter__preferredSource:hover {
  text-decoration: none;
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.08);
}

.appFooter__outer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-600);
  padding: 0 var(--container-pad);
  margin: var(--space-900) 0;
}

.appFooter__socialNetworks {
  display: inline-block;
  padding: var(--space-200);
  border-radius: 999px;
}

.appFooter__legal ul,
.appFooter__socialNetworks ul,
.appFooter__paymentTypes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-400);
  row-gap: var(--space-300);
}

@media screen and (min-width: 900px) {
  .appFooter__content {
    display: grid;
    grid-template-columns: 1fr 4fr;
  }
  .appFooter__brand {
    border-bottom: none;
    border-right: 1px solid var(--color-border-mute);
  }
  .appFooter__navs {
    flex-direction: row;
  }
  .appFooter__navs > nav {
    flex: 0 1 20ch;
    max-width: 33%;
  }
  .appFooter__navs > nav.appFooter__preferredSourceNav {
    flex: 1 1 auto;
  }
  .appFooter__newsletter {
    display: grid;
    gap: var(--space-900);
    grid-template-columns: 2fr 4fr;
  }
  .appFooter__newsletter > h2 {
    font-size: var(--font-2xl);
    line-height: var(--line-2xl);
  }
  .appFooter__outer {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
