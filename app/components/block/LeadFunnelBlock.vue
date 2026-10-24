<template>
  <div :class="{ 'lp-hero-wrap': istHero }">
    <!-- Vertrauensleiste ueber dem Hero (Michaels Entwurf: Google-Note + Haekchen) -->
    <div v-if="istHero" class="lp-trust">
      <UiMoleculeReviewsBadge :source="ReviewSource.GOOGLE" :rating="5" />
      <span v-for="item in trustListe" :key="item" class="lp-trust__item">
        <IconCircleCheck size="18" aria-hidden="true" />{{ item }}
      </span>
    </div>

    <section :class="istHero ? ['lp-hero', 'theme-strong', { 'lp-hero--ohne-bild': !heroImage && !ersatzBild }] : 'lp-plain'">
      <!-- Hero-Text links -->
      <div v-if="istHero" class="lp-hero__text">
        <p v-if="eyebrow" class="lp-hero__eyebrow">{{ eyebrow }}</p>
        <h1 class="lp-hero__headline">{{ heroHeadline || headline }}</h1>
        <p v-if="heroText" class="lp-hero__lead">{{ heroText }}</p>
        <ul v-if="checkListe.length" class="lp-hero__checks" role="list">
          <li v-for="c in checkListe" :key="c"><IconCheck size="20" aria-hidden="true" />{{ c }}</li>
        </ul>
      </div>

      <div :class="istHero ? 'lp-hero__side' : ''">
        <!-- Formular-Karte -->
        <div :id="anchorId" class="funnel" aria-live="polite">
          <div class="funnel__head">
            <h2 class="funnel__title">{{ headline || "Kostenlose Analyse" }}</h2>
            <span class="funnel__count">{{ gesendet ? "Fertig" : `Schritt ${schritt + 1} von ${gesamt}` }}</span>
          </div>
          <div class="funnel__bar" role="progressbar" :aria-valuenow="gesendet ? gesamt : schritt + 1" aria-valuemin="1" :aria-valuemax="gesamt">
            <div class="funnel__bar-fill" :style="{ width: `${((gesendet ? gesamt : schritt + 1) / gesamt) * 100}%` }" />
          </div>

          <!-- Danke + erste Einschaetzung -->
          <div v-if="gesendet" class="funnel__danke">
            <IconCircleCheck size="44" class="funnel__danke-icon" aria-hidden="true" />
            <h3 class="funnel__danke-titel">{{ thankYouHeadline || `Vielen Dank${vorname ? ", " + vorname : ""}!` }}</h3>
            <p class="funnel__text">
              {{ thankYouText || "Wir melden uns innerhalb von 24 Stunden bei dir, so wie du es dir gewünscht hast." }}
            </p>
            <div v-if="einschaetzung.length" class="funnel__ergebnis">
              <p class="funnel__ergebnis-titel">{{ resultTitle || "Deine erste Einschätzung" }}</p>
              <p v-for="e in einschaetzung" :key="e.frage"><strong>{{ e.frage }}:</strong> {{ e.text }}</p>
              <p class="funnel__ergebnis-hinweis">{{ resultNote || "Die endgültige Einschätzung erfolgt immer ärztlich." }}</p>
            </div>
          </div>

          <!-- Fragen -->
          <div v-else-if="aktuelleFrage" class="funnel__schritt">
            <p class="funnel__frage">{{ aktuelleFrage.question }}</p>
            <div class="funnel__optionen" :class="`funnel__optionen--${optionenLayout(aktuelleFrage)}`">
              <button
                v-for="option in aktuelleFrage.options ?? []"
                :key="option.label"
                type="button"
                class="funnel__option"
                :class="{
                  'funnel__option--aktiv': antworten[schritt] === option.label,
                  'funnel__option--bild': !!option.image || !!funnelIllustration(option.illustration),
                }"
                @click="waehle(option.label)"
              >
                <UiAtomMediaPicture v-if="option.image" :media="option.image" class="funnel__option-bild" loading="lazy" />
                <span v-else-if="funnelIllustration(option.illustration)" class="funnel__option-illu">
                  <svg width="96" height="96" viewBox="0 0 100 100" aria-hidden="true">
                    <circle cx="50" cy="50" r="47" fill="#fff" stroke="var(--color-gray-200)" stroke-width="2" />
                    <circle cx="50" cy="50" r="44" fill="var(--color-gray-100)" />
                    <g :clip-path="`url(#${clipId})`">
                      <path d="M18 100 Q22 82 50 81 Q78 82 82 100 Z" fill="var(--color-gray-200)" />
                      <path v-if="funnelIllustration(option.illustration)!.back" :d="funnelIllustration(option.illustration)!.back" fill="#4A3426" :opacity="funnelIllustration(option.illustration)!.hairOpacity" />
                      <rect x="43" y="66" width="14" height="17" fill="#F1D3B8" />
                      <ellipse cx="30" cy="51" rx="4" ry="7" fill="#F1D3B8" stroke="#D9B596" stroke-width=".8" />
                      <ellipse cx="70" cy="51" rx="4" ry="7" fill="#F1D3B8" stroke="#D9B596" stroke-width=".8" />
                      <ellipse cx="50" cy="46" rx="20.5" ry="27" fill="#F1D3B8" stroke="#D9B596" stroke-width=".8" />
                      <path :d="funnelIllustration(option.illustration)!.hair" fill="#4A3426" :opacity="funnelIllustration(option.illustration)!.hairOpacity" />
                      <path v-if="funnelIllustration(option.illustration)!.skin" :d="funnelIllustration(option.illustration)!.skin" fill="#F1D3B8" />
                      <path d="M40 51 q3.5 2 7 0 M53 51 q3.5 2 7 0" fill="none" stroke="#6B4F3E" stroke-width="1.3" stroke-linecap="round" />
                      <path d="M45.5 64 q4.5 2 9 0" fill="none" stroke="#B87968" stroke-width="1.3" stroke-linecap="round" />
                      <path :d="funnelIllustration(option.illustration)!.arrow" fill="none" stroke="var(--color-black)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                    </g>
                    <defs><clipPath :id="clipId"><circle cx="50" cy="50" r="44" /></clipPath></defs>
                  </svg>
                </span>
                <span class="funnel__option-text">{{ option.label }}</span>
              </button>
            </div>
          </div>

          <!-- Kontakt -->
          <form v-else class="funnel__schritt" novalidate @submit.prevent="absenden">
            <p class="funnel__frage">{{ contactHeadline || "Wohin dürfen wir deine Analyse und dein Angebot senden?" }}</p>
            <label class="funnel__feld">
              <span>Vor- und Nachname</span>
              <input v-model.trim="kontakt.name" type="text" autocomplete="name" required />
            </label>
            <label class="funnel__feld">
              <span>Telefon / WhatsApp</span>
              <input v-model.trim="kontakt.telefon" type="tel" autocomplete="tel" inputmode="tel" />
            </label>
            <label class="funnel__feld">
              <span>E-Mail</span>
              <input v-model.trim="kontakt.email" type="email" autocomplete="email" />
            </label>
            <fieldset class="funnel__wege">
              <legend>Wie sollen wir uns melden?</legend>
              <button
                v-for="weg in KONTAKTWEGE"
                :key="weg.wert"
                type="button"
                class="funnel__weg"
                :class="{ 'funnel__weg--aktiv': kontakt.kontaktweg === weg.wert }"
                :aria-pressed="kontakt.kontaktweg === weg.wert"
                @click="kontakt.kontaktweg = weg.wert"
              >
                {{ weg.label }}
              </button>
            </fieldset>
            <!-- Honeypot: fuer Menschen unsichtbar -->
            <input v-model="kontakt.website" class="funnel__hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <label class="funnel__einwilligung">
              <input v-model="kontakt.einwilligung" type="checkbox" />
              <span>{{ consentText || "Ich willige ein, dass MY HEALTH & BEAUTY mich zu meiner Anfrage kontaktiert. Hinweise in der Datenschutzerklärung; Widerruf jederzeit möglich." }}</span>
            </label>
            <p v-if="fehler" class="funnel__fehler" role="alert">{{ fehler }}</p>
            <UiAtomBaseButton type="submit" size="lg" variant="primary" :disabled="sendet" full-width>
              {{ sendet ? "Wird gesendet …" : submitLabel || "Kostenlose Analyse anfordern" }}
            </UiAtomBaseButton>
          </form>

          <div class="funnel__fuss">
            <button v-if="!gesendet && schritt > 0" type="button" class="funnel__zurueck" @click="schritt--">Zurück</button>
            <button v-else-if="gesendet" type="button" class="funnel__zurueck" @click="neuStarten">Neue Analyse starten</button>
            <span>{{ footnote || "Dauert nur eine Minute und ist unverbindlich." }}</span>
          </div>
        </div>

        <UiAtomMediaPicture
          v-if="istHero && heroImage"
          :media="heroImage"
          class="lp-hero__bild"
          loading="eager"
        />
        <img
          v-else-if="istHero && ersatzBild"
          :src="ersatzBild"
          alt="Arzt von MYHB zeigt auf die kostenlose Analyse"
          class="lp-hero__bild"
          width="800"
          height="856"
          loading="eager"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { IconCheck, IconCircleCheck } from "@tabler/icons-vue";
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import { ReviewSource } from "~/lib/strapi/dto/enums";
import { readWireAttribution } from "~/lib/attribution";
import { useLeadRechner } from "~/composables/useLeadRechner";
import { funnelIllustration } from "#shared/funnelIllustrationen";
import { behandlungDerAnfrage } from "#shared/klinik";

/**
 * Anfrage-Funnel fuer OP-Landingpages (E28, myhb-app/myhb-os#1638).
 * Fragen und Antworten kommen aus Strapi (blocks.lead-funnel). Abgeschickt
 * wird an die eigene Route /api/lead-anfrage (#1637), die an die App
 * weiterleitet; die Anfrage landet im Lead-Board.
 *
 * variant="hero" baut Michaels Entwurf nach (21.10.2026): Vertrauensleiste,
 * dunkler Bereich mit Text links und Formular-Karte rechts, darunter das
 * Freisteller-Bild; Antwort-Kacheln mit Kopf-Illustration; nach dem
 * Absenden eine erste Einschaetzung aus den Hinweisen der Antworten.
 */
type FunnelOption = {
  label: string;
  image?: StrapiMedia | null;
  illustration?: string | null;
  hint?: string | null;
};
type FunnelStep = {
  question: string;
  fieldKey?: string | null;
  layout?: "tiles" | "list" | "grid" | null;
  options?: FunnelOption[];
};

const props = defineProps<{
  headline?: string | null;
  behandlung: string;
  steps?: FunnelStep[];
  contactHeadline?: string | null;
  consentText?: string | null;
  footnote?: string | null;
  submitLabel?: string | null;
  thankYouHeadline?: string | null;
  thankYouText?: string | null;
  anchor?: string | null;
  variant?: "card" | "hero" | null;
  eyebrow?: string | null;
  heroHeadline?: string | null;
  heroText?: string | null;
  checks?: string[] | null;
  trustItems?: string[] | null;
  heroImage?: StrapiMedia | null;
  resultTitle?: string | null;
  resultNote?: string | null;
}>();

// Rueckruf per Anruf ist der Standard (Besprechung 21.10.2026).
const KONTAKTWEGE = [
  { wert: "anruf", label: "Anruf" },
  { wert: "whatsapp", label: "WhatsApp" },
  { wert: "email", label: "E-Mail" },
] as const;

const istHero = computed(() => props.variant === "hero");
// Michaels Kopf zeigt den Arzt neben dem Formular. Solange in Strapi kein
// heroImage hinterlegt ist, nimmt die Haar-Seite den Freisteller aus seinem
// Entwurf (public/lp-bilder, sauber freigestellt 23.10.2026).
const ERSATZ_BILD: Record<string, string> = {
  Haartransplantation: "/lp-bilder/haartransplantation-arzt.webp",
};
const ersatzBild = computed(() => (props.heroImage ? null : ERSATZ_BILD[props.behandlung] ?? null));
const checkListe = computed(() => (Array.isArray(props.checks) ? props.checks.filter(Boolean) : []));
const trustListe = computed(() => (Array.isArray(props.trustItems) ? props.trustItems.filter(Boolean) : []));
const clipId = `funnel-clip-${useId()}`;

const anchorId = computed(() => (props.anchor || "anfrage").replace(/^#/, ""));
const fragen = computed(() => (props.steps ?? []).filter((s) => s.question && s.options?.length));
const gesamt = computed(() => fragen.value.length + 1);
const schritt = ref(0);
const antworten = ref<string[]>([]);
const aktuelleFrage = computed(() => fragen.value[schritt.value] ?? null);

function optionenLayout(f: FunnelStep) {
  if (f.options?.some((o) => o.image || funnelIllustration(o.illustration))) return "grid";
  return f.layout || "list";
}

const kontakt = reactive({
  name: "",
  telefon: "",
  email: "",
  kontaktweg: "anruf" as (typeof KONTAKTWEGE)[number]["wert"],
  einwilligung: false,
  website: "",
});
const sendet = ref(false);
const gesendet = ref(false);
const fehler = ref<string | null>(null);
const vorname = computed(() => kontakt.name.split(" ")[0] ?? "");

/** Hinweise der gewaehlten Antworten (z. B. Graft-Richtwert) fuer die Einschaetzung. */
const einschaetzung = computed(() =>
  fragen.value.flatMap((f, i) => {
    const option = f.options?.find((o) => o.label === antworten.value[i]);
    return option?.hint ? [{ frage: option.label, text: option.hint }] : [];
  }),
);

const { trackEvent } = useGoogleAnalytics();
const rechner = useLeadRechner();
const route = useRoute();

function waehle(label: string) {
  antworten.value[schritt.value] = label;
  trackEvent("lead_funnel_step", {
    behandlung: props.behandlung,
    step: schritt.value + 1,
    question: aktuelleFrage.value?.fieldKey || aktuelleFrage.value?.question,
  });
  schritt.value++;
}

function neuStarten() {
  schritt.value = 0;
  antworten.value = [];
  gesendet.value = false;
  Object.assign(kontakt, { name: "", telefon: "", email: "", einwilligung: false, website: "" });
}

async function absenden() {
  fehler.value = null;
  if (!kontakt.name) return void (fehler.value = "Bitte gib deinen Namen an.");
  if (!kontakt.telefon && !kontakt.email) {
    return void (fehler.value = "Bitte gib eine Telefonnummer oder E-Mail an.");
  }
  if (!kontakt.einwilligung) return void (fehler.value = "Bitte bestätige die Einwilligung.");

  sendet.value = true;
  const behandlung = behandlungDerAnfrage(props.behandlung, antworten.value);
  try {
    await $fetch("/api/lead-anfrage", {
      method: "POST",
      body: {
        behandlung,
        name: kontakt.name,
        telefon: kontakt.telefon,
        email: kontakt.email,
        kontaktweg: kontakt.kontaktweg,
        einwilligung: kontakt.einwilligung,
        website: kontakt.website,
        antworten: fragen.value.map((f, i) => ({ frage: f.question, antwort: antworten.value[i] ?? "" })),
        rechner: rechner.value,
        seite: route.path,
        attribution: readWireAttribution(),
      },
    });
    gesendet.value = true;
    trackEvent("generate_lead", { behandlung, lead_source: "landingpage" });
  } catch (e: any) {
    console.error("[lead-funnel] Senden fehlgeschlagen", e?.statusCode ?? e);
    fehler.value =
      e?.statusCode === 400 && e?.statusMessage
        ? e.statusMessage
        : "Deine Anfrage konnte gerade nicht gesendet werden. Bitte versuch es gleich noch einmal oder ruf uns an.";
  } finally {
    sendet.value = false;
  }
}
</script>

<style scoped>
/* ---------- Hero (Michaels Aufbau in unserem Design) ---------- */
.lp-hero-wrap { display: flex; flex-direction: column; gap: var(--space-300, 12px); }
.lp-trust {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  gap: var(--space-300, 12px) var(--space-700, 32px);
  padding: var(--space-400, 16px) var(--space-500, 20px);
  background: var(--color-white); border-radius: var(--border-radius-card-sm);
  font-size: var(--font-sm); font-weight: var(--font-bold);
}
.lp-trust__item { display: inline-flex; align-items: center; gap: 8px; }
.lp-hero {
  display: grid; gap: var(--space-700, 32px);
  background: var(--card-color-bg); color: var(--card-color-text, #fff);
  border-radius: var(--border-radius-card);
  padding: var(--space-card-pad-xs) var(--space-card-pad-xs) 0;
  overflow: hidden;
}
.lp-hero--ohne-bild { padding-bottom: var(--space-card-pad-xs); }
.lp-hero__text { display: flex; flex-direction: column; gap: var(--space-500, 20px); }
.lp-hero__eyebrow { margin: 0; font-size: var(--font-sm); letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-gray-400); }
.lp-hero__headline { margin: 0; font-size: var(--font-5xl); line-height: var(--line-5xl); font-weight: var(--font-bold); letter-spacing: -0.01em; }
.lp-hero__lead { margin: 0; font-size: var(--font-lg); line-height: var(--line-lg); color: var(--color-gray-300); max-width: 34rem; }
.lp-hero__checks { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; }
.lp-hero__checks li { display: flex; gap: 12px; align-items: center; }
.lp-hero__side { display: flex; flex-direction: column; align-items: center; }
.lp-hero__bild {
  display: block; width: 100%; max-width: 420px; margin-top: var(--space-600, 24px);
  -webkit-mask-image: linear-gradient(to bottom, #000 82%, transparent);
  mask-image: linear-gradient(to bottom, #000 82%, transparent);
}
.lp-hero__bild :deep(img) { width: 100%; height: auto; display: block; }
@media (min-width: 1024px) {
  .lp-hero {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: var(--space-900, 56px);
    padding: var(--space-900, 56px) var(--space-900, 56px) 0;
    align-items: start;
  }
  .lp-hero--ohne-bild { padding-bottom: var(--space-900, 56px); }
  .lp-hero__text { padding: var(--space-600, 24px) 0 var(--space-900, 56px); }
}

/* ---------- Formular-Karte ---------- */
.lp-plain { display: block; }
.funnel {
  width: 100%; box-sizing: border-box;
  background: var(--color-white); color: var(--color-black);
  border-radius: var(--border-radius-card-figure);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
  padding: var(--space-700, 28px);
  display: flex; flex-direction: column; gap: var(--space-500, 20px);
  max-width: 560px; margin: 0 auto;
  scroll-margin-top: 96px;
  --color-text: var(--color-black);
  --color-text-light: var(--color-gray-700);
}
.lp-plain .funnel { box-shadow: var(--shadow-1); }
.funnel__head { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-300); }
.funnel__title { margin: 0; font-size: var(--font-xl); line-height: var(--line-xl); font-weight: var(--font-bold); hyphens: manual; }
.funnel__count { font-size: var(--font-sm); color: var(--color-gray-700); white-space: nowrap; }
.funnel__bar { height: 6px; background: var(--color-gray-200); border-radius: 999px; overflow: hidden; }
.funnel__bar-fill { height: 100%; background: var(--color-black); border-radius: 999px; transition: width 0.25s ease; }
.funnel__schritt { display: flex; flex-direction: column; gap: 14px; }
.funnel__frage { margin: 0; font-size: var(--font-lg); font-weight: var(--font-bold); }
.funnel__text { margin: 0; color: var(--color-gray-700); }
.funnel__optionen { display: grid; gap: 12px; }
.funnel__optionen--tiles,
.funnel__optionen--grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.funnel__option {
  display: flex; flex-direction: column; align-items: stretch; gap: 0;
  min-height: 56px; padding: 14px 18px; text-align: left;
  border: 1px solid var(--color-gray-300); border-radius: var(--border-radius-500);
  background: var(--color-white); color: var(--color-black); font: inherit; cursor: pointer;
}
.funnel__optionen--grid .funnel__option:not(.funnel__option--bild) { text-align: center; justify-content: center; }
.funnel__option--bild { padding: 0; overflow: hidden; border-color: var(--color-gray-200); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); border-radius: var(--border-radius-700); }
.funnel__option-illu { display: flex; justify-content: center; padding: 14px 12px 12px; }
.funnel__option-bild { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
.funnel__option--bild .funnel__option-text {
  flex: 1; display: flex; align-items: center; justify-content: center; min-height: 56px;
  padding: 10px 12px; background: var(--color-black); color: var(--color-white);
  font-weight: var(--font-bold); line-height: 1.3; text-align: center;
}
.funnel__option:hover, .funnel__option--aktiv { border-color: var(--color-black); box-shadow: 0 0 0 1px var(--color-black); }
.funnel__feld { display: flex; flex-direction: column; gap: 4px; font-size: var(--font-sm); color: var(--color-gray-700); }
.funnel__feld input {
  min-height: 48px; padding: 0 14px; font: inherit; font-size: 16px; color: var(--color-black);
  border: 1px solid var(--color-gray-300); border-radius: var(--border-radius-400);
}
.funnel__wege { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; border: 0; padding: 0; margin: 0; }
.funnel__wege legend { font-size: var(--font-sm); color: var(--color-gray-700); margin-bottom: 8px; }
.funnel__weg {
  min-height: 48px; border: 2px solid var(--color-gray-300); border-radius: var(--border-radius-400);
  background: var(--color-white); color: var(--color-black); font: inherit; cursor: pointer;
}
.funnel__weg--aktiv { border-color: var(--color-black); background: var(--color-gray-100); font-weight: var(--font-bold); }
.funnel__einwilligung { display: flex; gap: 10px; font-size: var(--font-xs); line-height: 1.5; color: var(--color-gray-700); }
.funnel__einwilligung input { width: 20px; height: 20px; margin-top: 2px; flex: none; }
.funnel__hp { position: absolute; left: -10000px; width: 1px; height: 1px; opacity: 0; }
.funnel__fehler { margin: 0; color: #b42318; font-size: var(--font-sm); }
.funnel__fuss { display: flex; justify-content: space-between; gap: var(--space-300); font-size: var(--font-xs); color: var(--color-gray-700); }
.funnel__zurueck { background: none; border: 0; padding: 0; font: inherit; text-decoration: underline; cursor: pointer; color: inherit; }
.funnel__danke { display: flex; flex-direction: column; gap: 12px; }
.funnel__danke-icon { color: #2f6b4f; }
.funnel__danke-titel { margin: 0; font-size: var(--font-xl); font-weight: var(--font-bold); }
.funnel__ergebnis {
  background: var(--color-gray-100); border-radius: var(--border-radius-600);
  padding: 18px; display: flex; flex-direction: column; gap: 8px; font-size: var(--font-sm); line-height: 1.5;
}
.funnel__ergebnis p { margin: 0; }
.funnel__ergebnis-titel { font-weight: var(--font-bold); }
.funnel__ergebnis-hinweis { color: var(--color-gray-700); font-size: var(--font-xs); }
</style>
