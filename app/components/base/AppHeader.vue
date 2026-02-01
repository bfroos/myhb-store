<template>
  <header class="appHeader">
    <div class="appHeader__inner">
      <nav class="appHeader__secondaryNav appHeader__desktop">
        <ul>
          <li v-for="item in secondaryNavItems" :key="item.slug">
            <NuxtLinkLocale :to="`/${item.slug}`" class="text-link">
              {{ item.name }}
            </NuxtLinkLocale>
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
            aria-label="Menü öffnen"
            @click="openMobileMenu"
          >
            <IconMenu2 :size="24" aria-hidden="true" />
          </UiAtomBaseButton>
        </div>
        <NuxtLinkLocale
          to="/"
          class="appHeader__mainNav__brand"
          aria-label="Zur Startseite"
        >
          <ImageAppLogo />
        </NuxtLinkLocale>
        <div class="appHeader__desktop appHeader__mainNav__menu">
          <div class="appHeader__priorityWrap">
            <BaseAppHeaderMainNav
              :links="priorityNavItems"
              :currentMainNavId="mainNavId"
              @showSubnav="showSubnav"
              @requestHideSubnav="requestHideSubnav"
              @cancelHideSubnav="cancelHideSubnav"
            />
          </div>
          <BaseAppHeaderSubNav
            v-if="subnavItems && subnavItems.length > 0"
            :items="subnavItems"
            @requestHideSubnav="requestHideSubnav"
            @cancelHideSubnav="cancelHideSubnav"
          />
        </div>
        <div class="appHeader__mobile">
          <UiMoleculeLanguageSwitcher />
        </div>
        <div class="appHeader__desktop">
          <SharedButton
            :button="{
              label: 'Termin buchen',
              method: SharedButtonMethod.ACTION,
              action: SharedButtonAction.APPOINTMENT_BOOKING,
            }"
          />
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
import { IconMenu2 } from "@tabler/icons-vue";
import { SharedButtonMethod, SharedButtonAction } from "~/lib/strapi/dto/enums";
const { t } = useI18n();
const { treatmentPages } = useMenu("treatment-pages,product-categories");

const isMobileMenuOpen = ref(false);

const secondaryNavItems = computed(() => [
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

const priorityNavItems = computed(() =>
  treatmentPages.value.map((page) => ({
    id: page.id,
    label: page.name,
    href: `/behandlungen/${page.slug}`,
  })),
);

const mobileMenuItems = computed(() => {
  return {
    secondaryNavItems: secondaryNavItems.value,
    mainNavItems: treatmentPages.value,
  };
});

const subnavItems = computed(() =>
  (currentMainNav.value?.children ?? []).map((child) => ({
    id: child.id,
    label: child.name,
    href: `/behandlungen/${currentMainNav.value?.slug}/${child.slug}`,
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
