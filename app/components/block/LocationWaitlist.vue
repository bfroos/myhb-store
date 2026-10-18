<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.SOFT }">
      <div id="vormerken" class="waitlist" data-location-waitlist>
        <h2>{{ tx("headline") }}</h2>
        <p>{{ tx(bookable ? "introBookable" : "intro") }}</p>
        <ul class="waitlist__benefits">
          <li>
            <IconRosetteDiscount size="26" stroke="1.25" aria-hidden="true" />
            <span>{{ tx("benefitDiscount") }}</span>
          </li>
          <li>
            <IconBellRinging size="26" stroke="1.25" aria-hidden="true" />
            <span>{{ tx("benefitNotify") }}</span>
          </li>
        </ul>

        <Message v-if="success" severity="success">{{ tx("success") }}</Message>
        <form v-else class="waitlist__form" @submit.prevent="handleSubmit">
          <Message v-if="error" severity="error">{{ error }}</Message>
          <Message v-if="suggestion" severity="warn">
            {{ tx("suggestionPrefix") }}
            <button
              type="button"
              class="waitlist__suggestion"
              @click="applySuggestion"
            >
              {{ suggestion }}</button>?
          </Message>
          <label for="waitlist-email" class="waitlist__label">
            {{ tx("emailLabel") }}
          </label>
          <div class="waitlist__controls">
            <InputText
              id="waitlist-email"
              v-model="email"
              type="email"
              autocomplete="email"
              :placeholder="tx('emailPlaceholder')"
              required
            />
            <UiAtomBaseButton type="submit" :disabled="loading">
              {{ tx("submit") }}
            </UiAtomBaseButton>
          </div>
          <p class="waitlist__consent">{{ tx("consent") }}</p>
        </form>

        <div v-if="nearest" class="waitlist__nearest" data-location-waitlist-nearest>
          <h3>{{ tx("nearestHeadline", { city: nearest.cityName }) }}</h3>
          <p>
            {{
              tx("nearestText", {
                location: nearest.name,
                km: nearest.km,
                address: nearest.address,
              })
            }}
          </p>
          <UiAtomBaseButton as="nuxt-link" :to="nearest.to" variant="secondary">
            {{ tx("nearestCta", { city: nearest.cityName }) }}
          </UiAtomBaseButton>
        </div>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
/**
 * Vormerken fuer einen Standort, der noch nicht eroeffnet hat (Saarbruecken,
 * Benjamin 16.10.2026). Erscheint auf jeder Standortseite, deren Status in
 * Strapi "coming soon" (kein Eroeffnungsdatum) oder "eroeffnet bald" (Datum
 * in der Zukunft) ist, und verschwindet mit dem Eroeffnungstag von selbst.
 *
 * Die Anmeldung geht in die Newsletter-Audience mit Tag
 * "warteliste:<stadt-slug>" und der Sprache (de/fr); ueber den Tag schreibt
 * Mailchimp zum Start genau diese Leute an. Darunter der naechste geoeffnete
 * Standort (Luftlinie aus den Strapi-Koordinaten, bis 150 km), damit niemand
 * bis zur Eroeffnung warten muss.
 *
 * Texte lokal wie in LocationSiblingHint: Standortseiten gibt es nur auf
 * Deutsch und - wo in Strapi "showFrenchPage" gesetzt ist - auf Franzoesisch.
 */
import { IconBellRinging, IconRosetteDiscount } from "@tabler/icons-vue";
import { ColorTheme } from "~/lib/strapi/dto/enums";
import type { LocationDto } from "~/lib/strapi/dto/collections";

const props = defineProps<{ location: LocationDto }>();

const TEXTS = {
  de: {
    headline: "Jetzt vormerken",
    intro:
      "Termine kannst du hier noch nicht buchen. Merk dich vor, dann sagen wir dir Bescheid, sobald es losgeht.",
    introBookable:
      "Merk dich vor, dann sagen wir dir Bescheid, sobald wir eröffnen.",
    benefitDiscount: "20 % Rabatt für Neukunden – dein Code kommt per E-Mail",
    benefitNotify: "Du erfährst zuerst, wann wir öffnen und ab wann du buchen kannst",
    emailLabel: "E-Mail-Adresse",
    emailPlaceholder: "Deine E-Mail-Adresse",
    submit: "20 % zur Eröffnung sichern",
    consent:
      "Mit der Anmeldung bekommst du unseren Newsletter und eine Nachricht, sobald der Standort öffnet. Abmeldung jederzeit.",
    success:
      "Danke, du bist vorgemerkt! Sobald wir öffnen, sagen wir dir Bescheid. Deinen Rabattcode bekommst du per E-Mail.",
    suggestionPrefix: "Meintest du",
    nearestHeadline: "Nicht warten? Wir sind schon in {city}.",
    nearestText:
      "Unser Standort {location} ist rund {km} km entfernt ({address}). Dort kannst du schon heute einen Termin buchen.",
    nearestCta: "Termin in {city}",
  },
  fr: {
    headline: "Inscrivez-vous dès maintenant",
    intro:
      "La prise de rendez-vous n'est pas encore ouverte. Inscrivez-vous et nous vous prévenons dès l'ouverture.",
    introBookable: "Inscrivez-vous et nous vous prévenons dès l'ouverture.",
    benefitDiscount:
      "20 % de réduction pour les nouveaux clients – votre code arrive par e-mail",
    benefitNotify:
      "Vous êtes informé(e) en premier de l'ouverture et des premiers rendez-vous",
    emailLabel: "Adresse e-mail",
    emailPlaceholder: "Votre adresse e-mail",
    submit: "Obtenir 20 % à l'ouverture",
    consent:
      "En vous inscrivant, vous recevez notre newsletter et un message dès l'ouverture. Désinscription possible à tout moment.",
    success:
      "Merci, vous êtes inscrit(e) ! Nous vous prévenons dès l'ouverture. Votre code de réduction arrive par e-mail.",
    suggestionPrefix: "Vouliez-vous dire",
    nearestHeadline: "Pas envie d'attendre ? Nous sommes déjà à {city}.",
    nearestText:
      "Notre adresse {location} se trouve à environ {km} km ({address}). Vous pouvez y prendre rendez-vous dès aujourd'hui (page de réservation en allemand).",
    nearestCta: "Rendez-vous à {city}",
  },
} as const;
type TextKey = keyof (typeof TEXTS)["de"];

const { locale } = useI18n();
const lang = computed<"de" | "fr">(() => (locale.value === "fr" ? "fr" : "de"));
function tx(key: TextKey, params: Record<string, string | number> = {}): string {
  return Object.entries(params).reduce(
    (text, [k, v]) => text.replaceAll(`{${k}}`, String(v)),
    TEXTS[lang.value][key] as string,
  );
}

const bookable = computed(() => props.location.isBookingAllowed !== false);

const {
  email,
  loading,
  success,
  error,
  suggestion,
  applySuggestion,
  submit,
} = useNewsletterSignup("vorregistrierung_standort", {
  language: () => lang.value,
  waitlist: () => props.location.city?.slug,
});

async function handleSubmit(event: Event) {
  const form = event.currentTarget as HTMLFormElement | null;
  if (form && !form.reportValidity()) return;
  await submit();
}

// Naechster geoeffneter, buchbarer Standort (Luftlinie).
type NearbyDto = Pick<
  LocationDto,
  "name" | "slug" | "newOpeningDate" | "isBookingAllowed" | "coordinates" | "address" | "city"
>;
const MAX_KM = 150;
const { data: nearby } = await useStrapiFetch<any>("/locations", {
  query: {
    locale: "de",
    fields: ["name", "slug", "newOpeningDate", "isBookingAllowed"],
    populate: {
      coordinates: { fields: ["lat", "long"] },
      address: { fields: ["street", "houseNumber", "postalCode", "city"] },
      city: { fields: ["name", "slug"] },
    },
    pagination: { page: 1, pageSize: 500 },
  },
  fetchOptions: { key: "locationWaitlist:nearby" },
});

function distanceKm(a: { lat: number; long: number }, b: { lat: number; long: number }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLong = rad(b.long - a.long);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLong / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const nearest = computed(() => {
  const here = props.location.coordinates;
  if (here?.lat == null || here?.long == null) return null;
  const candidates = ((nearby.value?.data ?? []) as NearbyDto[])
    .filter(
      (l) =>
        l.slug !== props.location.slug &&
        l.isBookingAllowed !== false &&
        getLocationStatus(l.newOpeningDate) !== "comingSoon" &&
        getLocationStatus(l.newOpeningDate) !== "openSoon" &&
        l.coordinates?.lat != null &&
        l.coordinates?.long != null &&
        l.city?.slug,
    )
    .map((l) => ({
      l,
      km: distanceKm(
        { lat: here.lat!, long: here.long! },
        { lat: l.coordinates!.lat!, long: l.coordinates!.long! },
      ),
    }))
    // Gleiche Koordinaten = Datenfehler in Strapi, kein echter Nachbar.
    .filter((c) => c.km > 1 && c.km <= MAX_KM)
    .sort((a, b) => a.km - b.km);
  const best = candidates[0];
  if (!best) return null;
  const a = best.l.address;
  return {
    name: best.l.name,
    cityName: best.l.city!.name,
    km: Math.round(best.km / 5) * 5,
    address: a ? `${a.street} ${a.houseNumber}, ${a.postalCode} ${a.city}` : best.l.city!.name,
    // Deutsche Seite: die anderen Standorte haben meist keine franzoesische.
    to: `/standorte/${best.l.city!.slug}/${best.l.slug}`,
  };
});
</script>

<style scoped>
.waitlist {
  padding: var(--space-500);
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  scroll-margin-top: 96px;
}
.waitlist h3 {
  font-size: 1.15rem;
  line-height: 1.3;
}
.waitlist h2,
.waitlist h3,
.waitlist p {
  margin: 0;
}
.waitlist__benefits {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.waitlist__benefits li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.waitlist__benefits svg {
  flex-shrink: 0;
}
.waitlist__form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.waitlist__label {
  font-size: 0.85rem;
  font-weight: 500;
}
.waitlist__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.waitlist__controls :deep(input) {
  flex: 1 1 240px;
}
.waitlist__consent {
  font-size: 0.75rem;
  opacity: 0.7;
}
.waitlist__suggestion {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
.waitlist__nearest {
  margin-top: 12px;
  padding-top: 16px;
  border-top: 1px solid currentColor;
  border-top-color: color-mix(in srgb, currentColor 15%, transparent);
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}
</style>
