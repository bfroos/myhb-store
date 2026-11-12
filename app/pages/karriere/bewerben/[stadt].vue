<template>
  <!--
    Recruiting-Funnel Aerzte fuer Meta-Anzeigen, eine Seite je Stadt
    (shared/recruitingFunnel.ts). Ersetzt den Perspective-Funnel: gleiche
    Klickfragen, dann Kontakt, ohne Lebenslauf-Pflicht. Die Bewerbung landet
    im Bewerber-Board der App. noindex: nur fuer Anzeigen-Traffic.
  -->
  <section class="funnel theme-light">
    <header v-if="schritt === 0" class="funnel__hero">
      <p class="funnel__eyebrow">Ärztin / Arzt (m/w/d) · {{ stadt.name }}</p>
      <h1 class="funnel__headline">
        Ästhetische Medizin in {{ stadt.name }} – ohne Nachtdienste, mit Einarbeitung
      </h1>
      <ul class="funnel__usps">
        <li>Planbare Arbeitszeiten, keine Nacht- und Wochenenddienste</li>
        <li>Strukturierte Einarbeitung – auch ohne Vorerfahrung in der Ästhetik</li>
        <li>Moderne Lounge in {{ stadt.name }}, eingespieltes Team</li>
      </ul>
      <p class="funnel__hint">4 kurze Fragen · unter 60 Sekunden · kein Lebenslauf nötig</p>
    </header>

    <div class="funnel__card">
      <div class="funnel__progress" :aria-label="`Schritt ${schritt + 1} von ${gesamt}`">
        <span :style="{ width: `${((schritt + 1) / gesamt) * 100}%` }" />
      </div>

      <Message v-if="erfolg" severity="success" class="funnel__message">
        <strong>Danke, {{ form.vorname }}!</strong><br>
        Deine Bewerbung ist bei uns. Unser Recruiting meldet sich in den nächsten Tagen telefonisch bei dir.
      </Message>

      <template v-else-if="frage">
        <h2 class="funnel__question">{{ frage.frage }}</h2>
        <div class="funnel__options">
          <button
            v-for="option in frage.optionen"
            :key="option"
            type="button"
            class="funnel__option"
            :class="{ 'funnel__option--active': antworten[frage.id] === option }"
            @click="waehle(frage.id, option)"
          >
            {{ option }}
          </button>
        </div>
        <button v-if="schritt > 0" type="button" class="funnel__back" @click="schritt--">
          Zurück
        </button>
      </template>

      <form v-else class="funnel__form" novalidate @submit.prevent="absenden">
        <h2 class="funnel__question">Fast geschafft – wie erreichen wir dich?</h2>
        <Message v-if="fehler" severity="error" class="funnel__message">{{ fehler }}</Message>
        <div class="funnel__row">
          <InputText v-model="form.vorname" placeholder="Vorname" autocomplete="given-name" aria-label="Vorname" />
          <InputText v-model="form.nachname" placeholder="Nachname" autocomplete="family-name" aria-label="Nachname" />
        </div>
        <InputText v-model="form.email" type="email" placeholder="E-Mail" autocomplete="email" aria-label="E-Mail" />
        <InputText v-model="form.telefon" type="tel" inputmode="tel" placeholder="Telefon (für den Rückruf)" autocomplete="tel" aria-label="Telefon" />
        <div class="funnel__honeypot" aria-hidden="true">
          <input v-model="form.website" type="text" tabindex="-1" autocomplete="off">
        </div>
        <label class="funnel__consent">
          <Checkbox v-model="form.datenschutz" binary />
          <span>
            Ich bin einverstanden, dass MY HEALTH &amp; BEAUTY meine Angaben zur Bearbeitung meiner Bewerbung speichert
            (<NuxtLinkLocale to="/p/datenschutz" target="_blank">Datenschutz</NuxtLinkLocale>). Löschung nach spätestens 6 Monaten.
          </span>
        </label>
        <UiAtomBaseButton type="submit" size="lg" :disabled="laedt">
          {{ laedt ? "Wird gesendet …" : "Jetzt unverbindlich bewerben" }}
        </UiAtomBaseButton>
        <button type="button" class="funnel__back" @click="schritt--">Zurück</button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import {
  FUNNEL_FRAGEN,
  pruefeKurzbewerbung,
  stadtAusSlug,
  trackingAusQuery,
} from "#shared/recruitingFunnel";

definePageMeta({ layout: "landing" });

const route = useRoute();
const gefunden = stadtAusSlug(String(route.params.stadt ?? ""));
if (!gefunden) {
  throw createError({ statusCode: 404, statusMessage: "Not found", fatal: true });
}
const stadt = gefunden;

useHead({
  title: `Ärztin / Arzt in ${stadt.name} – Ästhetische Medizin | MY HEALTH & BEAUTY`,
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const { trackCareerApply } = useGoogleAnalytics();

// Kampagne aus dem Anzeigenlink merken, bevor jemand weiterklickt.
const tracking = trackingAusQuery(route.query as Record<string, unknown>);

const gesamt = FUNNEL_FRAGEN.length + 1;
const schritt = ref(0);
const antworten = reactive<Record<string, string>>({});
const frage = computed(() => FUNNEL_FRAGEN[schritt.value] ?? null);

const form = reactive({
  vorname: "",
  nachname: "",
  email: "",
  telefon: "",
  datenschutz: false,
  website: "",
});
const laedt = ref(false);
const fehler = ref<string | null>(null);
const erfolg = ref(false);

function waehle(id: string, option: string) {
  antworten[id] = option;
  schritt.value++;
}

async function absenden() {
  fehler.value = pruefeKurzbewerbung({ ...form, antworten });
  if (fehler.value) return;
  laedt.value = true;
  try {
    await $fetch("/api/karriere/kurzbewerbung", {
      method: "POST",
      body: { ...form, stadt: stadt.slug, antworten, tracking },
    });
    erfolg.value = true;
    trackCareerApply({ job_type: "arzt", location_slug: stadt.slug });
    // Meta-Pixel (ueber GTM/Cookiebot geladen, nur mit Einwilligung): Lead fuer die Kampagnenoptimierung.
    (window as any).fbq?.("track", "Lead", { content_name: `recruiting-${stadt.slug}` });
  } catch (e: any) {
    fehler.value = e?.data?.statusMessage || e?.statusMessage || "Das hat nicht geklappt. Bitte versuche es noch einmal.";
  } finally {
    laedt.value = false;
  }
}
</script>

<style scoped>
.funnel {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--space-400) var(--container-pad) var(--space-800);
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
}

.funnel__eyebrow {
  margin: 0 0 var(--space-200);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.funnel__headline {
  margin: 0 0 var(--space-400);
  font-size: var(--font-3xl);
  line-height: var(--line-3xl);
  font-weight: var(--font-bold);
}

.funnel__usps {
  margin: 0 0 var(--space-300);
  padding-left: 1.2em;
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
}

.funnel__hint {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--color-text-light);
}

.funnel__card {
  background: var(--card-color-bg);
  border-radius: var(--border-radius-card);
  box-shadow: var(--shadow-1);
  padding: var(--space-card-pad);
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}

.funnel__progress {
  height: 6px;
  border-radius: 3px;
  background: var(--color-border, #e5e5e5);
  overflow: hidden;
}

.funnel__progress span {
  display: block;
  height: 100%;
  background: var(--color-primary, currentColor);
  transition: width 0.25s ease;
}

.funnel__question {
  margin: 0;
  font-size: var(--font-xl);
  line-height: var(--line-xl);
  font-weight: var(--font-bold);
}

.funnel__options {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
}

.funnel__option {
  font: inherit;
  text-align: left;
  padding: var(--space-400);
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--border-radius-card);
  background: var(--color-bg, #fff);
  color: var(--color-text);
  cursor: pointer;
}

.funnel__option:hover,
.funnel__option--active {
  border-color: var(--color-primary, currentColor);
}

.funnel__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
}

.funnel__form :deep(.p-inputtext) {
  width: 100%;
}

.funnel__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-300);
}

.funnel__consent {
  display: flex;
  align-items: flex-start;
  gap: var(--space-300);
  font-size: var(--font-xs);
  line-height: var(--line-xs);
}

.funnel__consent a {
  text-decoration: underline;
}

.funnel__back {
  align-self: flex-start;
  font: inherit;
  font-size: var(--font-sm);
  background: none;
  border: 0;
  padding: 0;
  color: var(--color-text-light);
  text-decoration: underline;
  cursor: pointer;
}

.funnel__honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.funnel__message {
  margin: 0;
}
</style>
