<template>
  <!--
    Vorregistrierung Saarbruecken (Benjamin, 16.10.2026): Ziel der Werbung
    am Schaufenster der Europa Galerie. Buchen geht noch nicht; wer sich
    vormerkt, bekommt den Neukundenrabatt und eine Nachricht zum Start
    (Mailchimp-Tag "warteliste:saarbruecken", Sprache de/fr). Bis dahin der
    Hinweis auf Kaiserslautern. Deutsch und Franzoesisch, weil ein grosser
    Teil der Kundschaft aus Frankreich kommt; die Texte stehen hier statt in
    den sechs locale-JSONs, weil es die Seite nur in diesen zwei Sprachen gibt.
  -->
  <div class="vorreg">
    <nav class="vorreg__lang" :aria-label="c.langLabel">
      <NuxtLink
        v-for="l in LANGS"
        :key="l.code"
        :to="switchLocalePath(l.code)"
        :class="{ 'is-active': l.code === lang }"
        :hreflang="l.code"
      >
        {{ l.label }}
      </NuxtLink>
    </nav>

    <section class="vorreg__hero">
      <img
        class="vorreg__image"
        :src="HERO_IMAGE"
        alt=""
        width="1200"
        height="800"
        fetchpriority="high"
      />
      <div class="vorreg__card">
        <p class="vorreg__eyebrow">{{ c.eyebrow }}</p>
        <h1>{{ c.headline }}</h1>
        <p class="vorreg__address">
          <IconMapPin size="18" stroke="1.5" aria-hidden="true" />
          {{ c.address }}
        </p>
        <p class="vorreg__intro">{{ c.intro }}</p>

        <ul class="vorreg__benefits">
          <li>
            <IconRosetteDiscount size="26" stroke="1.25" aria-hidden="true" />
            <span>{{ c.benefitDiscount }}</span>
          </li>
          <li>
            <IconBellRinging size="26" stroke="1.25" aria-hidden="true" />
            <span>{{ c.benefitNotify }}</span>
          </li>
          <li>
            <IconStethoscope size="26" stroke="1.25" aria-hidden="true" />
            <span>{{ c.benefitDoctors }}</span>
          </li>
        </ul>

        <Message v-if="success" severity="success">{{ c.success }}</Message>
        <form v-else class="vorreg__form" @submit.prevent="handleSubmit">
          <Message v-if="error" severity="error">{{ error }}</Message>
          <Message v-if="suggestion" severity="warn">
            {{ c.suggestionPrefix }}
            <button
              type="button"
              class="vorreg__suggestion"
              @click="applySuggestion"
            >
              {{ suggestion }}</button>?
          </Message>
          <label for="vorreg-email" class="vorreg__label">{{ c.emailLabel }}</label>
          <InputText
            id="vorreg-email"
            v-model="email"
            type="email"
            autocomplete="email"
            :placeholder="c.emailPlaceholder"
            required
          />
          <UiAtomBaseButton type="submit" :disabled="loading">
            {{ c.submit }}
          </UiAtomBaseButton>
          <p class="vorreg__consent">{{ c.consent }}</p>
        </form>
      </div>
    </section>

    <section class="vorreg__kl" aria-labelledby="vorreg-kl-title">
      <h2 id="vorreg-kl-title">{{ c.klHeadline }}</h2>
      <p>{{ c.klText }}</p>
      <p class="vorreg__address">
        <IconMapPin size="18" stroke="1.5" aria-hidden="true" />
        {{ KL.address }}
      </p>
      <div class="vorreg__klActions">
        <UiAtomBaseButton as="nuxt-link" :to="KL.page" variant="secondary">
          {{ c.klCta }}
        </UiAtomBaseButton>
        <a :href="KL.maps" target="_blank" rel="noopener" class="vorreg__route">
          {{ c.klRoute }}
        </a>
      </div>
      <p v-if="c.klNote" class="vorreg__note">{{ c.klNote }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  IconBellRinging,
  IconMapPin,
  IconRosetteDiscount,
  IconStethoscope,
} from "@tabler/icons-vue";

definePageMeta({ layout: "landing" });

type Lang = "de" | "fr";

const LANGS: ReadonlyArray<{ code: Lang; label: string }> = [
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
];

const HERO_IMAGE =
  "https://media.myhealthandbeauty.app/cdn-cgi/image/width=1200,height=800,fit=cover,quality=80,format=auto/2026_MYHB_Tag3_34_ebf7060f7d.webp";

// Standortdaten aus Strapi (location k-in-lautern, Stand 16.10.2026).
const KL = {
  address: "Fackelrondell 1, 67655 Kaiserslautern",
  page: "/standorte/kaiserslautern/k-in-lautern",
  maps: "https://www.google.com/maps/search/?api=1&query=MY+K+in+Lautern&query_place_id=ChIJf4C6OSkTlkcRpTMm00E5JLE",
};

const TEXT = {
  de: {
    langLabel: "Sprache",
    eyebrow: "Bald in Saarbrücken",
    headline: "MYHB eröffnet in der Europa Galerie",
    address: "Trierer Straße 1, 66111 Saarbrücken",
    intro:
      "Termine kannst du hier noch nicht buchen – vormerken kannst du dich aber schon jetzt.",
    benefitDiscount: "20 % Rabatt für Neukunden – dein Code kommt per E-Mail",
    benefitNotify: "Du erfährst zuerst, wann wir öffnen und ab wann du buchen kannst",
    benefitDoctors: "Behandlung durch Ärzte: Botox, Hyaluron, Skinbooster und mehr",
    emailLabel: "E-Mail-Adresse",
    emailPlaceholder: "Deine E-Mail-Adresse",
    submit: "Vormerken & 20 % sichern",
    consent:
      "Mit der Anmeldung bekommst du unseren Newsletter und eine Nachricht, sobald Saarbrücken öffnet. Abmeldung jederzeit.",
    success:
      "Danke, du bist vorgemerkt! Sobald wir in Saarbrücken öffnen, sagen wir dir Bescheid. Deinen Rabattcode bekommst du per E-Mail.",
    suggestionPrefix: "Meintest du",
    klHeadline: "Nicht warten? Wir sind schon in Kaiserslautern.",
    klText:
      "Unsere Lounge MY K in Lautern ist rund eine Stunde von Saarbrücken entfernt (A6). Dort kannst du schon heute einen Termin buchen.",
    klCta: "Termin in Kaiserslautern",
    klRoute: "Route planen",
    klNote: "",
  },
  fr: {
    langLabel: "Langue",
    eyebrow: "Bientôt à Sarrebruck",
    headline: "MYHB ouvre à l'Europa Galerie",
    address: "Trierer Straße 1, 66111 Sarrebruck",
    intro:
      "La prise de rendez-vous n'est pas encore ouverte – mais vous pouvez déjà vous inscrire.",
    benefitDiscount:
      "20 % de réduction pour les nouveaux clients – votre code arrive par e-mail",
    benefitNotify:
      "Vous êtes informé(e) en premier de l'ouverture et des premiers rendez-vous",
    benefitDoctors:
      "Soins réalisés par des médecins : botox, acide hyaluronique, skinbooster et plus",
    emailLabel: "Adresse e-mail",
    emailPlaceholder: "Votre adresse e-mail",
    submit: "M'inscrire & obtenir 20 %",
    consent:
      "En vous inscrivant, vous recevez notre newsletter et un message dès l'ouverture à Sarrebruck. Désinscription possible à tout moment.",
    success:
      "Merci, vous êtes inscrit(e) ! Nous vous prévenons dès l'ouverture à Sarrebruck. Votre code de réduction arrive par e-mail.",
    suggestionPrefix: "Vouliez-vous dire",
    klHeadline: "Pas envie d'attendre ? Nous sommes déjà à Kaiserslautern.",
    klText:
      "Notre lounge MY K in Lautern se trouve à environ une heure de Sarrebruck (A6). Vous pouvez y prendre rendez-vous dès aujourd'hui.",
    klCta: "Rendez-vous à Kaiserslautern",
    klRoute: "Itinéraire",
    klNote: "La page de réservation est en allemand.",
  },
} as const;

const { locale } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const lang = computed<Lang>(() => (locale.value === "fr" ? "fr" : "de"));
const c = computed(() => TEXT[lang.value]);

const {
  email,
  loading,
  success,
  error,
  suggestion,
  applySuggestion,
  submit,
} = useNewsletterSignup("vorregistrierung_saarbruecken", {
  language: () => lang.value,
});

async function handleSubmit(event: Event) {
  const form = event.currentTarget as HTMLFormElement | null;
  if (form && !form.reportValidity()) return;
  await submit();
}

// Tracking: eigene Seitenkennung im dataLayer (wie /aktion).
const TEMPLATE = "vorregistrierung-saarbruecken";
if (import.meta.client) {
  ((window as any).dataLayer = (window as any).dataLayer || []).push({
    template: TEMPLATE,
  });
}

const title = computed(() =>
  lang.value === "fr"
    ? "MYHB arrive à Sarrebruck – inscrivez-vous | MY HEALTH & BEAUTY"
    : "MYHB kommt nach Saarbrücken – jetzt vormerken | MY HEALTH & BEAUTY",
);
const description = computed(() => `${c.value.intro} ${c.value.benefitDiscount}.`);
const shareImage =
  "https://media.myhealthandbeauty.app/cdn-cgi/image/width=1200,height=630,fit=cover,quality=85,format=jpeg/2026_MYHB_Tag3_34_ebf7060f7d.webp";

useHead({
  htmlAttrs: { lang: () => lang.value },
  title,
  meta: [{ name: "robots", content: "noindex, follow" }],
});
useSeoMeta({
  description,
  ogType: "website",
  ogTitle: title,
  ogDescription: description,
  ogImage: shareImage,
  twitterCard: "summary_large_image",
  twitterImage: shareImage,
});
</script>

<style scoped>
.vorreg {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.vorreg__lang {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  font-size: 0.9rem;
}
.vorreg__lang a {
  color: inherit;
  opacity: 0.6;
  text-decoration: none;
  padding: 4px 2px;
}
.vorreg__lang a.is-active {
  opacity: 1;
  font-weight: 600;
  border-bottom: 2px solid currentColor;
}

.vorreg__hero {
  display: grid;
  gap: 24px;
  align-items: center;
}
/* Am Handy (QR-Code am Schaufenster) zuerst Text und Formular, das Bild
   danach, damit der Knopf ohne langes Scrollen erreichbar ist. */
.vorreg__card {
  order: -1;
}
@media (min-width: 900px) {
  .vorreg__hero {
    grid-template-columns: 1fr 1fr;
  }
  .vorreg__card {
    order: 0;
  }
}

.vorreg__image {
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  border-radius: 16px;
}

.vorreg__card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.vorreg__card h1 {
  margin: 0;
  font-size: clamp(1.7rem, 4.5vw, 2.4rem);
  line-height: 1.15;
}

.vorreg__eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.7;
}

.vorreg__address {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.vorreg__intro {
  margin: 0;
}

.vorreg__benefits {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.vorreg__benefits li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.vorreg__benefits svg {
  flex-shrink: 0;
}

.vorreg__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.vorreg__label {
  font-size: 0.85rem;
  font-weight: 500;
}
.vorreg__form :deep(input) {
  width: 100%;
}
.vorreg__consent {
  margin: 0;
  font-size: 0.75rem;
  opacity: 0.7;
}
.vorreg__suggestion {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.vorreg__kl {
  border-radius: 16px;
  padding: 24px;
  background: var(--color-surface-muted, #f4efe9);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.vorreg__kl h2 {
  margin: 0;
  font-size: 1.3rem;
}
.vorreg__kl p {
  margin: 0;
}
.vorreg__klActions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-top: 6px;
}
.vorreg__route {
  color: inherit;
}
.vorreg__note {
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
