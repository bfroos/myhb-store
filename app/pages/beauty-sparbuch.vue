<template>
  <div class="sparbuch">
    <UiLayoutSectionBlock>
      <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.STRONG }">
        <header class="sparbuch__hero">
          <p class="sparbuch__eyebrow">Beauty-Sparbuch · Teil vom MY Club</p>
          <h1>Jeden Monat ein bisschen für deine nächste Behandlung</h1>
          <p class="sparbuch__lead">
            Du legst fest, wie viel du jeden Monat zurücklegst, ab
            {{ euro(SPARBUCH.mindestRate) }}. Wir schreiben dir jeden Monat einen
            Beauty-Bonus gut: {{ basis.sparbuchBonusProzent }} % im Jahr, mit
            deiner Club-Stufe bis zu {{ hoechste.sparbuchBonusProzent }} %.
          </p>
          <p class="sparbuch__pflicht">{{ basis.sparbuchBonusProzent }} % {{ SPARBUCH_PFLICHTSATZ }}</p>
          <div class="sparbuch__ctas">
            <UiAtomBaseButton
              as="a"
              size="lg"
              :href="appUrl('sparbuch-seite', 'sparbuch')"
              @click="trackClick('sparbuch-seite', 'app')"
            >
              Sparplan in der App starten
            </UiAtomBaseButton>
          </div>
        </header>
      </UiLayoutCardSurface>
    </UiLayoutSectionBlock>

    <UiLayoutSectionBlock>
      <ol class="sparbuch__schritte">
        <li>
          <strong>Betrag wählen</strong>
          <span>
            Ab {{ euro(SPARBUCH.mindestRate) }} im Monat, in Schritten von
            {{ euro(SPARBUCH.schrittRate) }}. Bezahlt wird per Lastschrift oder Karte.
          </span>
        </li>
        <li>
          <strong>Guthaben wächst</strong>
          <span>Jeden Monat kommt deine Rate dazu und am Monatsende dein Beauty-Bonus.</span>
        </li>
        <li>
          <strong>Einlösen</strong>
          <span>Für Behandlungen und Produkte an allen Standorten, einfach an der Kasse.</span>
        </li>
      </ol>
    </UiLayoutSectionBlock>

    <UiLayoutSectionBlock>
      <div class="sparbuch__kacheln">
        <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.LIGHT }">
          <section class="sparbuch__karte">
            <h2>Ein Beispiel</h2>
            <p>
              Du legst {{ SPARBUCH.beispielMonate }} Monate lang jeden Monat
              {{ euro(SPARBUCH.beispielRate) }} zurück. Dann hast du
              {{ euro(beispielBasis.eingezahlt) }} eingezahlt und bekommst rund
              <strong>{{ euro(beispielBasis.bonus) }}</strong> Beauty-Bonus dazu.
              In der Stufe {{ hoechste.name }} sind es rund
              <strong>{{ euro(beispielHoechste.bonus) }}</strong>.
            </p>
            <p class="sparbuch__muted">
              Gerechnet mit {{ basis.sparbuchBonusProzent }} % und
              {{ hoechste.sparbuchBonusProzent }} % im Jahr, jeden Monat ein Zwölftel
              auf dein eingezahltes Guthaben, ohne Bonus auf den Bonus.
            </p>
          </section>
        </UiLayoutCardSurface>
        <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.LIGHT }">
          <section class="sparbuch__karte">
            <h2>Dein Bonus nach Club-Stufe</h2>
            <ul class="sparbuch__stufen" role="list">
              <li v-for="s in STUFEN" :key="s.name">
                <span>{{ s.name }}<small v-if="s.ab"> ab {{ euro(s.ab) }} Umsatz</small></span>
                <strong>{{ s.sparbuchBonusProzent }} % im Jahr</strong>
              </li>
            </ul>
            <NuxtLinkLocale
              to="/club"
              class="sparbuch__mehr"
              @click="trackClick('sparbuch-seite', 'club')"
            >
              Mehr zu den Stufen im MY Club →
            </NuxtLinkLocale>
          </section>
        </UiLayoutCardSurface>
      </div>
    </UiLayoutSectionBlock>

    <UiLayoutSectionBlock>
      <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.SOFT }">
        <section class="sparbuch__karte">
          <h2>Gut zu wissen</h2>
          <ul class="sparbuch__fakten">
            <li><strong>Dein Geld verfällt nie.</strong> Was du einzahlst, bleibt dein Guthaben.</li>
            <li>
              <strong>Mindestens {{ SPARBUCH.mindestlaufzeitMonate }} Monate</strong>,
              danach jeden Monat kündbar, direkt in der App. Dein Guthaben kannst du
              ab dem Ende der Mindestlaufzeit einlösen.
            </li>
            <li>
              <strong>Bis {{ euro(SPARBUCH.obergrenze) }} Guthaben.</strong> Ist die
              Grenze erreicht, pausiert deine Rate von selbst.
            </li>
            <li>
              <strong>Nicht auszahlbar.</strong> Guthaben und Bonus gelten für
              Behandlungen und Produkte bei uns.
            </li>
            <li>
              <strong>{{ SPARBUCH.widerrufTage }} Tage Widerruf.</strong> Du bekommst
              deine Rate zurück, der Bonus entfällt dann.
            </li>
          </ul>
        </section>
      </UiLayoutCardSurface>
    </UiLayoutSectionBlock>

    <UiLayoutSectionBlock>
      <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.LIGHT }">
        <section class="sparbuch__karte">
          <h2>Häufige Fragen</h2>
          <details v-for="f in fragen" :key="f.frage" class="sparbuch__frage">
            <summary>{{ f.frage }}</summary>
            <p>{{ f.antwort }}</p>
          </details>
          <p class="sparbuch__muted">
            Anbieter ist die My Health and Beauty Klinik GmbH. Das Beauty-Sparbuch ist
            ein Vorauszahlungsguthaben. {{ basis.sparbuchBonusProzent }} bis
            {{ hoechste.sparbuchBonusProzent }} % {{ SPARBUCH_PFLICHTSATZ }}
          </p>
        </section>
      </UiLayoutCardSurface>
    </UiLayoutSectionBlock>
  </div>
</template>

<script setup lang="ts">
/**
 * Landingpage Beauty-Sparbuch, siehe shared/clubSeiten.ts (Wortwahl!).
 * Solange NUXT_PUBLIC_CLUB_SEITEN aus ist: noindex und nirgends verlinkt.
 */
import {
  SPARBUCH,
  SPARBUCH_PFLICHTSATZ,
  STUFEN,
  euro,
  sparbuchBeispiel,
} from "#shared/clubSeiten";
import { ColorTheme } from "~/lib/strapi/dto/enums";

const { enabled, appUrl, trackClick } = useClubSeiten();

const basis = STUFEN[0]!;
const hoechste = STUFEN[STUFEN.length - 1]!;
const beispielBasis = sparbuchBeispiel(basis.sparbuchBonusProzent);
const beispielHoechste = sparbuchBeispiel(hoechste.sparbuchBonusProzent);

const fragen = [
  {
    frage: "Ist das ein Sparkonto?",
    antwort:
      "Nein. Das Beauty-Sparbuch ist Guthaben bei uns, das du für Behandlungen und Produkte einlöst. Der Beauty-Bonus ist ein Treuebonus als Guthaben, kein Geld zum Auszahlen.",
  },
  {
    frage: "Wie wird mein Beauty-Bonus berechnet?",
    antwort:
      "Jeden Monat am Monatsende auf das Guthaben, das du eingezahlt hast: ein Zwölftel des Satzes im Jahr. Auf den Bonus selbst gibt es keinen Bonus.",
  },
  {
    frage: "Kann ich auch einmalig einzahlen?",
    antwort: `Ja. Ab ${euro(SPARBUCH.mindestRate)}, in Schritten von ${euro(SPARBUCH.schrittRate)}.`,
  },
  {
    frage: "Wie kündige ich?",
    antwort: `Nach den ersten ${SPARBUCH.mindestlaufzeitMonate} Monaten jeden Monat, mit dem Knopf „Sparplan kündigen" in der App. Dafür musst du dich nicht anmelden.`,
  },
  {
    frage: "Was passiert mit meinem Guthaben, wenn ich kündige?",
    antwort: "Es bleibt dir und du kannst es weiter bei uns einlösen. Eingezahltes Geld verfällt nie.",
  },
];

useHead({
  title: "Beauty-Sparbuch – monatlich für deine Behandlung | MY Health & Beauty",
  meta: [
    {
      name: "description",
      content:
        "Jeden Monat ab 10 € für deine nächste Behandlung zurücklegen und einen Beauty-Bonus als Guthaben bekommen. Nicht auszahlbar, nur bei MY HEALTH & BEAUTY einlösbar.",
    },
    ...(enabled.value ? [] : [{ name: "robots", content: "noindex, nofollow" }]),
  ],
});
</script>

<style scoped>
.sparbuch {
  padding-bottom: var(--space-1000);
}
.sparbuch__hero {
  display: grid;
  gap: var(--space-500);
  padding: var(--space-900) var(--space-card-pad);
  max-width: 760px;
}
.sparbuch__hero h1 {
  margin: 0;
  hyphens: manual;
}
.sparbuch__eyebrow {
  margin: 0;
  font-size: var(--font-sm);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-light);
}
.sparbuch__lead {
  margin: 0;
  font-size: var(--font-lg);
  color: var(--color-text-light);
}
.sparbuch__pflicht {
  margin: 0;
  font-size: var(--font-xs);
  color: var(--color-text-light);
}
.sparbuch__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-400);
}
.sparbuch__schritte {
  list-style: none;
  counter-reset: schritt;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-400);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.sparbuch__schritte li {
  counter-increment: schritt;
  display: grid;
  gap: var(--space-200);
  padding: var(--space-500);
  border-radius: 16px;
  border: 1px solid var(--color-gray-200, #e5e5e5);
}
.sparbuch__schritte li::before {
  content: counter(schritt);
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
}
.sparbuch__schritte span,
.sparbuch__muted {
  color: var(--color-text-light);
}
.sparbuch__kacheln {
  display: grid;
  gap: var(--space-bento-gap-sm);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
.sparbuch__karte {
  display: grid;
  gap: var(--space-400);
  align-content: start;
  padding: var(--space-card-pad);
  height: 100%;
}
.sparbuch__karte h2,
.sparbuch__karte p {
  margin: 0;
}
.sparbuch__karte h2 {
  font-size: var(--font-2xl);
}
.sparbuch__muted {
  font-size: var(--font-sm);
}
.sparbuch__stufen {
  list-style: none;
  margin: 0;
  padding: 0;
}
.sparbuch__stufen li {
  display: flex;
  justify-content: space-between;
  gap: var(--space-300);
  padding: var(--space-300) 0;
  border-bottom: 1px solid var(--color-gray-200, #e5e5e5);
}
.sparbuch__stufen small {
  color: var(--color-text-light);
}
.sparbuch__mehr {
  color: inherit;
  font-weight: var(--font-bold);
}
.sparbuch__fakten {
  margin: 0;
  padding-left: 1.2em;
  display: grid;
  gap: var(--space-300);
}
.sparbuch__frage {
  border-bottom: 1px solid var(--color-gray-200, #e5e5e5);
  padding: var(--space-300) 0;
}
.sparbuch__frage summary {
  cursor: pointer;
  font-weight: var(--font-bold);
}
.sparbuch__frage p {
  margin: var(--space-200) 0 0;
  color: var(--color-text-light);
}
</style>
