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
            <p class="cl__bandName">
              <span class="cl__stufe cl__stufe--gross" :class="`cl__stufe--${s.name.toLowerCase()}`">{{ s.name }}</span>
            </p>
            <p class="cl__bandZahl">{{ prozent(s.cashbackProzent) }}</p>
            <p class="cl__bandText">Cashback<br>{{ s.ab ? `ab ${euro(s.ab)} Umsatz` : "ab Anmeldung" }}</p>
          </div>
        </div>
        <p class="cl__bandFuss">
          Cashback von jeder bezahlten Behandlung. Dein Status richtet sich
          nach deinem Umsatz in den letzten {{ STATUS_FENSTER_MONATE }} Monaten.
        </p>
      </section>

      <section class="cl__abschnitt">
        <p class="cl__eyebrow">So einfach geht's</p>
        <ol class="cl__schritte">
          <li><span><strong>In der App anmelden.</strong> Kostenlos, mit deiner Handynummer. Du bist sofort im MY Club.</span></li>
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
              <template v-for="(z, zi) in zeilen" :key="z.name">
                <tr class="cl__zeile" :class="{ 'cl__zeile--offen': offen === zi }" @click="umschalten(zi)">
                  <th scope="row">
                    <button
                      type="button"
                      class="cl__zeileKnopf"
                      :aria-expanded="offen === zi"
                      :aria-controls="`vorteil-${zi}`"
                      @click.stop="umschalten(zi)"
                    >
                      {{ z.name }}
                    </button>
                  </th>
                  <td v-for="(w, i) in z.werte" :key="i" :class="{ cl__nein: w === '–' }">{{ w }}</td>
                </tr>
                <tr v-show="offen === zi" :id="`vorteil-${zi}`" class="cl__erklaerung">
                  <td :colspan="STUFEN.length + 1">
                    <p v-for="(absatz, ai) in z.erklaerung" :key="ai">{{ absatz }}</p>
                  </td>
                </tr>
              </template>
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
        <div class="cl__fragen cl__vorteilErklaert">
          <p class="cl__hinweis">Was heißt das? Tipp auf einen Vorteil.</p>
          <details v-for="z in zeilen" :key="z.name">
            <summary>{{ z.name }}</summary>
            <p v-for="(absatz, ai) in z.erklaerung" :key="ai">{{ absatz }}</p>
          </details>
        </div>
        <p class="cl__hinweis cl__hinweis--tabelle">Klick auf einen Vorteil, dann siehst du, wie er funktioniert.</p>
      </section>

      <section class="cl__abschnitt">
        <div class="cl__zwei">
          <div class="cl__box cl__box--puder">
            <p class="cl__eyebrow">Neu: Beauty-Sparbuch</p>
            <h2>Spare für deine Wunschbehandlung!</h2>
            <p class="cl__text">
              Ab {{ euro(SPARBUCH.mindestRate) }} im Monat, ohne zusätzliche Gebühren.
              Jeden Monat kommt ein Beauty-Bonus dazu.
            </p>
            <NuxtLinkLocale to="/beauty-sparbuch" class="cl__knopf cl__knopf--rand" @click="trackClick('club-seite', 'sparbuch')">
              So funktioniert es
            </NuxtLinkLocale>
          </div>
          <div class="cl__box">
            <p class="cl__eyebrow">Weiterempfehlen</p>
            <p class="cl__boxZahl">bis zu {{ euro(empfehlungMax) }}</p>
            <p class="cl__text">
              Teil deinen persönlichen Weiterempfehlungslink aus der App. Die empfohlene
              Person bekommt {{ euro(CLUB.empfehlungEuro) }} auf ihre erste Behandlung, und du
              bekommst denselben Betrag als Guthaben in deinem Kundenkonto. Als Statuskunde
              bekommt ihr beide sogar mehr: {{ empfehlungMitStatus }}.
            </p>
            <a class="cl__knopf cl__knopf--rand" :href="appUrl('club-seite', 'club')" @click="trackClick('club-seite', 'app')">Jetzt weiterempfehlen</a>
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
              <p><strong>Buchen, wann du willst</strong>Rund um die Uhr. Deine letzte Behandlung buchst du mit einem Tipp wieder.</p>
              <p><strong>Erinnerung inklusive</strong>Wir erinnern dich am Vortag und zwei Stunden vor deinem Termin.</p>
              <p><strong>Dein Behandlungsplan</strong>Dein Arzt legt ihn für dich an. So siehst du immer, was als Nächstes ansteht.</p>
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
        <h2>Werde jetzt Mitglied im MY Club!</h2>
        <p class="cl__text">Kostenlos in der MY App. Wir freuen uns sehr auf deinen nächsten Besuch.</p>
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
import { CLUB, SPARBUCH, SPARBUCH_PFLICHTSATZ, STATUS_FENSTER_MONATE, STUFEN, euro, prozent, sparbuchBeispiel } from "#shared/clubSeiten";
import { SharedButtonAction, SharedButtonMethod } from "~/lib/strapi/dto/enums";

const { t } = useI18n();
const { enabled, appUrl, trackClick } = useClubSeiten();

const ja = (b: boolean) => (b ? "✓" : "–");
// „A, B und C“ statt „A, B, C“.
const aufzaehlen = (teile: string[]) =>
  teile.length < 2 ? (teile[0] ?? "") : `${teile.slice(0, -1).join(", ")} und ${teile[teile.length - 1]}`;
// Wortlaut Michael (Mail-Werkstatt 23.10.2026). Der Geburtstagsbonus bleibt eine
// Ueberraschung und steht deshalb nicht in der Tabelle (Benjamin 23.10.2026).
const beispiel = sparbuchBeispiel(STUFEN[0]!.sparbuchBonusProzent);
const stufeNamen = (pruef: (s: (typeof STUFEN)[number]) => boolean) => STUFEN.find(pruef)?.name ?? "";

// Empfehlung nach Status (myhb-app/myhb-os#2152), fuer Kasten und Tabelle.
const empfehlungMax = Math.max(...STUFEN.map((s) => s.empfehlungEuro));
const empfehlungStaffel = aufzaehlen(STUFEN.map((s) => `${euro(s.empfehlungEuro)} als ${s.name}`));
const empfehlungMitStatus = aufzaehlen(STUFEN.slice(1).map((s) => `${euro(s.empfehlungEuro)} als ${s.name}`));

// Erklaerungen zum Aufklappen (Benjamin und Michael 03.11.2026): Jeder Vorteil
// soll nicht nur ein Wort sein, sondern sagen, was er heisst und wie er funktioniert.
const zeilen = [
  {
    name: "Cashback je Besuch",
    werte: STUFEN.map((s) => prozent(s.cashbackProzent)),
    erklaerung: [
      `Nach jeder bezahlten Behandlung bekommst du automatisch Cashback als Guthaben in deinem Kundenkonto: ${aufzaehlen(STUFEN.map((s) => `${prozent(s.cashbackProzent)} als ${s.name}`))}.`,
      `Beispiel: Du bezahlst 400 € für eine Behandlung. Als GREY bekommst du ${euro((400 * STUFEN[2]!.cashbackProzent) / 100)} Guthaben, als BLACK ${euro((400 * STUFEN[3]!.cashbackProzent) / 100)}.`,
      "Dein Guthaben siehst du sofort in der App. Beim nächsten Besuch sagst du am Empfang einfach: „Bitte mit Guthaben.“",
    ],
  },
  {
    name: "Status-Welcome-Guthaben",
    werte: STUFEN.map((s) => (s.geschenkEuro ? euro(s.geschenkEuro) : "–")),
    erklaerung: [
      `Erreichst du einen neuen Status, schenken wir dir einmalig Guthaben: ${aufzaehlen(STUFEN.filter((s) => s.geschenkEuro).map((s) => `${euro(s.geschenkEuro!)} für ${s.name}`))}.`,
      `Dein Status richtet sich nach deinem Umsatz in den letzten ${STATUS_FENSTER_MONATE} Monaten. Sobald du die Grenze erreichst, liegt das Guthaben automatisch in deinem Kundenkonto in der App.`,
    ],
  },
  {
    name: "Bonus Beauty-Sparbuch",
    werte: STUFEN.map((s) => `${prozent(s.sparbuchBonusProzent)} im Jahr`),
    erklaerung: [
      `Mit dem Beauty-Sparbuch legst du jeden Monat ab ${euro(SPARBUCH.mindestRate)} für deine nächste Behandlung zurück, ohne zusätzliche Gebühren. Auf dein eingezahltes Guthaben bekommst du jeden Monat einen Beauty-Bonus dazu: ${prozent(STUFEN[0]!.sparbuchBonusProzent)} im Jahr, als Statuskunde sogar bis zu ${prozent(STUFEN[STUFEN.length - 1]!.sparbuchBonusProzent)}.`,
      `Beispiel: Du legst ${SPARBUCH.beispielMonate} Monate lang je ${euro(SPARBUCH.beispielRate)} zurück. Dann hast du ${euro(beispiel.eingezahlt)} Guthaben und rund ${euro(beispiel.bonus)} Beauty-Bonus dazu (bei ${prozent(STUFEN[0]!.sparbuchBonusProzent)}).`,
      "Dein Beauty-Sparbuch legst du direkt in der App an.",
      `${prozent(STUFEN[0]!.sparbuchBonusProzent)} ${SPARBUCH_PFLICHTSATZ}`,
    ],
  },
  {
    name: "Weiterempfehlung",
    werte: STUFEN.map((s) => `${euro(s.empfehlungEuro)} + ${euro(s.empfehlungEuro)}`),
    erklaerung: [
      `Teil deinen persönlichen Weiterempfehlungslink aus der App. Die empfohlene Person bekommt Guthaben auf ihre erste Behandlung, und du bekommst denselben Betrag als Guthaben in deinem Kundenkonto. Der Betrag hängt von deinem Status ab: ${empfehlungStaffel}.`,
      `Beispiel: Du bist GREY und empfiehlst uns weiter. Die empfohlene Person bekommt ${euro(STUFEN[2]!.empfehlungEuro)} auf ihre erste Behandlung, du ${euro(STUFEN[2]!.empfehlungEuro)} Guthaben für deinen nächsten Besuch.`,
    ],
  },
  {
    name: "Sonderaktionen",
    werte: STUFEN.map((s) => ja(s.aktionen)),
    erklaerung: [
      `Ab ${stufeNamen((s) => s.aktionen)} bekommst du Sonderaktionen für ausgewählte Behandlungen, die es nur für Statuskunden gibt. Sobald eine Aktion startet, erfährst du es per E-Mail und in der App.`,
    ],
  },
  {
    name: "Priority Booking: Wunscharzt wählen",
    werte: STUFEN.map((s) => ja(s.wunscharzt)),
    erklaerung: [
      `Ab ${stufeNamen((s) => s.wunscharzt)} buchst du deinen Termin direkt bei deinem Wunscharzt. In der App siehst du, an welchen Tagen er an deinem Standort ist, und wählst ihn bei der Buchung aus.`,
    ],
  },
  {
    name: "Priority Support",
    werte: STUFEN.map((s) => ja(s.bevorzugterService)),
    erklaerung: [
      `Ab ${stufeNamen((s) => s.bevorzugterService)} kommst du bei Fragen schneller dran: Deine Anfragen an unseren Kundenservice, ob per Telefon, WhatsApp oder E-Mail, bearbeiten wir bevorzugt.`,
    ],
  },
  {
    name: "Mitgliedskarte in der App",
    werte: STUFEN.map(() => "✓"),
    erklaerung: [
      "In der App hast du deine Mitgliedskarte immer dabei. Darauf siehst du deinen Status, dein Guthaben und wie viel dir bis zum nächsten Status fehlt.",
    ],
  },
];

const offen = ref<number | null>(null);
function umschalten(i: number) {
  offen.value = offen.value === i ? null : i;
}

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
    antwort: "Sag beim Bezahlen am Empfang Bescheid. Wir ziehen dein Guthaben direkt von deinem Betrag ab, an allen Standorten.",
  },
  {
    frage: "Wie lange gilt mein Guthaben?",
    antwort: `Alles Guthaben, das wir dir schenken, ist ${CLUB.bonusGueltigMonate} Monate ab der Gutschrift gültig, auch der Beauty-Bonus. Warst du ${CLUB.verfallOhneBesuchMonate} Monate nicht bei uns, verfällt das geschenkte Guthaben. Guthaben, das du ins Beauty-Sparbuch einzahlst, ist unbegrenzt gültig.`,
  },
  {
    frage: "Kann ich mir Guthaben auszahlen lassen?",
    antwort: "Nein. Dein Guthaben löst du für Behandlungen und Produkte bei uns ein. Ausgezahlt wird es nicht.",
  },
  {
    frage: "Ich hatte Punkte im alten MY Club. Was ist damit?",
    antwort: `Deine Punkte sind jetzt Guthaben in Euro (${CLUB.loloyalPunkteJeEuro} Punkte = 1 €). Melde dich in der App an und gib dabei dieselbe E-Mail-Adresse an, die du früher im Shop hattest. Dann ist dein Guthaben sofort da.`,
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
