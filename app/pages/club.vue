<template>
  <div class="cl">
    <div class="cl__blatt">
      <section class="cl__hero">
        <div class="cl__heroBild" role="img" aria-label="Behandlung bei MY HEALTH & BEAUTY" style="background-image: url('/img/club/hero.jpg')" />
        <div class="cl__heroText">
          <p class="cl__eyebrow">MY Club · Treueprogramm</p>
          <h1>Treue, die sich auszahlt!</h1>
          <p class="cl__lead">
            Unser neues Treueprogramm MY Club ist da! Melde dich kostenlos in der
            MY App an. Mit jeder Behandlung bekommst du Cashback für den nächsten
            Besuch und mit jedem Status mehr Guthaben, Geschenke und Vorteile.
          </p>
          <div class="cl__knoepfe">
            <a class="cl__knopf" :href="appUrl('club-seite', 'club')" @click="trackClick('club-seite', 'app')">
              Kostenlos Mitglied werden
            </a>
            <SharedButton
              :button="{
                label: t('cta.bookAppointment'),
                method: SharedButtonMethod.ACTION,
                action: SharedButtonAction.APPOINTMENT_BOOKING,
              }"
              ohne-seiten-kontext
            />
          </div>
        </div>
      </section>

      <section class="cl__band" aria-label="Cashback je Status">
        <div class="cl__bandRaster">
          <div v-for="s in STUFEN" :key="s.name">
            <p class="cl__bandName">{{ s.name }}</p>
            <p class="cl__bandZahl">{{ prozent(s.cashbackProzent) }} Cashback</p>
            <p class="cl__bandText">{{ s.ab ? `ab ${euro(s.ab)} Umsatz` : "ab Anmeldung" }}</p>
          </div>
        </div>
        <p class="cl__bandFuss">
          Cashback von jeder bezahlten Behandlung. Dein Status richtet sich
          nach deinem Umsatz in den letzten {{ STATUS_FENSTER_MONATE }} Monaten.
        </p>
      </section>

      <section class="cl__abschnitt">
        <p class="cl__eyebrow">In drei Schritten</p>
        <ol class="cl__schritte">
          <li><span><strong>In der App anmelden.</strong> Kostenlos, mit deiner E-Mail-Adresse. Du bist sofort im MY Club.</span></li>
          <li><span><strong>Behandlung genießen.</strong> Dein Cashback wird nach dem Bezahlen automatisch gutgeschrieben.</span></li>
          <li><span><strong>Beim nächsten Besuch einlösen.</strong> Sag am Empfang: „Bitte mit Guthaben.“</span></li>
        </ol>
      </section>

      <section class="cl__abschnitt cl__abschnitt--hell">
        <p class="cl__eyebrow">Alle Vorteile</p>
        <h2>Dein Status, deine Vorteile</h2>
        <div class="cl__tabelle">
          <table>
            <thead>
              <tr>
                <th scope="col"><span class="sr-only">Vorteil</span></th>
                <th v-for="s in STUFEN" :key="s.name" scope="col">
                  <span class="cl__stufe" :class="`cl__stufe--${s.name.toLowerCase()}`">{{ s.name }}</span>
                  <small>{{ s.ab ? `ab ${euro(s.ab)}` : "ab Anmeldung" }}</small>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="z in zeilen" :key="z.name">
                <th scope="row">{{ z.name }}</th>
                <td v-for="(w, i) in z.werte" :key="i" :class="{ cl__nein: w === '–' }">{{ w }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul class="cl__karten" role="list">
          <li v-for="(s, i) in STUFEN" :key="s.name">
            <p class="cl__kartenKopf">
              <span class="cl__stufe" :class="`cl__stufe--${s.name.toLowerCase()}`">{{ s.name }}</span>
              {{ s.ab ? `ab ${euro(s.ab)} Umsatz` : "ab Anmeldung" }}
            </p>
            <ul role="list">
              <li v-for="z in zeilen.filter((z) => z.werte[i] !== '–')" :key="z.name">
                {{ z.werte[i] === "✓" ? z.name : `${z.name}: ${z.werte[i]}` }}
              </li>
            </ul>
          </li>
        </ul>
      </section>

      <section class="cl__abschnitt">
        <div class="cl__zwei">
          <div class="cl__box cl__box--puder">
            <p class="cl__eyebrow">Neu: Beauty-Sparbuch</p>
            <h2>Jeden Monat ein bisschen für deine nächste Behandlung</h2>
            <p class="cl__text">
              Spare für deine Wunschbehandlung: ab {{ euro(SPARBUCH.mindestRate) }} im Monat,
              ohne zusätzliche Gebühren, und jeden Monat einen Beauty-Bonus dazu.
            </p>
            <NuxtLinkLocale to="/beauty-sparbuch" class="cl__knopf cl__knopf--rand" @click="trackClick('club-seite', 'sparbuch')">
              So funktioniert es
            </NuxtLinkLocale>
          </div>
          <div class="cl__box">
            <p class="cl__eyebrow">Weiterempfehlen</p>
            <p class="cl__boxZahl">{{ euro(CLUB.empfehlungEuro) }} + {{ euro(CLUB.empfehlungEuro) }}</p>
            <p class="cl__text">
              Teil deinen persönlichen Weiterempfehlungslink aus der App. Die empfohlene
              Person bekommt {{ euro(CLUB.empfehlungEuro) }} auf ihre erste Behandlung.
              Du bekommst {{ euro(CLUB.empfehlungEuro) }} Guthaben in deinem Kundenkonto für weitere Behandlungen.
            </p>
            <a class="cl__knopf cl__knopf--rand" :href="appUrl('club-seite', 'club')" @click="trackClick('club-seite', 'app')">Link holen</a>
          </div>
        </div>
      </section>

      <section class="cl__abschnitt cl__abschnitt--puder">
        <div class="cl__app">
          <div style="display: grid; gap: 20px">
            <p class="cl__eyebrow">Deine App</p>
            <h2>Alles für deine Behandlung. An einem Ort.</h2>
            <div class="cl__vorteile">
              <p><strong>Guthaben und Status</strong>Du siehst jederzeit, wie viel du hast und was bis zum nächsten Status fehlt.</p>
              <p><strong>Buchen, wann du willst</strong>Rund um die Uhr, deine letzte Behandlung mit einem Tipp nochmal.</p>
              <p><strong>Erinnerung inklusive</strong>Am Vortag und zwei Stunden vor deinem Termin.</p>
              <p><strong>Dein Behandlungsplan</strong>Dein Arzt legt ihn an, du siehst, was als Nächstes ansteht.</p>
            </div>
          </div>
          <img src="/img/club/app.jpg" alt="Die App von MY HEALTH & BEAUTY auf dem Handy" width="1200" height="1000" loading="lazy">
        </div>
      </section>

      <section class="cl__abschnitt cl__fragen">
        <p class="cl__eyebrow">Gut zu wissen</p>
        <div>
          <details v-for="f in fragen" :key="f.frage">
            <summary>{{ f.frage }}</summary>
            <p>{{ f.antwort }}</p>
          </details>
        </div>
      </section>

      <section class="cl__abschnitt cl__abschnitt--hell cl__mitte">
        <h2>Schön, dass du dabei bist.</h2>
        <p class="cl__text">Wir freuen uns auf deinen nächsten Besuch.</p>
        <a class="cl__knopf" :href="appUrl('club-seite', 'club')" @click="trackClick('club-seite', 'app')">Jetzt Mitglied werden</a>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Landingpage MY Club (Treueprogramm), siehe shared/clubSeiten.ts. Look wie
 * das Mailing (assets/css/club-seiten.css). Solange NUXT_PUBLIC_CLUB_SEITEN
 * aus ist: noindex und nirgends verlinkt.
 */
import { CLUB, SPARBUCH, STATUS_FENSTER_MONATE, STUFEN, euro, prozent } from "#shared/clubSeiten";
import { SharedButtonAction, SharedButtonMethod } from "~/lib/strapi/dto/enums";

const { t } = useI18n();
const { enabled, appUrl, trackClick } = useClubSeiten();

const ja = (b: boolean) => (b ? "✓" : "–");
// Wortlaut Michael (Mail-Werkstatt 23.10.2026). Der Geburtstagsbonus bleibt eine
// Ueberraschung und steht deshalb nicht in der Tabelle (Benjamin 23.10.2026).
const zeilen = [
  { name: "Cashback je Besuch", werte: STUFEN.map((s) => prozent(s.cashbackProzent)) },
  { name: "Status-Welcome-Guthaben", werte: STUFEN.map((s) => (s.geschenkEuro ? euro(s.geschenkEuro) : "–")) },
  { name: "Bonus Beauty-Sparbuch", werte: STUFEN.map((s) => `${prozent(s.sparbuchBonusProzent)} im Jahr`) },
  { name: "Sonderaktionen", werte: STUFEN.map((s) => ja(s.aktionen)) },
  { name: "Wunscharzt buchen", werte: STUFEN.map((s) => ja(s.wunscharzt)) },
  { name: "Priority Support", werte: STUFEN.map((s) => ja(s.bevorzugterService)) },
  { name: "Mitgliedskarte in der App", werte: STUFEN.map(() => "✓") },
];

const fragen = [
  {
    frage: "Was kostet der MY Club?",
    antwort: "Nichts. Du meldest dich kostenlos in der MY App an und bist sofort Mitglied.",
  },
  {
    frage: "Wo sehe ich mein Guthaben und meinen Status?",
    antwort: "In der MY App. Dort stehen dein Guthaben, dein Status und wie viel dir bis zum nächsten Status fehlt.",
  },
  {
    frage: "Wie löse ich mein Guthaben ein?",
    antwort: "Sag beim Bezahlen am Empfang Bescheid. Das Guthaben wird von deinem Betrag abgezogen, an allen Standorten.",
  },
  {
    frage: "Wie lange gilt mein Guthaben?",
    antwort: `Alles Guthaben, das wir dir schenken, ist ${CLUB.bonusGueltigMonate} Monate ab der Gutschrift gültig, auch der Beauty-Bonus. Warst du ${CLUB.verfallOhneBesuchMonate} Monate nicht bei uns, verfällt das geschenkte Guthaben. Guthaben, das du ins Beauty-Sparbuch einzahlst, ist unbegrenzt gültig.`,
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
  title: "MY Club – Cashback bei jedem Besuch | MY Health & Beauty",
  meta: [
    {
      name: "description",
      content:
        "Das Treueprogramm von MY HEALTH & BEAUTY: kostenlos in der App anmelden, bei jedem Besuch 1 bis 3 % Cashback, Geschenke und die Status WHITE, GREY und BLACK.",
    },
    ...(enabled.value ? [] : [{ name: "robots", content: "noindex, nofollow" }]),
  ],
});
</script>

<style src="~/assets/css/club-seiten.css"></style>
