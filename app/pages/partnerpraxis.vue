<template>
  <div class="pp">
    <section class="pp__hero">
      <div class="pp__breite">
        <p class="pp__eyebrow">Partnerprogramm für Ärzte</p>
        <h1>Deine eigene Praxis für ästhetische Medizin. Mit allem, was dazugehört.</h1>
        <p class="pp__lead">
          Du willst dich als Arzt in der Ästhetik selbstständig machen? Eröffne deine Praxis als
          Partner von MY HEALTH & BEAUTY. Marke, Website, Software und Einkauf bekommst du fertig von
          uns. Du kümmerst dich um deine Kunden, wir um den Rest.
        </p>
        <div class="pp__knoepfe">
          <a href="#bewerbung" class="pp__knopf" @click="klick('hero')">Jetzt bewerben</a>
          <a href="#leistungen" class="pp__knopf pp__knopf--rand">Was du bekommst</a>
        </div>
        <ul class="pp__fakten" role="list">
          <li><strong>9 Städte</strong><span>MYHB-Standorte in Deutschland</span></li>
          <li><strong>Nur Ärzte</strong><span>behandeln bei uns</span></li>
          <li><strong>Eigene Software</strong><span>von der Buchung bis zur Inventur</span></li>
          <li><strong>5 Werktage</strong><span>bis zu unserer Antwort</span></li>
        </ul>
      </div>
    </section>

    <section class="pp__abschnitt">
      <div class="pp__breite pp__zwei">
        <div>
          <p class="pp__eyebrow">Das Ziel</p>
          <h2>Morgens kommen, gut behandeln, abends nach Hause gehen.</h2>
        </div>
        <div class="pp__text">
          <p>
            Wer heute eine ästhetische Praxis gründet, ist schnell mehr Unternehmer als Arzt:
            Website, Terminbuchung, Personal, Lohn, Buchhaltung, Lager, Bestellungen, Marketing.
          </p>
          <p>
            Als Partnerpraxis von MY HEALTH & BEAUTY nehmen wir dir einen großen Teil davon ab. Deine
            Aufgabe ist, dass deine Praxis gut aussieht, dein Team freundlich ist und jeder Kunde
            sorgfältig behandelt wird. <strong>Medizinische Entscheidungen triffst nur du.</strong>
          </p>
        </div>
      </div>
    </section>

    <section id="leistungen" class="pp__abschnitt pp__abschnitt--hell">
      <div class="pp__breite">
        <p class="pp__eyebrow">Immer dabei</p>
        <h2>Das Fundament jeder Partnerpraxis</h2>
        <p class="pp__text pp__text--schmal">
          Diese vier Bausteine nutzt jede Partnerpraxis. So erlebt jeder Kunde an jedem Standort
          dieselbe Qualität, und du startest nicht bei null.
        </p>
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
        <p class="pp__eyebrow">Automatisierung</p>
        <h2>Weniger Telefon, weniger Ausfälle, mehr Zeit für Kunden</h2>
        <ul class="pp__liste" role="list">
          <li v-for="k in AUTOMATISIERUNG" :key="k.titel">
            <strong>{{ k.titel }}</strong>
            <span>{{ k.text }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="pp__abschnitt pp__abschnitt--puder">
      <div class="pp__breite">
        <p class="pp__eyebrow">Nach Bedarf</p>
        <h2>Zusatzpakete, die dir den Alltag abnehmen</h2>
        <p class="pp__text pp__text--schmal">
          Du buchst nur, was du brauchst, und kannst Pakete später dazunehmen.
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
        <h2>Drei Wege zu deiner Praxis</h2>
        <ul class="pp__karten pp__karten--drei" role="list">
          <li v-for="k in STANDORT_WEGE" :key="k.titel" class="pp__karte pp__karte--rand">
            <h3>{{ k.titel }}</h3>
            <p>{{ k.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section class="pp__abschnitt pp__abschnitt--dunkel">
      <div class="pp__breite pp__zwei">
        <div>
          <p class="pp__eyebrow">Wen wir suchen</p>
          <h2>Ärzte, die Ästhetik ernst nehmen</h2>
        </div>
        <ul class="pp__haekchen" role="list">
          <li v-for="z in WEN_WIR_SUCHEN" :key="z">{{ z }}</li>
        </ul>
      </div>
    </section>

    <section class="pp__abschnitt">
      <div class="pp__breite">
        <p class="pp__eyebrow">So geht es weiter</p>
        <h2>In fünf Schritten zur eigenen Praxis</h2>
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
        <p class="pp__eyebrow">Häufige Fragen</p>
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
        <p class="pp__text">Die Bewerbung dauert drei Minuten und verpflichtet dich zu nichts.</p>
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
  AUTOMATISIERUNG,
  FRAGEN,
  FUNDAMENT,
  PAKETE,
  PAKETE_HINWEIS,
  PARTNER_PATH,
  PARTNER_SEO,
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
