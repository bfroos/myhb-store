<template>
  <section :id="anchorId" class="funnel" aria-live="polite">
    <div class="funnel__head">
      <h2 class="funnel__title">{{ headline || "Kostenlose Analyse" }}</h2>
      <span v-if="!gesendet" class="funnel__count">Schritt {{ schritt + 1 }} von {{ gesamt }}</span>
    </div>
    <div v-if="!gesendet" class="funnel__bar" role="progressbar" :aria-valuenow="schritt + 1" aria-valuemin="1" :aria-valuemax="gesamt">
      <div class="funnel__bar-fill" :style="{ width: `${((schritt + 1) / gesamt) * 100}%` }" />
    </div>

    <!-- Danke -->
    <div v-if="gesendet" class="funnel__danke">
      <h3 class="funnel__frage">{{ thankYouHeadline || "Danke, deine Anfrage ist da." }}</h3>
      <p class="funnel__text">
        {{ thankYouText || "Wir melden uns in Kürze bei dir, so wie du es dir gewünscht hast." }}
      </p>
    </div>

    <!-- Fragen -->
    <div v-else-if="aktuelleFrage" class="funnel__schritt">
      <h3 class="funnel__frage">{{ aktuelleFrage.question }}</h3>
      <div class="funnel__optionen" :class="`funnel__optionen--${aktuelleFrage.layout || 'list'}`">
        <button
          v-for="option in aktuelleFrage.options ?? []"
          :key="option.label"
          type="button"
          class="funnel__option"
          :class="{ 'funnel__option--aktiv': antworten[schritt] === option.label, 'funnel__option--bild': !!option.image }"
          @click="waehle(option.label)"
        >
          <UiAtomMediaPicture v-if="option.image" :media="option.image" class="funnel__option-bild" loading="lazy" />
          <span class="funnel__option-text">{{ option.label }}</span>
        </button>
      </div>
    </div>

    <!-- Kontakt -->
    <form v-else class="funnel__schritt" novalidate @submit.prevent="absenden">
      <h3 class="funnel__frage">{{ contactHeadline || "Wohin dürfen wir deine Analyse und dein Angebot senden?" }}</h3>
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

    <div v-if="!gesendet" class="funnel__fuss">
      <button v-if="schritt > 0" type="button" class="funnel__zurueck" @click="schritt--">Zurück</button>
      <span>{{ footnote || "Dauert nur eine Minute und ist unverbindlich." }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import { readWireAttribution } from "~/lib/attribution";
import { useLeadRechner } from "~/composables/useLeadRechner";

/**
 * Anfrage-Funnel fuer OP-Landingpages (E28, myhb-app/myhb-os#1638).
 * Fragen und Antworten kommen aus Strapi (blocks.lead-funnel). Abgeschickt
 * wird an die eigene Route /api/lead-anfrage (#1637), die an die App
 * weiterleitet; die Anfrage landet im Lead-Board.
 */
type FunnelStep = {
  question: string;
  fieldKey?: string | null;
  layout?: "tiles" | "list" | "grid" | null;
  options?: { label: string; image?: StrapiMedia | null }[];
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
}>();

const KONTAKTWEGE = [
  { wert: "whatsapp", label: "WhatsApp" },
  { wert: "anruf", label: "Anruf" },
  { wert: "email", label: "E-Mail" },
] as const;

const anchorId = computed(() => (props.anchor || "anfrage").replace(/^#/, ""));
const fragen = computed(() => (props.steps ?? []).filter((s) => s.question && s.options?.length));
const gesamt = computed(() => fragen.value.length + 1);
const schritt = ref(0);
const antworten = ref<string[]>([]);
const aktuelleFrage = computed(() => fragen.value[schritt.value] ?? null);

const kontakt = reactive({
  name: "",
  telefon: "",
  email: "",
  kontaktweg: "whatsapp" as (typeof KONTAKTWEGE)[number]["wert"],
  einwilligung: false,
  website: "",
});
const sendet = ref(false);
const gesendet = ref(false);
const fehler = ref<string | null>(null);

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

async function absenden() {
  fehler.value = null;
  if (!kontakt.name) return void (fehler.value = "Bitte gib deinen Namen an.");
  if (!kontakt.telefon && !kontakt.email) {
    return void (fehler.value = "Bitte gib eine Telefonnummer oder E-Mail an.");
  }
  if (!kontakt.einwilligung) return void (fehler.value = "Bitte bestätige die Einwilligung.");

  sendet.value = true;
  try {
    await $fetch("/api/lead-anfrage", {
      method: "POST",
      body: {
        behandlung: props.behandlung,
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
    trackEvent("generate_lead", { behandlung: props.behandlung, lead_source: "landingpage" });
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
.funnel {
  background: var(--color-white, #fff);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  box-shadow: var(--shadow-1);
  padding: var(--space-card-pad);
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  max-width: 560px;
  margin: 0 auto;
  scroll-margin-top: 96px;
}
.funnel__head { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-300); }
.funnel__title { margin: 0; font-size: var(--font-lg); font-weight: var(--font-bold); hyphens: manual; }
@media (min-width: 600px) { .funnel__title { font-size: var(--font-xl); } }
.funnel__count { font-size: var(--font-sm); color: var(--color-text-light); white-space: nowrap; }
.funnel__bar { height: 4px; background: var(--color-neutral-200, #eee); border-radius: 2px; overflow: hidden; }
.funnel__bar-fill { height: 100%; background: var(--color-primary, #8a6a3b); transition: width 0.25s ease; }
.funnel__schritt { display: flex; flex-direction: column; gap: var(--space-300); }
.funnel__frage { margin: 0; font-size: var(--font-lg); font-weight: var(--font-semibold, 600); }
.funnel__text { margin: 0; color: var(--color-text-light); }
.funnel__optionen { display: grid; gap: var(--space-200); }
.funnel__optionen--tiles,
.funnel__optionen--grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.funnel__option {
  display: flex; flex-direction: column; align-items: stretch; gap: var(--space-200);
  min-height: 52px; padding: var(--space-300); text-align: left;
  border: 1px solid var(--color-border, #ddd); border-radius: var(--border-radius-md, 10px);
  background: var(--color-white, #fff); font: inherit; cursor: pointer;
}
.funnel__optionen--grid .funnel__option { text-align: center; justify-content: center; }
.funnel__option--bild { padding: 0; overflow: hidden; }
.funnel__option--bild .funnel__option-text {
  padding: var(--space-300); background: var(--color-text, #111); color: var(--color-white, #fff);
  text-align: center; font-weight: var(--font-semibold, 600);
}
.funnel__option-bild { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
.funnel__option:hover, .funnel__option--aktiv { border-color: var(--color-primary, #8a6a3b); box-shadow: 0 0 0 1px var(--color-primary, #8a6a3b); }
.funnel__feld { display: flex; flex-direction: column; gap: 4px; font-size: var(--font-sm); }
.funnel__feld input {
  min-height: 48px; padding: 0 var(--space-300); font: inherit; font-size: 16px;
  border: 1px solid var(--color-border, #ddd); border-radius: var(--border-radius-md, 10px);
}
.funnel__wege { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-200); border: 0; padding: 0; margin: 0; }
.funnel__wege legend { font-size: var(--font-sm); margin-bottom: 4px; }
.funnel__weg {
  min-height: 44px; border: 1px solid var(--color-border, #ddd); border-radius: var(--border-radius-md, 10px);
  background: var(--color-white, #fff); font: inherit; cursor: pointer;
}
.funnel__weg--aktiv { border-color: var(--color-primary, #8a6a3b); background: var(--color-primary-50, #f6efe4); font-weight: var(--font-semibold, 600); }
.funnel__einwilligung { display: flex; gap: var(--space-200); font-size: var(--font-xs, 12px); line-height: 1.4; color: var(--color-text-light); }
.funnel__einwilligung input { margin-top: 2px; flex: none; }
.funnel__hp { position: absolute; left: -10000px; width: 1px; height: 1px; opacity: 0; }
.funnel__fehler { margin: 0; color: var(--color-danger, #b42318); font-size: var(--font-sm); }
.funnel__fuss { display: flex; justify-content: space-between; gap: var(--space-300); font-size: var(--font-xs, 12px); color: var(--color-text-light); }
.funnel__zurueck { background: none; border: 0; padding: 0; font: inherit; text-decoration: underline; cursor: pointer; color: inherit; }
.funnel__danke { display: flex; flex-direction: column; gap: var(--space-200); }
</style>
