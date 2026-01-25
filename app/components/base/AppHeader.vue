<template>
  <header>
    <nav
      class="secondaryNav"
      role="navigation"
      aria-label="Sekundäre Navigation"
    >
      <ul role="list">
        <li>
          <UiAtomBaseButton as="nuxt-link-locale" variant="link" to="/aerzte">
            {{ $t("navigation.secondary.doctors") }}
          </UiAtomBaseButton>
        </li>
        <li>
          <UiAtomBaseButton
            as="nuxt-link-locale"
            variant="link"
            to="/standorte"
          >
            {{ $t("navigation.secondary.locations") }}
          </UiAtomBaseButton>
        </li>
        <li>
          <UiAtomBaseButton as="nuxt-link-locale" variant="link" to="/preise">
            {{ $t("navigation.secondary.prices") }}
          </UiAtomBaseButton>
        </li>
        <li>
          <UiMoleculeLanguageSwitcher />
        </li>
      </ul>
    </nav>
    <UiLayoutCardSurface style="--card-pad: 0">
      <nav class="mainNav" role="navigation" aria-label="Hauptnavigation">
        <div class="mainNav__mobileTrigger">
          <UiAtomBaseButton
            variant="quaternary"
            aria-label="Menü öffnen"
            aria-expanded="false"
          >
            <IconMenu2 :size="24" aria-hidden="true" />
          </UiAtomBaseButton>
        </div>
        <NuxtLinkLocale
          to="/"
          class="mainNav__brand"
          aria-label="Zur Startseite"
        >
          <ImageAppLogo />
        </NuxtLinkLocale>
        <ul
          v-if="navigationItems.length > 0"
          class="mainNav__menu"
          role="menubar"
        >
          <li
            v-for="parent in navigationItems"
            :key="parent.id"
            class="mainNav__menuItem"
            role="none"
          >
            <NuxtLinkLocale
              :to="`/behandlungen/${parent.slug}`"
              role="menuitem"
            >
              {{ parent.name }}
            </NuxtLinkLocale>
            <ul
              v-if="parent.children.length > 0"
              class="mainNav__submenu"
              role="menu"
            >
              <li v-for="child in parent.children" :key="child.id" role="none">
                <NuxtLinkLocale
                  :to="`/behandlungen/${parent.slug}/${child.slug}`"
                  role="menuitem"
                >
                  {{ child.name }}
                </NuxtLinkLocale>
              </li>
            </ul>
          </li>
        </ul>
        <SharedButton
          :button="{
            label: 'Termin buchen',
            method: SharedButtonMethod.ACTION,
            action: SharedButtonAction.APPOINTMENT_BOOKING,
          }"
        />
        <div class="mainNav__lang">
          <UiMoleculeLanguageSwitcher />
        </div>
      </nav>
    </UiLayoutCardSurface>
  </header>
</template>
<script setup lang="ts">
import { IconMenu2 } from "@tabler/icons-vue";
import { SharedButtonMethod, SharedButtonAction } from "~/lib/strapi/dto/enums";

const { locale } = useI18n();

// Type für Treatment Page Menu Item
type TreatmentPageMenuItem = {
  id: number;
  name: string;
  slug: string;
  pathKey: string;
  children: TreatmentPageMenuItem[];
};

type MenuResponse = {
  data: {
    "treatment-pages"?: TreatmentPageMenuItem[];
    "product-categories"?: any[];
  };
};

const { data: menuData } = await useStrapiFetch<MenuResponse>("/menu", {
  query: {
    locale: locale.value,
    types: "treatment-pages",
  },
  fetchOptions: {
    key: `menu:${locale.value}:treatment-pages`,
  },
});

const navigationItems = computed(
  () => menuData.value?.data?.["treatment-pages"] || [],
);
</script>
<style scoped>
header {
  padding: var(--space-400) var(--container-pad) 0;
}

.secondaryNav {
  display: none;
}

.secondaryNav a {
  text-decoration: none;
}

.secondaryNav > ul {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-400);
  margin: 0 0 var(--space-400);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.mainNav {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  padding: var(--space-400) var(--space-card-pad-xs);
}

.mainNav__brand {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.mainNav__brand > svg {
  height: 32px;
  max-height: 32px;
  width: auto;
  display: block;
}

.mainNav__menu {
  display: none;
  list-style: none;
  margin: 0;
  padding: 0;
}

.mainNav__menuItem {
  position: relative;
}

.mainNav__menuItem > a {
  display: block;
  padding: var(--space-400) var(--space-500);
  text-decoration: none;
  color: var(--color-text);
  transition: color 0.2s ease;
}

.mainNav__menuItem > a:hover {
  color: var(--color-text-light);
}

.mainNav__submenu {
  display: none;
  flex-direction: column;
  position: absolute;
  top: calc(100% + var(--space-200));
  left: 0;
  list-style: none;
  margin: 0;
  padding: var(--space-400);
  background: var(--color-card-bg-light);
  border-radius: var(--border-radius-card-sm);
  box-shadow: var(--shadow-4);
  min-width: 200px;
  z-index: 100;
  gap: var(--space-200);
}

.mainNav__submenu li {
  margin: 0;
  padding: 0;
  list-style: none;
}

.mainNav__submenu a {
  display: block;
  padding: var(--space-300) var(--space-400);
  border-radius: var(--border-radius-300);
  text-decoration: none;
  color: var(--color-text);
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.mainNav__submenu a:hover {
  background-color: var(--color-gray-100);
}

/* Zeige Submenu bei Hover auf MenuItem oder Submenu selbst */
.mainNav__menuItem:hover .mainNav__submenu,
.mainNav__submenu:hover {
  display: flex;
}

.mainNav__lang {
  text-align: right;
}

.mainNav__cta {
  display: none;
}

@media screen and (min-width: 900px) {
  .mainNav {
    padding: var(--space-card-pad-xs) var(--space-card-pad);
  }
}

@media screen and (min-width: 1400px) {
  .mainNav__menu {
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: stretch;
  }

  .mainNav__menuItem {
    position: relative;
  }

  .mainNav__submenu {
    margin-top: -10px;
  }

  .mainNav__mobileTrigger,
  .mainNav__lang {
    display: none;
  }

  .mainNav__brand {
    position: static;
    transform: none;
  }

  .mainNav__brand > svg {
    height: 40px;
    max-height: 40px;
  }

  .secondaryNav,
  .mainNav__cta {
    display: block;
  }
}
</style>
