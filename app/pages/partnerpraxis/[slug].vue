<template>
  <div v-if="artikel" class="pp rg">
    <section class="pp__abschnitt rg__kopf">
      <div class="pp__breite">
        <nav class="rg__pfad" aria-label="Breadcrumb">
          <NuxtLink :to="RATGEBER_BASIS">Partnerprogramm für Ärzte</NuxtLink>
          <span aria-hidden="true"> › </span>
          <span>{{ artikel.kurz }}</span>
        </nav>
        <p class="pp__eyebrow">Ratgeber für Ärzte</p>
        <h1>{{ artikel.h1 }}</h1>
        <p class="pp__lead">{{ artikel.einleitung }}</p>
        <div class="rg__kurz">
          <strong>Kurz gesagt</strong>
          <p>{{ artikel.kurzGesagt }}</p>
        </div>
      </div>
    </section>

    <section v-for="(ab, i) in artikel.abschnitte" :key="ab.titel" class="pp__abschnitt rg__abschnitt" :class="{ 'pp__abschnitt--hell': i % 2 === 0 }">
      <div class="pp__breite rg__inhalt">
        <h2>{{ ab.titel }}</h2>
        <div v-if="ab.tabelle" class="rg__tabelle">
          <table>
            <thead>
              <tr><th v-for="(z, j) in ab.tabelle[0]" :key="j" scope="col">{{ z }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="(zeile, k) in ab.tabelle.slice(1)" :key="k">
                <td v-for="(z, j) in zeile" :key="j">{{ z }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-for="(p, j) in ab.absaetze ?? []" :key="j" class="pp__text">{{ p }}</p>
        <ul v-if="ab.liste" class="pp__haekchen rg__liste" role="list">
          <li v-for="l in ab.liste" :key="l">{{ l }}</li>
        </ul>
      </div>
    </section>

    <section class="pp__abschnitt pp__abschnitt--dunkel pp__mitte">
      <div class="pp__breite">
        <p class="pp__eyebrow">Partnerprogramm</p>
        <h2>Eigene Praxis, ohne bei null anzufangen</h2>
        <p class="pp__text">
          Eröffne deine Praxis als Partner von MY HEALTH & BEAUTY. Marke, Website, Software und
          Einkauf kommen fertig von uns. Wer noch Erfahrung sammeln will, lernt vorher an unseren Standorten.
        </p>
        <NuxtLink :to="RATGEBER_BASIS" class="pp__knopf pp__knopf--hell" @click="klick">Partnerprogramm ansehen</NuxtLink>
      </div>
    </section>

    <section class="pp__abschnitt">
      <div class="pp__breite">
        <h2>Fragen und Antworten</h2>
        <div class="pp__fragen">
          <details v-for="f in artikel.fragen" :key="f.frage">
            <summary>{{ f.frage }}</summary>
            <p>{{ f.antwort }}</p>
          </details>
        </div>
      </div>
    </section>

    <section class="pp__abschnitt pp__abschnitt--hell">
      <div class="pp__breite">
        <h2>Weitere Ratgeber für die eigene Praxis</h2>
        <ul class="pp__karten pp__karten--drei" role="list">
          <li v-for="a in weitere" :key="a.slug" class="pp__karte">
            <h3><NuxtLink :to="ratgeberPfad(a.slug)">{{ a.h1 }}</NuxtLink></h3>
            <p>{{ a.beschreibung }}</p>
          </li>
        </ul>
        <div class="rg__quellen">
          <h2>Quellen</h2>
          <ul>
            <li v-for="q in artikel.quellen" :key="q.url">
              <a :href="q.url" target="_blank" rel="noopener">{{ q.titel }}</a>
            </li>
          </ul>
          <p>Stand: {{ RATGEBER_STAND }}. Dieser Ratgeber ersetzt keine Rechts- oder Steuerberatung.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * Ratgeber-Seiten fuer Aerzte (E32, bfroos/myhb-store#435), z. B.
 * /partnerpraxis/privatpraxis-eroeffnen. Inhalte fest im Code
 * (shared/partnerRatgeber.ts), wie die Partnerseite selbst. Nur Deutsch.
 */
import {
  RATGEBER,
  RATGEBER_BASIS,
  RATGEBER_STAND,
  findeRatgeber,
  ratgeberPfad,
  ratgeberSchema,
} from "#shared/partnerRatgeber";

const route = useRoute();
const artikel = computed(() => findeRatgeber(String(route.params.slug)));
if (!artikel.value) {
  throw createError({ statusCode: 404, statusMessage: "Ratgeber nicht gefunden", fatal: true });
}

const weitere = computed(() => RATGEBER.filter((a) => a.slug !== artikel.value?.slug));

const config = useRuntimeConfig();
const { trackEvent } = useGoogleAnalytics();
const siteUrl = ((config.public.publicUrl as string) || "https://www.myhealthandbeauty.com").replace(/\/$/, "");
const url = computed(() => `${siteUrl}${ratgeberPfad(artikel.value!.slug)}`);

useHead(() => ({
  title: artikel.value!.seoTitel,
  link: [{ rel: "canonical", href: url.value }],
  meta: [
    { name: "description", content: artikel.value!.beschreibung },
    { property: "og:title", content: artikel.value!.seoTitel },
    { property: "og:description", content: artikel.value!.beschreibung },
    { property: "og:url", content: url.value },
    { property: "og:type", content: "article" },
  ],
}));
useSchemaOrg(computed(() => ratgeberSchema(artikel.value!, siteUrl)));

function klick() {
  trackEvent("partner_cta_click", { event_category: "engagement", position: `ratgeber:${artikel.value?.slug}` });
}
</script>

<style src="~/assets/css/partner-seite.css"></style>
<style>
.rg__kopf { padding-bottom: 24px; }
.rg__pfad { font-size: 14px; margin-bottom: 16px; color: var(--pp-text); }
.rg__pfad a { color: inherit; text-decoration: underline; }
.rg h1 { max-width: 860px; }
.rg .pp__lead { max-width: 760px; }
.rg__kurz {
  margin-top: 24px;
  max-width: 760px;
  padding: 20px 24px;
  border-left: 4px solid currentColor;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 0 12px 12px 0;
}
.rg__kurz p { margin: 6px 0 0; line-height: 1.65; }
.rg__inhalt { max-width: 860px; }
.rg__inhalt .pp__text { max-width: none; }
.rg__liste { margin-top: 12px; }
.rg__tabelle { overflow-x: auto; margin: 16px 0; }
.rg__tabelle table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; font-size: 15px; }
.rg__tabelle th, .rg__tabelle td { text-align: left; padding: 12px 14px; border-bottom: 1px solid var(--pp-linie); vertical-align: top; }
.rg__tabelle th { font-weight: 700; }
.rg__tabelle tr:last-child td { border-bottom: 0; }
.rg .pp__karte h3 a { color: inherit; text-decoration: none; }
.rg .pp__karte h3 a:hover { text-decoration: underline; }
.rg__quellen { margin-top: 40px; font-size: 14px; }
.rg__quellen h2 { font-size: 18px; }
.rg__quellen a { color: inherit; text-decoration: underline; }
</style>
