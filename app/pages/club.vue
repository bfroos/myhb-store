<template>
  <div class="clubSeite">
    <UiLayoutSectionBlock>
      <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.STRONG }">
        <header class="clubSeite__hero">
          <p class="clubSeite__eyebrow">MY Club · Treueprogramm</p>
          <h1>Bei jedem Besuch Guthaben für den nächsten</h1>
          <p class="clubSeite__lead">
            Melde dich kostenlos in der MY App an. Ab dann sammelst du bei jeder
            Behandlung automatisch Guthaben. Je öfter du bei uns bist, desto mehr
            bekommst du zurück.
          </p>
          <div class="clubSeite__ctas">
            <UiAtomBaseButton
              as="a"
              size="lg"
              :href="appUrl('club-seite', 'club')"
              @click="trackClick('club-seite', 'app')"
            >
              Kostenlos Mitglied werden
            </UiAtomBaseButton>
            <SharedButton
              :button="{
                label: t('cta.bookAppointment'),
                method: SharedButtonMethod.ACTION,
                action: SharedButtonAction.APPOINTMENT_BOOKING,
              }"
              ohne-seiten-kontext
            />
          </div>
        </header>
      </UiLayoutCardSurface>
    </UiLayoutSectionBlock>

    <UiLayoutSectionBlock>
      <ol class="clubSeite__schritte">
        <li>
          <strong>In der App anmelden</strong>
          <span>Kostenlos, mit deiner E-Mail-Adresse. Du bist sofort im MY Club.</span>
        </li>
        <li>
          <strong>Behandlung genießen</strong>
          <span>Dein Guthaben wird nach dem Bezahlen automatisch gutgeschrieben.</span>
        </li>
        <li>
          <strong>Beim nächsten Besuch einlösen</strong>
          <span>An der Kasse an allen Standorten. Dein Stand steht immer in der App.</span>
        </li>
      </ol>
    </UiLayoutSectionBlock>

    <UiLayoutSectionBlock>
      <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.LIGHT }">
        <section class="clubSeite__karte">
          <h2>Deine Stufe</h2>
          <p class="clubSeite__muted">
            Deine Stufe richtet sich nach deinem Umsatz bei uns in den letzten
            {{ STATUS_FENSTER_MONATE }} Monaten, an allen Standorten zusammen.
          </p>
          <div class="clubSeite__tabelle">
            <table>
              <thead>
                <tr>
                  <th scope="col"><span class="sr-only">Vorteil</span></th>
                  <th v-for="s in STUFEN" :key="s.name" scope="col">
                    <span class="clubSeite__stufe" :class="`clubSeite__stufe--${s.name.toLowerCase()}`">{{ s.name }}</span>
                    <small>{{ s.ab ? `ab ${euro(s.ab)}` : "ab Anmeldung" }}</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Guthaben zurück bei jedem Besuch</th>
                  <td v-for="s in STUFEN" :key="s.name">{{ s.cashbackProzent ? `${s.cashbackProzent} %` : "–" }}</td>
                </tr>
                <tr>
                  <th scope="row">Geburtstagsgeschenk</th>
                  <td v-for="s in STUFEN" :key="s.name">{{ euro(s.geburtstagEuro) }}</td>
                </tr>
                <tr>
                  <th scope="row">Willkommensgeschenk in der neuen Stufe</th>
                  <td v-for="s in STUFEN" :key="s.name">{{ s.geschenkEuro ? euro(s.geschenkEuro) : "–" }}</td>
                </tr>
                <tr>
                  <th scope="row">
                    Bonus im
                    <NuxtLinkLocale to="/beauty-sparbuch" @click="trackClick('club-seite', 'sparbuch')">Beauty-Sparbuch</NuxtLinkLocale>
                  </th>
                  <td v-for="s in STUFEN" :key="s.name">{{ s.sparbuchBonusProzent }} % im Jahr</td>
                </tr>
                <tr>
                  <th scope="row">Aktionen für ausgewählte Behandlungen</th>
                  <td v-for="s in STUFEN" :key="s.name"><Haken :an="s.aktionen" /></td>
                </tr>
                <tr>
                  <th scope="row">Wunscharzt fest buchen</th>
                  <td v-for="s in STUFEN" :key="s.name"><Haken :an="s.wunscharzt" /></td>
                </tr>
                <tr>
                  <th scope="row">Bevorzugter Service</th>
                  <td v-for="s in STUFEN" :key="s.name"><Haken :an="s.bevorzugterService" /></td>
                </tr>
                <tr>
                  <th scope="row">Mitgliedskarte in der App</th>
                  <td v-for="s in STUFEN" :key="s.name"><Haken an /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul class="clubSeite__stufenKarten" role="list">
            <li v-for="s in STUFEN" :key="s.name">
              <p class="clubSeite__stufenKopf">
                <span class="clubSeite__stufe" :class="`clubSeite__stufe--${s.name.toLowerCase()}`">{{ s.name }}</span>
                <small>{{ s.ab ? `ab ${euro(s.ab)} Umsatz` : "ab Anmeldung" }}</small>
              </p>
              <ul role="list">
                <li v-for="v in vorteile(s)" :key="v">{{ v }}</li>
              </ul>
            </li>
          </ul>
        </section>
      </UiLayoutCardSurface>
    </UiLayoutSectionBlock>

    <UiLayoutSectionBlock>
      <div class="clubSeite__kacheln">
        <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.SOFT }">
          <section class="clubSeite__kachel">
            <h2>Neu bei uns?</h2>
            <p>
              Du bekommst {{ euro(CLUB.startguthabenErsterBesuch) }} Startguthaben für
              deinen ersten Besuch und noch einmal
              {{ euro(CLUB.startguthabenZweiterBesuch) }} für den zweiten.
            </p>
          </section>
        </UiLayoutCardSurface>
        <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.SOFT }">
          <section class="clubSeite__kachel">
            <h2>Freunde werben</h2>
            <p>
              Empfiehl uns weiter: Ihr bekommt beide {{ euro(CLUB.empfehlungEuro) }}
              Guthaben, sobald die Person, die du empfohlen hast, ihre erste
              Behandlung bei uns hatte. Deinen Empfehlungslink findest du in der App.
            </p>
          </section>
        </UiLayoutCardSurface>
        <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.SOFT }">
          <section class="clubSeite__kachel">
            <h2>Beauty-Sparbuch</h2>
            <p>
              Leg jeden Monat ab {{ euro(SPARBUCH.mindestRate) }} für deine nächste
              Behandlung zurück und bekomm jeden Monat einen Beauty-Bonus dazu.
            </p>
            <NuxtLinkLocale
              to="/beauty-sparbuch"
              class="clubSeite__mehr"
              @click="trackClick('club-seite', 'sparbuch')"
            >
              So funktioniert das Beauty-Sparbuch →
            </NuxtLinkLocale>
          </section>
        </UiLayoutCardSurface>
      </div>
    </UiLayoutSectionBlock>

    <UiLayoutSectionBlock>
      <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.LIGHT }">
        <section class="clubSeite__karte">
          <h2>Häufige Fragen</h2>
          <details v-for="f in fragen" :key="f.frage" class="clubSeite__frage">
            <summary>{{ f.frage }}</summary>
            <p>{{ f.antwort }}</p>
          </details>
        </section>
      </UiLayoutCardSurface>
    </UiLayoutSectionBlock>
  </div>
</template>

<script setup lang="ts">
/**
 * Landingpage MY Club (Treueprogramm), siehe shared/clubSeiten.ts.
 * Solange NUXT_PUBLIC_CLUB_SEITEN aus ist: noindex und nirgends verlinkt.
 */
import { CLUB, SPARBUCH, STATUS_FENSTER_MONATE, STUFEN, euro, type Stufe } from "#shared/clubSeiten";
import { ColorTheme, SharedButtonAction, SharedButtonMethod } from "~/lib/strapi/dto/enums";

const { t } = useI18n();
const { enabled, appUrl, trackClick } = useClubSeiten();

const Haken = defineComponent({
  props: { an: { type: Boolean, default: false } },
  setup: (p) => () =>
    p.an ? h("span", { "aria-label": "ja" }, "✓") : h("span", { "aria-label": "nein" }, "–"),
});

// Handy: dieselben Vorteile als Liste je Stufe statt Tabelle.
function vorteile(s: Stufe): string[] {
  return [
    s.cashbackProzent ? `${s.cashbackProzent} % Guthaben zurück bei jedem Besuch` : "",
    `${euro(s.geburtstagEuro)} zum Geburtstag`,
    s.geschenkEuro ? `${euro(s.geschenkEuro)} Willkommensgeschenk` : "",
    `${s.sparbuchBonusProzent} % Bonus im Jahr im Beauty-Sparbuch`,
    s.aktionen ? "Aktionen für ausgewählte Behandlungen" : "",
    s.wunscharzt ? "Wunscharzt fest buchen" : "",
    s.bevorzugterService ? "Bevorzugter Service" : "",
    "Mitgliedskarte in der App",
  ].filter(Boolean);
}

const fragen = [
  {
    frage: "Was kostet der MY Club?",
    antwort: "Nichts. Du meldest dich kostenlos in der MY App an und bist sofort Mitglied.",
  },
  {
    frage: "Wo sehe ich mein Guthaben und meine Stufe?",
    antwort: "In der MY App. Dort stehen dein Guthaben, deine Stufe und wie viel dir bis zur nächsten Stufe fehlt.",
  },
  {
    frage: "Wie löse ich mein Guthaben ein?",
    antwort: "Sag beim Bezahlen an der Kasse Bescheid. Das Guthaben wird von deinem Betrag abgezogen, an allen Standorten.",
  },
  {
    frage: "Wie lange gilt mein Guthaben?",
    antwort: `Jedes Guthaben, das du von uns bekommst, gilt ${CLUB.bonusGueltigMonate} Monate ab der Gutschrift. Warst du ${CLUB.verfallOhneBesuchMonate} Monate nicht bei uns, verfällt dein Bonusguthaben. Geld, das du selbst im Beauty-Sparbuch eingezahlt hast, verfällt nie.`,
  },
  {
    frage: "Kann ich mir Guthaben auszahlen lassen?",
    antwort: "Nein. Guthaben gilt für Behandlungen und Produkte bei uns, es wird nicht ausgezahlt.",
  },
  {
    frage: "Ich hatte Punkte im alten MY Club. Was ist damit?",
    antwort: `Deine Punkte sind jetzt Guthaben in Euro (${CLUB.loloyalPunkteJeEuro} Punkte = 1 €). Melde dich in der App mit derselben E-Mail-Adresse an, die du früher im Shop hattest. Dann ist dein Guthaben sofort da.`,
  },
];

useHead({
  title: "MY Club – Guthaben bei jedem Besuch | MY Health & Beauty",
  meta: [
    {
      name: "description",
      content:
        "Das Treueprogramm von MY HEALTH & BEAUTY: kostenlos in der App anmelden, bei jedem Besuch Guthaben sammeln, Stufen White, Grey und Black.",
    },
    ...(enabled.value ? [] : [{ name: "robots", content: "noindex, nofollow" }]),
  ],
});
</script>

<style scoped>
.clubSeite {
  padding-bottom: var(--space-1000);
}
.clubSeite__hero {
  display: grid;
  gap: var(--space-500);
  padding: var(--space-900) var(--space-card-pad);
  max-width: 760px;
}
.clubSeite__hero h1 {
  margin: 0;
  hyphens: manual;
}
.clubSeite__eyebrow {
  margin: 0;
  font-size: var(--font-sm);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-light);
}
.clubSeite__lead {
  margin: 0;
  font-size: var(--font-lg);
  color: var(--color-text-light);
}
.clubSeite__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-400);
}
.clubSeite__schritte {
  list-style: none;
  counter-reset: schritt;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-400);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.clubSeite__schritte li {
  counter-increment: schritt;
  display: grid;
  gap: var(--space-200);
  padding: var(--space-500);
  border-radius: 16px;
  border: 1px solid var(--color-gray-200, #e5e5e5);
}
.clubSeite__schritte li::before {
  content: counter(schritt);
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
}
.clubSeite__schritte span,
.clubSeite__muted {
  color: var(--color-text-light);
}
.clubSeite__karte {
  display: grid;
  gap: var(--space-400);
  padding: var(--space-card-pad);
}
.clubSeite__karte h2,
.clubSeite__kachel h2 {
  margin: 0;
}
.clubSeite__muted {
  margin: 0;
}
.clubSeite__tabelle {
  overflow-x: auto;
}
.clubSeite__tabelle table {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
}
.clubSeite__tabelle th,
.clubSeite__tabelle td {
  padding: var(--space-300) var(--space-200);
  border-bottom: 1px solid var(--color-gray-200, #e5e5e5);
  text-align: center;
  vertical-align: middle;
}
.clubSeite__tabelle tbody th {
  text-align: left;
  font-weight: var(--font-regular);
}
.clubSeite__tabelle thead th {
  vertical-align: bottom;
}
.clubSeite__tabelle thead small {
  display: block;
  margin-top: 4px;
  font-weight: var(--font-regular);
  font-size: var(--font-xs);
  color: var(--color-text-light);
}
.clubSeite__stufenKarten {
  display: none;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--space-400);
}
.clubSeite__stufenKarten > li {
  padding: var(--space-400) 0;
  border-bottom: 1px solid var(--color-gray-200, #e5e5e5);
}
.clubSeite__stufenKarten ul {
  margin: var(--space-200) 0 0;
  padding-left: 1.2em;
  display: grid;
  gap: 4px;
}
.clubSeite__stufenKopf {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-300);
}
.clubSeite__stufenKopf small {
  color: var(--color-text-light);
}
@media (max-width: 640px) {
  .clubSeite__tabelle {
    display: none;
  }
  .clubSeite__stufenKarten {
    display: grid;
  }
}
.clubSeite__stufe {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--color-gray-300, #d4d4d4);
}
.clubSeite__stufe--white {
  background: #fff;
}
.clubSeite__stufe--grey {
  background: var(--color-gray-400, #a3a3a3);
  color: #fff;
  border-color: transparent;
}
.clubSeite__stufe--black {
  background: #111;
  color: #fff;
  border-color: transparent;
}
.clubSeite__kacheln {
  display: grid;
  gap: var(--space-bento-gap-sm);
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
.clubSeite__kachel {
  display: grid;
  gap: var(--space-300);
  align-content: start;
  padding: var(--space-card-pad);
  height: 100%;
}
.clubSeite__kachel h2 {
  font-size: var(--font-2xl);
}
.clubSeite__kachel p {
  margin: 0;
}
.clubSeite__mehr {
  color: inherit;
  font-weight: var(--font-bold);
}
.clubSeite__frage {
  border-bottom: 1px solid var(--color-gray-200, #e5e5e5);
  padding: var(--space-300) 0;
}
.clubSeite__frage summary {
  cursor: pointer;
  font-weight: var(--font-bold);
}
.clubSeite__frage p {
  margin: var(--space-200) 0 0;
  color: var(--color-text-light);
}
</style>
