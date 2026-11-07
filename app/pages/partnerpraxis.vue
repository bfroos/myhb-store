<template>
  <div class="pp">
    <section class="pp__hero">
      <div class="pp__breite pp__heroRaster">
        <div class="pp__heroText">
        <p class="pp__eyebrow">Partnerprogramm für Ärzte</p>
        <h1>Deine eigene Privatpraxis für ästhetische Medizin. Mit allem, was dazugehört!</h1>
        <p class="pp__lead">
          Du willst dich als Arzt in der Ästhetik selbstständig machen? Eröffne deine Praxis als
          Partner von MY HEALTH & BEAUTY. Marke, Website, Software und Einkauf kommen fertig von uns.
          Du kümmerst dich um deine Kunden, wir kümmern uns um den Rest.
        </p>
        <div class="pp__knoepfe">
          <a href="#bewerbung" class="pp__knopf" @click="klick('hero')">Jetzt bewerben</a>
          <a href="#leistungen" class="pp__knopf pp__knopf--rand">Alle Vorteile ansehen</a>
        </div>
        </div>
        <img class="pp__heroBild" :src="BILDER.team.src" :alt="BILDER.team.alt" :width="BILDER.team.width" :height="BILDER.team.height" fetchpriority="high">
        <ul class="pp__fakten pp__vollbreit" role="list">
          <li><strong>9 Städte</strong><span>mit Standorten von MY</span></li>
          <li><strong>Nur Ärzte</strong><span>behandeln bei uns</span></li>
          <li><strong>Eigene Software</strong><span>für den ganzen Praxisalltag</span></li>
          <li><strong>5 Werktage</strong><span>bis du von uns hörst</span></li>
        </ul>
      </div>
    </section>

    <section class="pp__abschnitt">
      <div class="pp__breite pp__zwei">
        <div>
          <p class="pp__eyebrow">Dein Alltag</p>
          <h2>Du behandelst deine Patienten, wir kümmern uns um den Papierkram!</h2>
          <img class="pp__bild" :src="BILDER.beratung.src" :alt="BILDER.beratung.alt" :width="BILDER.beratung.width" :height="BILDER.beratung.height" loading="lazy">
        </div>
        <div class="pp__text">
          <p>
            Wer eine eigene Praxis gründet, ist schnell mehr Unternehmer als Arzt: Website,
            Termine, Personal, Lohn, Buchhaltung, Lager, Bestellungen und Marketing.
          </p>
          <p>
            Als Partnerpraxis von MY nehmen wir dir das Meiste davon ab. Du sorgst dafür, dass deine
            Praxis einladend und sauber ist, dein Team herzlich und jeder Kunde bestens behandelt wird.
            <strong>Medizinische Entscheidungen triffst nur du.</strong>
          </p>
        </div>
      </div>
    </section>

    <section id="leistungen" class="pp__abschnitt pp__abschnitt--hell">
      <div class="pp__breite">
        <p class="pp__eyebrow">Immer inklusive</p>
        <h2>Alles, was deine Praxis vom ersten Tag an braucht</h2>
        <p class="pp__text pp__text--schmal">
          Diese vier Bausteine hat jede Partnerpraxis. So erlebt jeder Kunde überall dieselbe
          Qualität, und du startest nicht bei null.
        </p>
        <img class="pp__band" :src="BILDER.empfang.src" :alt="BILDER.empfang.alt" :width="BILDER.empfang.width" :height="BILDER.empfang.height" loading="lazy">
        <ul class="pp__karten" role="list">
          <li v-for="(k, i) in FUNDAMENT" :key="k.titel" class="pp__karte">
            <span class="pp__nummer">{{ i + 1 }}</span>
            <h3>{{ k.titel }}</h3>
            <p>{{ k.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section class="pp__abschnitt">
      <div class="pp__breite">
        <div class="pp__zwei pp__zwei--bild">
          <div>
            <p class="pp__eyebrow">Automatisch</p>
            <h2>Weniger Bürokratie, mehr Zeit für deine Kunden!</h2>
            <ul class="pp__liste" role="list">
              <li v-for="k in AUTOMATISIERUNG" :key="k.titel">
                <strong>{{ k.titel }}</strong>
                <span>{{ k.text }}</span>
              </li>
            </ul>
          </div>
          <img class="pp__bild" :src="BILDER.software.src" :alt="BILDER.software.alt" :width="BILDER.software.width" :height="BILDER.software.height" loading="lazy">
        </div>
      </div>
    </section>

    <section class="pp__abschnitt pp__abschnitt--puder">
      <div class="pp__breite">
        <p class="pp__eyebrow">Zusatzpakete</p>
        <h2>Wir nehmen dir den Alltag ab</h2>
        <p class="pp__text pp__text--schmal">
          Du buchst nur, was du brauchst. Und kannst jederzeit Pakete dazunehmen.
        </p>
        <ul class="pp__karten pp__karten--drei" role="list">
          <li v-for="k in PAKETE" :key="k.titel" class="pp__karte">
            <h3>{{ k.titel }}</h3>
            <p>{{ k.text }}</p>
          </li>
        </ul>
        <p class="pp__hinweis">{{ PAKETE_HINWEIS }}</p>
      </div>
    </section>

    <section class="pp__abschnitt">
      <div class="pp__breite">
        <p class="pp__eyebrow">Dein Standort</p>
        <h2>Neu gründen oder übernehmen: drei Wege zu deiner eigenen Praxis</h2>
        <img class="pp__band" :src="BILDER.lounge.src" :alt="BILDER.lounge.alt" :width="BILDER.lounge.width" :height="BILDER.lounge.height" loading="lazy">
        <ul class="pp__karten pp__karten--drei" role="list">
          <li v-for="k in STANDORT_WEGE" :key="k.titel" class="pp__karte pp__karte--rand">
            <h3>{{ k.titel }}</h3>
            <p>{{ k.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section id="ausbildung" class="pp__abschnitt pp__abschnitt--hell">
      <div class="pp__breite pp__zwei pp__zwei--bild">
        <img class="pp__bild" :src="BILDER.aerzte.src" :alt="BILDER.aerzte.alt" :width="BILDER.aerzte.width" :height="BILDER.aerzte.height" loading="lazy">
        <div>
          <p class="pp__eyebrow">Ausbildung</p>
          <h2>{{ AUSBILDUNG.titel }}</h2>
          <p class="pp__text">{{ AUSBILDUNG.text }}</p>
          <ul class="pp__liste" role="list">
            <li v-for="p in AUSBILDUNG.punkte" :key="p"><span>{{ p }}</span></li>
          </ul>
          <div class="pp__karte pp__karte--rand pp__qualitaet">
            <h3>{{ QUALITAET.titel }}</h3>
            <p>{{ QUALITAET.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="pp__abschnitt pp__abschnitt--dunkel">
      <div class="pp__breite pp__zwei">
        <div>
          <p class="pp__eyebrow">Wen wir suchen</p>
          <h2>Ärzte mit Leidenschaft für Ästhetik</h2>
        </div>
        <ul class="pp__haekchen" role="list">
          <li v-for="z in WEN_WIR_SUCHEN" :key="z">{{ z }}</li>
        </ul>
      </div>
    </section>

    <section class="pp__abschnitt">
      <div class="pp__breite">
        <p class="pp__eyebrow">So geht es weiter</p>
        <h2>In 6 Schritten zur eigenen Praxis</h2>
        <ol class="pp__schritte">
          <li v-for="k in SCHRITTE" :key="k.titel">
            <strong>{{ k.titel }}</strong>
            <span>{{ k.text }}</span>
          </li>
        </ol>
      </div>
    </section>

    <section class="pp__abschnitt pp__abschnitt--hell">
      <div class="pp__breite">
        <PartnerApplicationForm />
      </div>
    </section>

    <section class="pp__abschnitt">
      <div class="pp__breite">
        <p class="pp__eyebrow">Gut zu wissen</p>
        <h2>Selbstständig in der ästhetischen Medizin: Fragen und Antworten</h2>
        <div class="pp__fragen">
          <details v-for="f in FRAGEN" :key="f.frage" @toggle="frageGeoeffnet($event, f.frage)">
            <summary>{{ f.frage }}</summary>
            <p>{{ f.antwort }}</p>
          </details>
        </div>
      </div>
    </section>

    <section class="pp__abschnitt pp__abschnitt--dunkel pp__mitte">
      <div class="pp__breite">
        <h2>Bereit für deine eigene Praxis?</h2>
        <p class="pp__text">Die Bewerbung dauert nur 3 Minuten. Wir freuen uns sehr auf dich!</p>
        <a href="#bewerbung" class="pp__knopf pp__knopf--hell" @click="klick('ende')">Jetzt bewerben</a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * Landingpage Partnerprogramm fuer Aerzte (E32, bfroos/myhb-store#403).
 *
 * Inhalte fest im Code (shared/partnerProgramm.ts) statt in Strapi: Die Seite
 * ist ein Entwurf, den Benjamin ohne Redaktion aendern laesst, und Strapi-
 * Eintraege anlegen braucht jedes Mal seine Freigabe. Nur auf Deutsch
 * (nuxt.config i18n.pages), denn die Zielgruppe sind Aerzte in Deutschland.
 *
 * Pfad /partnerpraxis, nicht /partner: dort liegen die Adcell-Banner.
 * partner.myhealthandbeauty.com leitet per 301 hierher (vercel.json, #404):
 * die Seite erbt so die Staerke der Hauptdomain bei Google.
 */
import {
  AUSBILDUNG,
  AUTOMATISIERUNG,
  BILDER,
  FRAGEN,
  FUNDAMENT,
  PAKETE,
  PAKETE_HINWEIS,
  PARTNER_PATH,
  PARTNER_SEO,
  QUALITAET,
  SCHRITTE,
  STANDORT_WEGE,
  WEN_WIR_SUCHEN,
  partnerFaqSchema,
  partnerServiceSchema,
} from "#shared/partnerProgramm";

const config = useRuntimeConfig();
const { trackEvent } = useGoogleAnalytics();
const siteUrl = ((config.public.publicUrl as string) || "https://www.myhealthandbeauty.com").replace(/\/$/, "");

useHead({
  title: PARTNER_SEO.title,
  link: [{ rel: "canonical", href: `${siteUrl}${PARTNER_PATH}` }],
  meta: [
    { name: "description", content: PARTNER_SEO.description },
    { property: "og:title", content: PARTNER_SEO.title },
    { property: "og:description", content: PARTNER_SEO.description },
    { property: "og:url", content: `${siteUrl}${PARTNER_PATH}` },
    { property: "og:type", content: "website" },
  ],
});
useSchemaOrg(computed(() => partnerFaqSchema()));
useSchemaOrg(computed(() => partnerServiceSchema(siteUrl)));

function klick(wo: string) {
  trackEvent("partner_cta_click", { event_category: "engagement", position: wo });
}

function frageGeoeffnet(e: Event, frage: string) {
  if ((e.target as HTMLDetailsElement)?.open) {
    trackEvent("faq_open", { event_category: "engagement", faq_question: frage, page: "partner" });
  }
}
</script>

<style src="~/assets/css/partner-seite.css"></style>
