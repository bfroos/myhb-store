<template>
  <div class="cl">
    <div class="cl__blatt">
      <section class="cl__hero">
        <div class="cl__heroBild" role="img" aria-label="Behandlung bei MY HEALTH & BEAUTY" style="background-image: url('/img/club/hero.jpg')" />
        <div class="cl__heroText">
          <p class="cl__eyebrow">Beauty-Sparbuch · Teil vom MY Club</p>
          <h1>Du findest Ratenzahlung und Gebühren doof? Dann haben wir was für dich.</h1>
          <p class="cl__lead">
            Spare für deine Wunschbehandlung: ab {{ euro(SPARBUCH.mindestRate) }} im Monat,
            ohne zusätzliche Gebühren. Du erhältst jeden Monat einen Beauty-Bonus:
            {{ prozent(basis.sparbuchBonusProzent) }} im Jahr und als Statuskunde sogar bis zu
            {{ prozent(hoechste.sparbuchBonusProzent) }} Bonus.
          </p>
          <div class="cl__knoepfe">
            <a class="cl__knopf" :href="appUrl('sparbuch-seite', 'sparbuch')" @click="trackClick('sparbuch-seite', 'app')">
              Sparplan starten
            </a>
          </div>
          <p class="cl__klein">{{ prozent(basis.sparbuchBonusProzent) }} {{ SPARBUCH_PFLICHTSATZ }}</p>
        </div>
      </section>

      <section class="cl__band" aria-label="Das Beauty-Sparbuch in Zahlen">
        <div class="cl__bandRaster">
          <div>
            <p class="cl__bandZahl">{{ euro(SPARBUCH.mindestRate) }}</p>
            <p class="cl__bandText">im Monat reichen<br>für den Anfang</p>
          </div>
          <div>
            <p class="cl__bandZahl">{{ basis.sparbuchBonusProzent }}–{{ prozent(hoechste.sparbuchBonusProzent) }}</p>
            <p class="cl__bandText">Beauty-Bonus im Jahr,<br>jeden Monat gutgeschrieben</p>
          </div>
          <div>
            <p class="cl__bandZahl">0&nbsp;€</p>
            <p class="cl__bandText">Gebühren</p>
          </div>
          <div>
            <p class="cl__bandZahl">nie</p>
            <p class="cl__bandText">verfällt dein<br>eingezahltes Geld</p>
          </div>
        </div>
      </section>

      <section class="cl__abschnitt">
        <p class="cl__eyebrow">Andersrum ist besser</p>
        <h2>Erst zurücklegen, dann genießen</h2>
        <div class="cl__zwei">
          <div class="cl__box">
            <p class="cl__eyebrow">Ratenzahlung</p>
            <p class="cl__text">Erst behandeln, danach monatlich abzahlen.</p>
            <ul class="cl__liste">
              <li>Oft kommen Gebühren und Kreditkosten dazu. Am Ende zahlst du mehr, als die Behandlung kostet.</li>
              <li>Vorher wird geprüft, ob du den Kredit bekommst, oft mit Abfrage bei der Schufa.</li>
              <li>Du zahlst noch ab, wenn die Behandlung längst vorbei ist.</li>
            </ul>
          </div>
          <div class="cl__box cl__box--puder">
            <p class="cl__eyebrow">Beauty-Sparbuch</p>
            <p class="cl__text">Jeden Monat ein bisschen zurücklegen und buchen, wenn das Guthaben reicht.</p>
            <ul class="cl__liste">
              <li>Keine Gebühren, keine Kreditkosten. Jeder Euro, den du einzahlst, ist ein Euro für deine Behandlung.</li>
              <li>Keine Prüfung, keine Schufa. Du startest einfach in der App.</li>
              <li>Jeden Monat kommt ein Beauty-Bonus obendrauf, mit Status bis zu {{ prozent(hoechste.sparbuchBonusProzent) }} im Jahr.</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="cl__abschnitt cl__abschnitt--puder">
        <div class="cl__zwei">
          <div>
            <p class="cl__eyebrow">Warum wir das machen</p>
            <h2>Schönheit ohne Schulden</h2>
            <p class="cl__text">
              Viele unserer Kunden planen ihre Behandlungen über das ganze Jahr. Wir wollen nicht,
              dass jemand dafür einen Kredit aufnimmt oder Gebühren zahlt. Beim Beauty-Sparbuch legst
              du vorher zurück und wir sagen Danke für deine Treue: mit einem Bonus, den du bei uns einlöst.
            </p>
            <p class="cl__text">
              Für dich heißt das: Deine nächste Behandlung ist schon bezahlt, wenn du kommst.
              Für uns: Du kommst wieder. Das ist der ganze Gedanke dahinter.
            </p>
          </div>
          <div class="cl__box">
            <p class="cl__eyebrow">Was das Beauty-Sparbuch ist</p>
            <p class="cl__text">
              Ein Guthaben bei MY HEALTH & BEAUTY, das du im Voraus einzahlst und für Behandlungen
              und Produkte bei uns einlöst. Der Beauty-Bonus ist ein Treuebonus in Form von Guthaben.
            </p>
            <p class="cl__eyebrow">Was es nicht ist</p>
            <p class="cl__text">
              Kein Sparkonto, keine Geldanlage und kein Bankprodukt. Es gibt keine Einlagensicherung,
              und weder dein Guthaben noch der Bonus werden ausgezahlt. Wir sind eine Klinik, keine Bank.
            </p>
          </div>
        </div>
      </section>

      <section class="cl__abschnitt cl__abschnitt--hell">
        <p class="cl__eyebrow">In drei Schritten</p>
        <ol class="cl__schritte">
          <li>
            <span><strong>Betrag wählen.</strong> Ab {{ euro(SPARBUCH.mindestRate) }} im Monat,
              in Schritten von {{ euro(SPARBUCH.schrittRate) }}. Per Lastschrift oder Karte, in der App.</span>
          </li>
          <li><span><strong>Guthaben wächst.</strong> Jeden Monat kommt deine Rate dazu und am Monatsende dein Beauty-Bonus.</span></li>
          <li><span><strong>Einlösen.</strong> Für Behandlungen und Produkte an allen Standorten. Sag am Empfang: „Bitte mit Guthaben.“</span></li>
        </ol>
      </section>

      <section class="cl__abschnitt">
        <div class="cl__zwei">
          <div class="cl__box cl__box--puder">
            <p class="cl__eyebrow">Ein Beispiel</p>
            <p class="cl__boxZahl">+ {{ euro(beispielBasis.bonus) }}</p>
            <p class="cl__text">
              Du legst {{ SPARBUCH.beispielMonate }} Monate lang jeden Monat
              {{ euro(SPARBUCH.beispielRate) }} zurück. Dann hast du
              {{ euro(beispielBasis.eingezahlt) }} Guthaben und rund
              {{ euro(beispielBasis.bonus) }} Beauty-Bonus dazu. Im Status
              {{ hoechste.name }} sind es rund {{ euro(beispielHoechste.bonus) }}.
            </p>
            <p class="cl__klein">
              Jeden Monat ein Zwölftel des Satzes auf dein eingezahltes Guthaben, ohne
              Bonus auf den Bonus.
            </p>
          </div>
          <div class="cl__box">
            <p class="cl__eyebrow">Dein Bonus nach Status</p>
            <div class="cl__tabelle" style="width: 100%">
              <table style="min-width: 0">
                <tbody>
                  <tr v-for="s in STUFEN" :key="s.name">
                    <th scope="row">
                      <span class="cl__stufe" :class="`cl__stufe--${s.name.toLowerCase()}`">{{ s.name }}</span>
                    </th>
                    <td>{{ prozent(s.sparbuchBonusProzent) }} im Jahr</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <NuxtLinkLocale to="/club" class="cl__link" @click="trackClick('sparbuch-seite', 'club')">
              Alle Vorteile im MY Club
            </NuxtLinkLocale>
          </div>
        </div>
      </section>

      <section class="cl__abschnitt cl__abschnitt--hell cl__fragen">
        <p class="cl__eyebrow">Gut zu wissen</p>
        <div>
          <details v-for="f in fragen" :key="f.frage">
            <summary>{{ f.frage }}</summary>
            <p>{{ f.antwort }}</p>
          </details>
        </div>
        <p class="cl__klein">
          Anbieter ist die My Health and Beauty Klinik GmbH. Das Beauty-Sparbuch ist ein
          Vorauszahlungsguthaben. {{ basis.sparbuchBonusProzent }} bis
          {{ prozent(hoechste.sparbuchBonusProzent) }} {{ SPARBUCH_PFLICHTSATZ }}
        </p>
      </section>

      <section class="cl__abschnitt cl__mitte">
        <h2>Deine nächste Behandlung, schon bezahlt.</h2>
        <p class="cl__text">Starte heute mit {{ euro(SPARBUCH.mindestRate) }} im Monat.</p>
        <a class="cl__knopf" :href="appUrl('sparbuch-seite', 'sparbuch')" @click="trackClick('sparbuch-seite', 'app')">Sparplan starten</a>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Landingpage Beauty-Sparbuch, siehe shared/clubSeiten.ts (Wortwahl!). Look
 * wie das Mailing (assets/css/club-seiten.css). Solange NUXT_PUBLIC_CLUB_SEITEN
 * aus ist: noindex und nirgends verlinkt.
 */
import {
  CLUB,
  SPARBUCH,
  SPARBUCH_PFLICHTSATZ,
  STUFEN,
  euro,
  prozent,
  sparbuchBeispiel,
} from "#shared/clubSeiten";

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
    frage: "Was kostet mich das?",
    antwort: "Nichts. Es gibt keine Gebühren, du zahlst nur deine Rate ein.",
  },
  {
    frage: "Wie lange gilt mein Guthaben?",
    antwort: `Guthaben, das du einzahlst, ist unbegrenzt gültig. Der Beauty-Bonus ist geschenktes Guthaben: Er ist ${CLUB.bonusGueltigMonate} Monate ab der Gutschrift gültig, und warst du ${CLUB.verfallOhneBesuchMonate} Monate nicht bei uns, verfällt dein Bonus.`,
  },
  {
    frage: "Wie lange muss ich dabei bleiben?",
    antwort: `Mindestens ${SPARBUCH.mindestlaufzeitMonate} Monate. Danach kannst du jeden Monat kündigen, direkt in der App. Dein Guthaben kannst du ab dem Ende der Mindestlaufzeit einlösen.`,
  },
  {
    frage: "Gibt es eine Obergrenze?",
    antwort: `Ja, ${euro(SPARBUCH.obergrenze)}. Ist sie erreicht, pausiert deine Rate von selbst, bis du wieder etwas einlöst.`,
  },
  {
    frage: "Kann ich mir mein Guthaben auszahlen lassen?",
    antwort: `Nein, weder Guthaben noch Bonus. Ausnahme ist der Widerruf in den ersten ${SPARBUCH.widerrufTage} Tagen: Dann bekommst du deine Rate zurück, der Bonus entfällt.`,
  },
  {
    frage: "Was passiert, wenn ich kündige?",
    antwort: "Dein Guthaben bleibt dir und du kannst es weiter bei uns einlösen.",
  },
];

useHead({
  title: "Beauty-Sparbuch – zurücklegen statt Ratenzahlung | MY Health & Beauty",
  meta: [
    {
      name: "description",
      content:
        "Statt Ratenzahlung: ab 10 € im Monat für deine nächste Behandlung zurücklegen, ohne Gebühren, mit Beauty-Bonus als Guthaben. Nicht auszahlbar, nur bei MY HEALTH & BEAUTY einlösbar.",
    },
    ...(enabled.value ? [] : [{ name: "robots", content: "noindex, nofollow" }]),
  ],
});
</script>

<style src="~/assets/css/club-seiten.css"></style>
