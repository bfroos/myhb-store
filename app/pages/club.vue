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
        <p class="cl__eyebrow">In drei Schritten</p>
        <ol class="cl__schritte">
          <li><span><strong>In der App anmelden.</strong> Kostenlos, mit deiner Mobil-Nummer. Du bist sofort im MY Club.</span></li>
          <li><span><strong>Behandlung genießen.</strong> Dein Cashback wird nach deiner Behandlung automatisch gutgeschrieben.</span></li>
          <li><span><strong>Bei nächster Behandlung einlösen.</strong> Dein Guthaben kannst du ganz einfach vor Ort einlösen.</span></li>
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
        <p class="cl__hinweis cl__hinweis--tabelle">Tipp auf einen Vorteil, dann siehst du, wie er funktioniert.</p>
      </section>

      <section class="cl__abschnitt">
        <div class="cl__zwei">
          <div class="cl__box cl__box--puder">
            <p class="cl__eyebrow">Neu: Beauty-Sparbuch</p>
            <h2>Jetzt für deine nächste Behandlung sparen!</h2>
            <p class="cl__text">
              Spare für deine Wunschbehandlung: ab {{ euro(SPARBUCH.mindestRate) }} im Monat,
              ohne zusätzliche Gebühren, und jeden Monat zusätzlich einen Beauty-Bonus erhalten.
            </p>
            <NuxtLinkLocale to="/beauty-sparbuch" class="cl__knopf cl__knopf--rand" @click="trackClick('club-seite', 'sparbuch')">
              So funktioniert es
            </NuxtLinkLocale>
          </div>
          <div class="cl__box">
            <p class="cl__eyebrow">Weiterempfehlen</p>
            <p class="cl__boxZahl">{{ euro(CLUB.empfehlungEuro) }} + {{ euro(CLUB.empfehlungEuro) }}</p>
            <p class="cl__text">
              Freunde weiterempfehlen: Teile deinen persönlichen Weiterempfehlungslink aus der App. Die empfohlene
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
              <p><strong>Guthaben und Status</strong>Du siehst jederzeit dein Guthaben und was dir bis zum nächsten Status-Level fehlt.</p>
              <p><strong>Buchen, wann du willst</strong>Rund um die Uhr, deine letzte Behandlung einfach wiederholen.</p>
              <p><strong>Erinnerung inklusive</strong>Am Vortag und zwei Stunden vor deinem Termin.</p>
              <p><strong>Dein Behandlungsplan</strong>Dein Arzt bespricht und legt ihn mit dir an, du siehst, welche Behandlung als Nächstes ansteht.</p>
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
import { CLUB, SPARBUCH, SPARBUCH_PFLICHTSATZ, STATUS_FENSTER_MONATE, STUFEN, euro, prozent, sparbuchBeispiel } from "#shared/clubSeiten";
import { SharedButtonAction, SharedButtonMethod } from "~/lib/strapi/dto/enums";

const { t } = useI18n();
const { enabled, appUrl, trackClick } = useClubSeiten();

const ja = (b: boolean) => (b ? "✓" : "–");
// Wortlaut Michael (Mail-Werkstatt 23.10.2026, Seite selbst 04.–06.11.2026). Der Geburtstagsbonus bleibt eine
// Ueberraschung und steht deshalb nicht in der Tabelle (Benjamin 23.10.2026).
const beispiel = sparbuchBeispiel(STUFEN[0]!.sparbuchBonusProzent);
const stufeNamen = (pruef: (s: (typeof STUFEN)[number]) => boolean) => STUFEN.find(pruef)?.name ?? "";

// Erklaerungen zum Aufklappen (Benjamin und Michael 03.11.2026): Jeder Vorteil
// soll nicht nur ein Wort sein, sondern sagen, was er heisst und wie er funktioniert.
const zeilen = [
  {
    name: "Cashback je Besuch",
    werte: STUFEN.map((s) => prozent(s.cashbackProzent)),
    erklaerung: [
      `Nach jeder Behandlung erhältst du automatisch einen Teil als Cashback in deiner App als Guthaben: ${STUFEN.map((s) => `${prozent(s.cashbackProzent)} als ${s.name}`).join(", ")}.`,
      `Beispiel: Du bezahlst 400 € für eine Behandlung. Als GREY bekommst du ${euro((400 * STUFEN[2]!.cashbackProzent) / 100)} Guthaben, als BLACK ${euro((400 * STUFEN[3]!.cashbackProzent) / 100)}.`,
      "Dein Guthaben siehst du sofort in der App. Beim nächsten Besuch kannst du dein Guthaben ganz einfach vor Ort einlösen.",
    ],
  },
  {
    name: "Status-Welcome-Guthaben",
    werte: STUFEN.map((s) => (s.geschenkEuro ? euro(s.geschenkEuro) : "–")),
    erklaerung: [
      `Erreichst du deinen neuen Status, erhältst du einen Welcome-Bonus als Guthaben: ${STUFEN.filter((s) => s.geschenkEuro).map((s) => `${euro(s.geschenkEuro!)} für ${s.name}`).join(", ")}.`,
      `Dein Status richtet sich nach deinem Umsatz in den letzten ${STATUS_FENSTER_MONATE} Monaten. Sobald du den Status erreichst, findest du den Bonus als Guthaben automatisch in deinem Kundenkonto in der App.`,
    ],
  },
  {
    name: "Bonus Beauty-Sparbuch",
    werte: STUFEN.map((s) => `${prozent(s.sparbuchBonusProzent)} im Jahr`),
    erklaerung: [
      `Mit dem Beauty-Sparbuch legst du jeden Monat ab ${euro(SPARBUCH.mindestRate)} für deine nächste Behandlung zurück, ohne zusätzliche Gebühren. Auf dein eingezahltes Guthaben erhältst du jeden Monat einen Beauty-Bonus: ${prozent(STUFEN[0]!.sparbuchBonusProzent)} im Jahr, mit Status Member bis zu ${prozent(STUFEN[STUFEN.length - 1]!.sparbuchBonusProzent)}.`,
      `Beispiel: Du legst ${SPARBUCH.beispielMonate} Monate lang ${euro(SPARBUCH.beispielRate)} je Monat zurück, dann hast du ${euro(beispiel.eingezahlt)} Guthaben und erhältst zusätzlich ${euro(beispiel.bonus)} Beauty-Bonus (bei ${prozent(STUFEN[0]!.sparbuchBonusProzent)}).`,
      "Angelegt wird das Sparbuch in der App.",
      `${prozent(STUFEN[0]!.sparbuchBonusProzent)} ${SPARBUCH_PFLICHTSATZ}`,
    ],
  },
  {
    name: "Sonderaktionen",
    werte: STUFEN.map((s) => ja(s.aktionen)),
    erklaerung: [
      `Ab ${stufeNamen((s) => s.aktionen)}-Statusmember erhältst du exklusive Aktionen für ausgewählte Behandlungen, die es nur für Statuskunden gibt. Wir sagen dir per E-Mail und in der App Bescheid, sobald eine Aktion läuft.`,
    ],
  },
  {
    name: "Priority Booking: Wunscharzt wählen",
    werte: STUFEN.map((s) => ja(s.wunscharzt)),
    erklaerung: [
      `Ab dem ${stufeNamen((s) => s.wunscharzt)}-Status kannst du deinen Termin direkt bei deinem Wunscharzt buchen. In der App siehst du, an welchen Tagen er an deinem Standort verfügbar ist, und kannst ihn für die Behandlung auswählen.`,
    ],
  },
  {
    name: "Priority Support",
    werte: STUFEN.map((s) => ja(s.bevorzugterService)),
    erklaerung: [
      `Ab dem ${stufeNamen((s) => s.bevorzugterService)}-Status wirst du bei Fragen priorisiert behandelt: Deine Anfragen an unseren Kundenservice, ob per Telefon, WhatsApp oder E-Mail, bearbeiten wir bevorzugt.`,
    ],
  },
  {
    name: "Mitgliedskarte in der App",
    werte: STUFEN.map(() => "✓"),
    erklaerung: [
      "In der App hast du deine Mitgliedskarte immer dabei. Darauf siehst du deinen Status, dein Guthaben und wie viel dir bis zum nächsten Status-Level fehlt.",
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
    antwort: "In der MY App. Dort findest du dein Guthaben, deinen Status und wie viel dir bis zum nächsten Status-Level noch fehlt.",
  },
  {
    frage: "Wie löse ich mein Guthaben ein?",
    antwort: "Gib uns bei der Bezahlung einfach Bescheid. Das Guthaben wird von deinem Behandlungsbetrag abgezogen, an allen Standorten.",
  },
  {
    frage: "Wie lange gilt mein Guthaben?",
    antwort: `Das Guthaben, das wir dir schenken, ist ${CLUB.bonusGueltigMonate} Monate ab der Gutschrift gültig, auch der Beauty-Bonus. Hast du ${CLUB.verfallOhneBesuchMonate} Monate keine Behandlung gemacht, verfällt dein kostenloses Guthaben. Guthaben, das du in dein Beauty-Sparbuch eingezahlt hast, ist unbegrenzt gültig.`,
  },
  {
    frage: "Kann ich mir Guthaben auszahlen lassen?",
    antwort: "Nein. Guthaben gilt ausschließlich für Behandlungen und Produkte bei uns, es kann nicht ausgezahlt werden.",
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
        "Das Treueprogramm von MY HEALTH & BEAUTY: kostenlos in der App anmelden, bei jedem Besuch 1 bis 3 % Cashback, Geschenke und den Status WHITE, GREY und BLACK.",
    },
    ...(enabled.value ? [] : [{ name: "robots", content: "noindex, nofollow" }]),
  ],
});
</script>

<style src="~/assets/css/club-seiten.css"></style>
