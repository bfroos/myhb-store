<template>
  <UiLayoutSectionBlock spacing="sibling">
    <div class="kontakt theme-light">
      <h1 class="kontakt__titel">Hilfe &amp; Kontakt</h1>
      <p class="kontakt__intro">
        Du hast eine Frage zu deinem Termin, zu einer Behandlung oder zu deiner Rechnung, oder
        etwas ist nicht so gelaufen, wie es sollte? Schreib uns, wir kümmern uns darum.
      </p>

      <div class="kontakt__wege">
        <a
          class="kontakt__weg"
          :href="WHATSAPP_URL"
          target="_blank"
          rel="noopener"
          @click="geklickt('whatsapp')"
        >
          <IconBrandWhatsapp size="28" aria-hidden="true" />
          <span class="kontakt__wegTitel">WhatsApp</span>
          <span class="kontakt__wegText">Am schnellsten, auch abends und am Wochenende.</span>
        </a>
        <a
          class="kontakt__weg"
          :href="`mailto:${SUPPORT_EMAIL}`"
          @click="geklickt('email')"
        >
          <IconMail size="28" aria-hidden="true" />
          <span class="kontakt__wegTitel">{{ SUPPORT_EMAIL }}</span>
          <span class="kontakt__wegText">
            Für alles, was länger ist oder Fotos braucht. Nenn uns bitte deinen Namen und deinen
            Standort.
          </span>
        </a>
      </div>

      <div class="kontakt__mehr">
        <h2>Termin buchen, verschieben oder absagen</h2>
        <p>
          Neue Termine buchst du direkt online. Zum Verschieben oder Absagen nutz den Link aus
          deiner Terminbestätigung oder schreib uns per WhatsApp.
        </p>
        <p><NuxtLinkLocale to="/standorte">Standort wählen und Termin buchen</NuxtLinkLocale></p>
      </div>

      <p class="kontakt__partner">
        Lieferanten, Geschäftspartner und Presse erreichen uns unter
        <a :href="`mailto:${INFO_EMAIL}`">{{ INFO_EMAIL }}</a>.
      </p>
    </div>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
/**
 * Hilfe & Kontakt (Benjamin, 25.11.2026): Kunden schreiben an support@
 * (landet in Superchat), nicht an info@. info@ bleibt für Lieferanten,
 * Handwerker und Partner und wird bewusst nicht umgeleitet.
 */
import { IconBrandWhatsapp, IconMail } from "@tabler/icons-vue";

const SUPPORT_EMAIL = "support@myhb.app";
const INFO_EMAIL = "info@myhb.app";
const WHATSAPP_URL = "https://wa.me/491628425037";

const { trackEvent } = useGoogleAnalytics();
function geklickt(weg: "whatsapp" | "email") {
  trackEvent("kontakt_klick", { event_category: "support", kontakt_weg: weg });
}

useHead({
  title: "Hilfe & Kontakt | MY HEALTH & BEAUTY",
  meta: [
    {
      name: "description",
      content:
        "Fragen zu Termin, Behandlung oder Rechnung? Schreib uns per WhatsApp oder an support@myhb.app.",
    },
  ],
});
</script>

<style scoped>
.kontakt {
  border-radius: var(--border-radius-card);
  padding: var(--space-600);
  display: flex;
  flex-direction: column;
  gap: var(--space-600);
}
@media (min-width: 900px) {
  .kontakt {
    padding: var(--space-900);
  }
}
.kontakt__titel {
  margin: 0;
  font-size: clamp(2rem, 1.5rem + 2vw, 3rem);
  line-height: 1.1;
}
.kontakt__intro {
  margin: 0;
  max-width: 640px;
  color: var(--color-text-light);
}
.kontakt__wege {
  display: grid;
  gap: var(--space-400);
  grid-template-columns: 1fr;
}
@media (min-width: 700px) {
  .kontakt__wege {
    grid-template-columns: 1fr 1fr;
  }
}
.kontakt__weg {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  padding: var(--space-600);
  border-radius: var(--border-radius-card-sm);
  border: 1px solid var(--color-border, rgba(0, 0, 0, 0.12));
  text-decoration: none;
  color: inherit;
}
.kontakt__weg:hover,
.kontakt__weg:focus-visible {
  border-color: currentColor;
}
.kontakt__wegTitel {
  font-weight: 600;
  font-size: 1.15rem;
  word-break: break-word;
}
.kontakt__wegText {
  color: var(--color-text-light);
}
.kontakt__mehr h2 {
  margin: 0 0 var(--space-200);
  font-size: 1.25rem;
}
.kontakt__mehr p {
  margin: 0 0 var(--space-200);
}
.kontakt__partner {
  margin: 0;
  font-size: var(--font-sm, 14px);
  color: var(--color-text-light);
}
</style>
