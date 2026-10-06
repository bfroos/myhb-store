<template>
  <UiLayoutSectionBlock v-if="items.length">
    <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.SOFT }">
      <div class="siblingHint" data-location-sibling-hint>
        <p v-for="item in items" :key="item.to" class="siblingHint__item">
          {{ item.text }}
          <NuxtLinkLocale :to="item.to" class="siblingHint__link">
            {{ item.linkLabel }}
          </NuxtLinkLocale>
        </p>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
/**
 * Hinweis auf den Geschwister-Standort derselben Stadt (Standort-
 * Konsolidierung, Ticket "Standortarchitektur Köln"):
 *   Köln Arcaden -> "Operative Schönheitsbehandlungen ... MediaPark Klinik"
 *                   (Link auf den MediaPark-Hub der Schönheitsoperationen)
 *   MediaPark    -> "Nichtoperative Behandlungen ... Köln Arcaden"
 *                   (Link auf die Arcaden-Standortseite)
 * Die Behandlungen selbst erscheinen NICHT als Kacheln am falschen Standort;
 * das hier ist nur ein Verweis. Daten: siblingLocations aus myhb-cms
 * (/locations/:city/:location/with-treatments).
 */
import { ColorTheme } from "~/lib/strapi/dto/enums";
import type { LocationSiblingHintDto } from "~/lib/strapi/dto/locationSiblings";

const props = defineProps<{
  cityName: string;
  siblings?: LocationSiblingHintDto[] | null;
}>();

// Texte lokal statt in i18n/locales: nur dieser Block nutzt sie. Englisch
// fuer /en, alle anderen Sprachen Deutsch (wie fallbackLocale "de").
const TEXTS = {
  de: {
    surgeryHint:
      "Operative Schönheitsbehandlungen und Haartransplantationen werden an unserem {city}er OP-Standort in der {location} angeboten.",
    surgeryLink: "Zu den Schönheitsoperationen in der {location}",
    nonSurgicalHint:
      "Nichtoperative Behandlungen wie Botox®, Hyaluron, Skinbooster, Infusionen und die Fettwegspritze bieten wir in {city} in unserer Lounge {location} an.",
    nonSurgicalLink: "Zu den Behandlungen in den {location}",
  },
  en: {
    surgeryHint:
      "Cosmetic surgery and hair transplants in {city} are offered at our surgical location, {location}.",
    surgeryLink: "Cosmetic surgery at {location}",
    nonSurgicalHint:
      "Non-surgical treatments such as Botox®, hyaluronic acid, skin boosters, infusions and fat-dissolving injections are offered in {city} at our lounge {location}.",
    nonSurgicalLink: "Treatments at {location}",
  },
} as const;
type TextKey = keyof (typeof TEXTS)["de"];

const { locale } = useI18n();
function t(key: TextKey, params: { city: string; location: string }): string {
  const texts = locale.value === "en" ? TEXTS.en : TEXTS.de;
  return texts[key]
    .replace("{city}", params.city)
    .replace("{location}", params.location);
}

const SURGICAL = new Set(["operational", "abulatory"]);

const items = computed(() =>
  (props.siblings ?? []).flatMap((sibling) => {
    const base = `/standorte/${sibling.citySlug}/${sibling.locationSlug}`;
    const params = { city: props.cityName, location: sibling.locationName };
    const isSurgical = sibling.treatmentTypes.some((type) => SURGICAL.has(type));
    if (isSurgical) {
      // Hub der Schönheitsoperationen am OP-Standort; ohne Hub die Standortseite.
      const hub = sibling.categoryPathKeys[0];
      return [
        {
          text: t("surgeryHint", params),
          linkLabel: t("surgeryLink", params),
          to: hub ? `${base}/${hub}` : base,
        },
      ];
    }
    return [
      {
        text: t("nonSurgicalHint", params),
        linkLabel: t("nonSurgicalLink", params),
        to: base,
      },
    ];
  }),
);
</script>
<style scoped>
.siblingHint {
  padding: var(--space-500);
  display: grid;
  gap: var(--space-300);
}
.siblingHint__item {
  margin: 0;
  max-width: 72ch;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}
.siblingHint__link {
  display: inline-block;
  margin-left: 0.25em;
  font-weight: 600;
  text-decoration: underline;
}
</style>
