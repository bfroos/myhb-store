<template>
  <footer class="appFooter">
    <UiLayoutSectionBlock>
      <UiLayoutCardSurface>
        <div class="appFooter__inner">
          <aside class="appFooter__newsletter">
            <h2>{{ $t("newsletter.marketingText.headline") }}</h2>
            <UiMoleculeNewsletterSubscriptionForm />
          </aside>
          <div class="appFooter__content theme-soft">
            <div class="appFooter__brand">
              <ImageAppLogo width="100" />
            </div>
            <div class="appFooter__navs">
              <nav
                v-if="treatmentPageCategories.length > 0"
                aria-label="Behandlungen"
              >
                <h2 class="appFooter__navTitle">
                  {{ $t("navigation.footer.treatments") }}
                </h2>
                <ul>
                  <li
                    v-for="category in treatmentPageCategories"
                    :key="category.id"
                  >
                    <NuxtLinkLocale :to="`/behandlungen/${category.slug}`">
                      {{ category.name }}
                    </NuxtLinkLocale>
                  </li>
                </ul>
              </nav>
              <nav aria-label="Unternehmen">
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
                    <NuxtLinkLocale to="/aerzte">
                      {{ $t("navigation.secondary.doctors") }}
                    </NuxtLinkLocale>
                  </li>
                  <li>
                    <NuxtLinkLocale to="/standorte">
                      {{ $t("navigation.secondary.locations") }}
                    </NuxtLinkLocale>
                  </li>
                  <li>
                    <NuxtLinkLocale to="/preise">
                      {{ $t("navigation.secondary.prices") }}
                    </NuxtLinkLocale>
                  </li>
                  <li>
                    <NuxtLinkLocale to="/karriere">
                      {{ $t("navigation.secondary.careers") }}
                    </NuxtLinkLocale>
                  </li>
                  <li>
                    <NuxtLinkLocale to="/blog">
                      {{ $t("navigation.secondary.blog") }}
                    </NuxtLinkLocale>
                  </li>
                </ul>
              </nav>
              <nav v-if="productCategories.length > 0" aria-label="Preise">
                <h2 class="appFooter__navTitle">
                  {{ $t("navigation.footer.prices") }}
                </h2>
                <ul>
                  <li v-for="category in productCategories" :key="category.id">
                    <NuxtLinkLocale :to="`/preise#${category.slug}`">
                      {{ category.name }}
                    </NuxtLinkLocale>
                  </li>
                </ul>
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
              variant="tertiary"
              size="sm"
              href="https://www.facebook.com/myhealthbeautylounge"
              target="_blank"
              no-follow
            >
              <IconBrandFacebook />
            </UiAtomBaseButton>
          </li>
          <li>
            <UiAtomBaseButton
              as="a"
              icon-only
              variant="tertiary"
              size="sm"
              href="https://de.linkedin.com/company/my-health-beauty"
              target="_blank"
              no-follow
            >
              <IconBrandLinkedin />
            </UiAtomBaseButton>
          </li>
          <li>
            <UiAtomBaseButton
              as="a"
              icon-only
              variant="tertiary"
              size="sm"
              href="https://www.instagram.com/myhealthandbeauty.app/"
              target="_blank"
              no-follow
            >
              <IconBrandInstagram />
            </UiAtomBaseButton>
          </li>
          <li>
            <UiAtomBaseButton
              as="a"
              icon-only
              variant="tertiary"
              size="sm"
              href="https://www.tiktok.com/@myhealthandbeauty.com"
              target="_blank"
              no-follow
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
import type { TreatmentPageMenuItem } from "~/composables/useMenu";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
} from "@tabler/icons-vue";
const { treatmentPages, productCategories } = useMenu(
  "treatment-pages,product-categories",
);

const treatmentPageCategories = computed<TreatmentPageMenuItem[]>(() => {
  return treatmentPages.value.filter((item) => {
    return item.children && item.children.length > 0;
  });
});
</script>
<style scoped>
.appFooter a:not(.button) {
  display: inline-block;
  padding: var(--space-200) 0;
  text-decoration: none;
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
  gap: var(--space-400);
}

.appFooter__navTitle {
  font-size: var(--font-md);
  line-height: var(--line-md);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-300);
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
  padding: var(--space-400) var(--space-500);
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
