<template>
  <header class="appHeader">
    <div class="appHeader__inner">
      <nav v-if="!isAdsMode" class="appHeader__secondaryNav appHeader__desktop">
        <ul>
          <li v-for="item in secondaryNavItems" :key="item.slug">
            <NuxtLinkLocale :to="`/${item.slug}`" class="text-link">
              {{ item.name }}
            </NuxtLinkLocale>
          </li>
          <li v-if="clubUrl">
            <a
              :href="clubUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-link"
            >
              {{ $t("navigation.secondary.myClub") }}
            </a>
          </li>
          <li>
            <UiMoleculeLanguageSwitcher />
          </li>
        </ul>
      </nav>
      <nav class="appHeader__mainNav">
        <div class="appHeader__mobile">
          <UiAtomBaseButton
            variant="quaternary"
            :aria-label="$t('cta.openMenu')"
            @click="openMobileMenu"
          >
            <IconMenu2 :size="24" aria-hidden="true" />
          </UiAtomBaseButton>
        </div>
        <NuxtLinkLocale
          v-if="!isAdsMode"
          to="/"
          class="appHeader__mainNav__brand"
          :aria-label="$t('cta.goToHome')"
        >
          <ImageAppLogo />
        </NuxtLinkLocale>
        <span v-else class="appHeader__mainNav__brand"><ImageAppLogo /></span>
        <!-- go.: Behandlungsmenue nur mit go.-internen Zielen (useAdsNav) -->
        <div
          v-if="!isAdsMode || priorityNavItems.length > 0"
          class="appHeader__desktop appHeader__mainNav__menu"
        >
          <div class="appHeader__priorityWrap">
            <BaseAppHeaderMainNav
              :links="priorityNavItems"
              :currentMainNavId="mainNavId"
              @showSubnav="showSubnav"
              @requestHideSubnav="requestHideSubnav"
              @cancelHideSubnav="cancelHideSubnav"
              @hideSubnav="hideSubnav"
            />
          </div>
          <BaseAppHeaderSubNav
            v-if="subnavItems && subnavItems.length > 0"
            :items="subnavItems"
            @requestHideSubnav="requestHideSubnav"
            @cancelHideSubnav="cancelHideSubnav"
            @hideSubnav="hideSubnav"
          />
        </div>
        <div v-if="!isAdsMode" class="appHeader__mobile appHeader__mobileEnd">
          <a
            v-if="kontoLink.enabled.value"
            :href="kontoLink.href('header')"
            class="appHeader__konto appHeader__konto--iconOnly"
            :aria-label="$t('navigation.header.myAccount')"
            :title="$t('navigation.header.myAccount')"
            @click="kontoLink.trackClick('header')"
          >
            <IconUserCircle :size="24" aria-hidden="true" />
          </a>
          <UiMoleculeLanguageSwitcher />
        </div>
        <div class="appHeader__desktop appHeader__actions">
          <a
            v-if="isAdsMode && adsPhone"
            :href="adsPhone.href"
            class="appHeader__phone text-link"
            @click="trackPhoneClick(adsPhone.label)"
          >
            <IconPhone :size="18" aria-hidden="true" />
            {{ adsPhone.label }}
          </a>
          <SharedButton
            :button="{
              label: t('cta.bookAppointment'),
              method: SharedButtonMethod.ACTION,
              action: SharedButtonAction.APPOINTMENT_BOOKING,
            }"
            ohne-seiten-kontext
          />
          <a
            v-if="kontoLink.enabled.value"
            :href="kontoLink.href('header')"
            class="appHeader__konto text-link"
            @click="kontoLink.trackClick('header')"
          >
            <IconUserCircle :size="20" aria-hidden="true" />
            {{ $t("navigation.header.myAccount") }}
          </a>
        </div>
      </nav>
    </div>
    <Teleport to="body">
      <BaseAppHeaderMobileNav
        v-if="isMobileMenuOpen"
        :items="mobileMenuItems"
        @close-mobile-menu="closeMobileMenu"
      />
    </Teleport>
  </header>
</template>
<script setup lang="ts">
import { IconMenu2, IconPhone, IconUserCircle } from "@tabler/icons-vue";
import { SharedButtonMethod, SharedButtonAction } from "~/lib/strapi/dto/enums";
const { t } = useI18n();
const { isAdsMode } = useSiteModeFlags();
const { treatmentPages: seoTreatmentPages } = useMenu("treatment-pages");
// go.: Menue aus dem Ads-Baum, Ziele nur auf go. (Standort der Seite, sonst
// Kategorie-Seiten und Uebersichten).
const { categories: adsCategories, overviewLinks: adsOverviewLinks } =
  await useAdsNav();
const treatmentPages = computed(() =>
  isAdsMode.value ? adsCategories.value : seoTreatmentPages.value,
);
const globals = useGlobals();
const clubUrl = computed(() => globals.value?.ecommerce?.clubUrl ?? null);

const isMobileMenuOpen = ref(false);
// #282: "Mein Konto" zur Kunden-App, hinter NUXT_PUBLIC_KONTO_LINK.
const kontoLink = useKontoLink();

const secondaryNavItems = computed(() => [
  {
    name: t("navigation.secondary.blog"),
    slug: "blog",
  },
  {
    name: t("navigation.secondary.doctors"),
    slug: "aerzte",
  },
  {
    name: t("navigation.secondary.locations"),
    slug: "standorte",
  },
  {
    name: t("navigation.secondary.prices"),
    slug: "preise",
  },
]);

const mainNavId = ref<number | null>(null);
let hideSubnavTimeout: ReturnType<typeof setTimeout> | null = null;

const currentMainNav = computed(() =>
  treatmentPages.value.find((page) => page.id === mainNavId.value),
);

const priorityNavItems = computed(() => [
  ...treatmentPages.value.map((page) => ({
    id: page.id,
    label: page.name,
    href:
      "href" in page && page.href
        ? page.href
        : treatmentPagePath(page.pathKey, page.slug),
  })),
  // go.: Uebersichten am Ende (ohne Untermenue).
  ...adsOverviewLinks.value.map((link, i) => ({
    id: -1 - i,
    label: link.name,
    href: `/${link.slug}`,
  })),
]);

// go. (#184): Standort der Seite fuer "Anrufen" und "Standort" im Menue.
const { seitenOrt } = useSeitenStandort();
const { trackPhoneClick } = useGoogleAnalytics();
const route = useRoute();
const adsPhone = computed(() => {
  const phone = seitenOrt.value?.phoneNumber;
  const digits = (phone ?? "").replace(/[^\d+]/g, "");
  return isAdsMode.value && phone && digits
    ? { label: phone, href: `tel:${digits}` }
    : null;
});
const adsLocationLink = computed(() => {
  const city = route.params.citySlug as string | undefined;
  const loc = route.params.locationSlug as string | undefined;
  if (!isAdsMode.value || !city || !loc || !seitenOrt.value) return null;
  return {
    label: seitenOrt.value.name ?? t("navigation.secondary.locations"),
    // Sprung zum Standort-Block (Adresse, Oeffnungszeiten) derselben Seite.
    to: `${route.path}#standort`,
  };
});

const mobileMenuItems = computed(() => {
  return {
    secondaryNavItems: isAdsMode.value
      ? adsOverviewLinks.value
      : secondaryNavItems.value,
    mainNavItems: treatmentPages.value,
    adsPhone: adsPhone.value,
    adsLocation: adsLocationLink.value,
    kontoHref: kontoLink.enabled.value ? kontoLink.href("header") : null,
  };
});

const subnavItems = computed(() =>
  (currentMainNav.value?.children ?? []).map((child) => ({
    id: child.id,
    label: child.name,
    // pathKey statt parent-slug + child-slug: der zusammengesetzte Pfad
    // stimmt nur bei genau zwei Ebenen.
    href:
      "href" in child && child.href
        ? child.href
        : treatmentPagePath(
            child.pathKey,
            currentMainNav.value?.slug,
            child.slug,
          ),
  })),
);

function showSubnav(id: number) {
  cancelHideSubnav();
  mainNavId.value = id;
}

function cancelHideSubnav() {
  if (hideSubnavTimeout != null) {
    clearTimeout(hideSubnavTimeout);
    hideSubnavTimeout = null;
  }
}

function requestHideSubnav() {
  cancelHideSubnav();
  hideSubnavTimeout = setTimeout(() => {
    hideSubnavTimeout = null;
    mainNavId.value = null;
  }, 180);
}

function hideSubnav() {
  cancelHideSubnav();
  mainNavId.value = null;
}

function openMobileMenu() {
  isMobileMenuOpen.value = true;
  document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = "";
}
</script>
<style scoped>
.appHeader {
  padding: var(--space-400) var(--container-pad) 0;
}
.appHeader__inner {
  position: relative;
  background: var(--color-card-bg-light);
  border-radius: var(--border-radius-card);
  box-shadow: var(--shadow-1);
}
.appHeader__actions {
  display: flex;
  align-items: center;
  gap: var(--space-500);
}
.appHeader__phone {
  margin-right: var(--space-500);
  display: inline-flex;
  align-items: center;
  gap: var(--space-200);
  font-weight: var(--font-bold);
  white-space: nowrap;
}
.appHeader__konto {
  display: inline-flex;
  align-items: center;
  gap: var(--space-200);
  margin-left: var(--space-500);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  white-space: nowrap;
  vertical-align: middle;
}
.appHeader__konto--iconOnly {
  margin-left: 0;
  padding: var(--space-200);
  color: inherit;
}
.appHeader__mobileEnd {
  display: flex;
  align-items: center;
  gap: var(--space-100);
}
.appHeader__secondaryNav {
  padding: var(--space-100) var(--space-card-pad);
  border-bottom: 1px solid var(--color-border-mute);
}
.appHeader__secondaryNav > ul {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-400);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}
.appHeader__mainNav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-400);
  padding: var(--space-400) var(--space-card-pad-sm);
}
.appHeader__mainNav__brand {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.appHeader__mainNav__brand > svg {
  height: 36px;
  max-height: 36px;
  width: auto;
  display: block;
}
.appHeader__desktop {
  display: none;
}

@media screen and (min-width: 900px) {
  .appHeader {
    padding: 0 var(--container-pad);
  }
  .appHeader__inner {
    border-radius: 0 0 var(--border-radius-card) var(--border-radius-card);
  }
  .appHeader__mainNav__brand {
    position: static;
    transform: none;
  }
  .appHeader__mobile {
    display: none;
  }
  .appHeader__desktop {
    display: block;
  }
  .appHeader__priorityWrap {
    position: relative;
    display: flex;
    flex: 1;
    min-width: 0;
  }
  .appHeader__mainNav__menu {
    position: relative;
    display: flex;
    flex: 1;
    justify-content: space-between;
    min-width: 0;
  }
}
</style>
