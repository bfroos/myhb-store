<template>
  <section v-if="methoden.length" class="rechner">
    <div class="rechner__kopf">
      <p v-if="eyebrow" class="rechner__eyebrow">{{ eyebrow }}</p>
      <h2 v-if="headline" class="rechner__titel">{{ headline }}</h2>
      <p v-if="text" class="rechner__text">{{ text }}</p>
    </div>

    <div class="rechner__raster">
      <div class="rechner__eingabe">
        <fieldset v-if="bereiche.length" class="rechner__gruppe">
          <legend>1. Behandlungsbereiche</legend>
          <div class="rechner__kacheln">
            <button
              v-for="b in bereiche"
              :key="b.label"
              type="button"
              class="rechner__kachel"
              :class="{ 'rechner__kachel--aktiv': gewaehlt.has(b.label) }"
              :aria-pressed="gewaehlt.has(b.label)"
              @click="toggleBereich(b.label)"
            >
              <strong>{{ b.label }}</strong>
              <span>ca. {{ zahl(b.grafts) }} {{ unitLabel }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset class="rechner__gruppe">
          <legend class="rechner__legend-zeile">
            <span>{{ bereiche.length ? 2 : 1 }}. Anzahl {{ unitLabel }}</span>
            <strong>{{ zahl(einheiten) }}</strong>
          </legend>
          <input
            v-model.number="einheiten"
            type="range"
            :min="minUnits"
            :max="maxUnits"
            :step="stepUnits"
            class="rechner__regler"
            :aria-label="`Anzahl ${unitLabel}`"
          />
          <div class="rechner__grenzen"><span>{{ zahl(minUnits) }}</span><span>{{ zahl(maxUnits) }}</span></div>
        </fieldset>

        <fieldset class="rechner__gruppe">
          <legend>{{ bereiche.length ? 3 : 2 }}. Methode</legend>
          <div class="rechner__kacheln rechner__kacheln--zwei">
            <button
              v-for="(m, i) in methoden"
              :key="m.label"
              type="button"
              class="rechner__kachel"
              :class="{ 'rechner__kachel--aktiv': methodeIndex === i }"
              :aria-pressed="methodeIndex === i"
              @click="methodeIndex = i"
            >
              <strong>{{ m.label }}</strong>
              <span>{{ formatEuro(m.pricePerGraftCent) }} / {{ einheitEinzahl }}</span>
            </button>
          </div>
        </fieldset>

        <label v-for="z in zusaetze" :key="z.label" class="rechner__zusatz">
          <input v-model="gewaehlteZusaetze" type="checkbox" :value="z.label" />
          <span>{{ z.label }} (+ {{ formatEuro(z.priceCent) }})</span>
        </label>
      </div>

      <aside class="rechner__ergebnis">
        <p class="rechner__ergebnis-label">Dein Richtpreis</p>
        <p class="rechner__preis">{{ formatEuro(gesamtCent) }}</p>
        <p class="rechner__detail">
          {{ zahl(einheiten) }} {{ unitLabel }} · {{ methode?.label }}
          <template v-if="methode"> · {{ formatEuro(methode.pricePerGraftCent) }} je {{ einheitEinzahl }}</template>
        </p>

        <div v-if="showInstallments && monate.length" class="rechner__raten">
          <p class="rechner__ergebnis-label">Ratenrechner</p>
          <div class="rechner__laufzeiten">
            <button
              v-for="m in monate"
              :key="m"
              type="button"
              class="rechner__laufzeit"
              :class="{ 'rechner__laufzeit--aktiv': laufzeit === m }"
              @click="laufzeit = m"
            >
              {{ m }} Mon.
            </button>
          </div>
          <p class="rechner__rate">
            <span>Monatliche Rate</span>
            <strong>{{ formatEuro(rateCent) }}</strong>
          </p>
          <p v-if="downPaymentCent" class="rechner__klein">Anzahlung {{ formatEuro(downPaymentCent) }} + {{ laufzeit }} Raten.</p>
        </div>

        <UiAtomBaseButton size="lg" variant="primary" full-width @click="zumFunnel">
          {{ ctaLabel || "Persönliches Angebot anfordern" }}
        </UiAtomBaseButton>
        <p class="rechner__klein">
          {{ footnote || "Unverbindliche Orientierung. Der endgültige Preis wird nach ärztlicher Analyse festgelegt." }}
        </p>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  begrenze,
  formatEuro,
  laufzeiten,
  monatsrateCent,
  preisCent,
  vorschlagEinheiten,
  type RechnerBereich,
  type RechnerMethode,
  type RechnerZusatz,
} from "#shared/preisRechner";
import { useLeadRechner } from "~/composables/useLeadRechner";

/**
 * Preisrechner fuer OP-Landingpages (E28, myhb-app/myhb-os#1639). Alle
 * Zahlen aus Strapi (blocks.price-calculator), keine Preise im Code. Das
 * Ergebnis geht mit der Anfrage aus dem Funnel mit (useLeadRechner).
 */
const props = withDefaults(
  defineProps<{
    eyebrow?: string | null;
    headline?: string | null;
    text?: string | null;
    areas?: RechnerBereich[];
    minUnits?: number;
    maxUnits?: number;
    stepUnits?: number;
    defaultUnits?: number;
    unitLabel?: string;
    methods?: RechnerMethode[];
    extras?: RechnerZusatz[];
    showInstallments?: boolean;
    installmentMonths?: string | null;
    downPaymentCent?: number;
    footnote?: string | null;
    ctaLabel?: string | null;
  }>(),
  {
    areas: () => [],
    minUnits: 300,
    maxUnits: 3000,
    stepUnits: 50,
    defaultUnits: 1500,
    unitLabel: "Grafts",
    methods: () => [],
    extras: () => [],
    showInstallments: false,
    installmentMonths: "6,12,24,36",
    downPaymentCent: 0,
  },
);

const bereiche = computed(() => props.areas.filter((a) => a.label));
const methoden = computed(() => props.methods.filter((m) => m.label && m.pricePerGraftCent >= 0));
const zusaetze = computed(() => props.extras.filter((z) => z.label));
const grenzen = computed(() => ({
  min: props.minUnits,
  max: props.maxUnits,
  step: props.stepUnits,
  standard: props.defaultUnits,
}));
const einheitEinzahl = computed(() => props.unitLabel.replace(/s$/, ""));

const gewaehlt = ref(new Set<string>(bereiche.value[0] ? [bereiche.value[0].label] : []));
const einheiten = ref(
  vorschlagEinheiten(bereiche.value.filter((b) => gewaehlt.value.has(b.label)), grenzen.value),
);
const methodeIndex = ref(0);
const gewaehlteZusaetze = ref<string[]>([]);
const monate = computed(() => laufzeiten(props.installmentMonths));
const laufzeit = ref(monate.value.includes(12) ? 12 : (monate.value[0] ?? 12));

function toggleBereich(label: string) {
  const neu = new Set(gewaehlt.value);
  if (neu.has(label)) neu.delete(label);
  else neu.add(label);
  gewaehlt.value = neu;
  einheiten.value = vorschlagEinheiten(
    bereiche.value.filter((b) => neu.has(b.label)),
    grenzen.value,
  );
}

const methode = computed(() => methoden.value[methodeIndex.value] ?? null);
const gesamtCent = computed(() =>
  preisCent(
    begrenze(einheiten.value, grenzen.value),
    methode.value,
    zusaetze.value.filter((z) => gewaehlteZusaetze.value.includes(z.label)),
  ),
);
const rateCent = computed(() => monatsrateCent(gesamtCent.value, props.downPaymentCent, laufzeit.value));

const zahl = (n: number) => n.toLocaleString("de-DE");

// Ergebnis fuer den Funnel merken
const ergebnis = useLeadRechner();
watchEffect(() => {
  ergebnis.value = {
    bereiche: [...gewaehlt.value],
    einheiten: einheiten.value,
    einheitLabel: props.unitLabel,
    methode: methode.value?.label ?? null,
    zusatz: [...gewaehlteZusaetze.value],
    preisCent: gesamtCent.value,
  };
});

const { trackCtaClick } = useGoogleAnalytics();
function zumFunnel() {
  trackCtaClick("price_calculator");
  const ziel = document.getElementById("anfrage");
  if (ziel) ziel.scrollIntoView({ behavior: "smooth", block: "start" });
}
</script>

<style scoped>
.rechner { display: flex; flex-direction: column; gap: var(--space-500); }
.rechner__kopf { display: flex; flex-direction: column; gap: var(--space-200); max-width: 60ch; }
.rechner__eyebrow { margin: 0; font-size: var(--font-xs, 12px); letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-primary, #8a6a3b); }
.rechner__titel { margin: 0; font-size: var(--font-3xl); line-height: var(--line-3xl); font-weight: var(--font-bold); }
.rechner__text { margin: 0; color: var(--color-text-light); }
.rechner__raster { display: grid; gap: var(--space-400); }
.rechner__eingabe, .rechner__ergebnis {
  border-radius: var(--border-radius-card); padding: var(--space-card-pad);
  display: flex; flex-direction: column; gap: var(--space-400);
}
.rechner__eingabe { background: var(--color-white, #fff); box-shadow: var(--shadow-1); }
.rechner__ergebnis { background: var(--color-text, #111); color: var(--color-white, #fff); }
.rechner__gruppe { border: 0; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-200); }
.rechner__gruppe legend { font-weight: var(--font-semibold, 600); margin-bottom: var(--space-200); }
.rechner__legend-zeile { display: flex; justify-content: space-between; width: 100%; }
.rechner__kacheln { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--space-200); }
.rechner__kacheln--zwei { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
.rechner__kachel {
  display: flex; flex-direction: column; gap: 2px; text-align: left; padding: var(--space-300);
  border: 1px solid var(--color-border, #ddd); border-radius: var(--border-radius-md, 10px);
  background: var(--color-white, #fff); font: inherit; cursor: pointer;
}
.rechner__kachel span { font-size: var(--font-xs, 12px); color: var(--color-text-light); }
.rechner__kachel--aktiv { border-color: var(--color-primary, #8a6a3b); background: var(--color-primary-50, #f6efe4); box-shadow: 0 0 0 1px var(--color-primary, #8a6a3b); }
.rechner__regler { width: 100%; accent-color: var(--color-primary, #8a6a3b); }
.rechner__grenzen { display: flex; justify-content: space-between; font-size: var(--font-xs, 12px); color: var(--color-text-light); }
.rechner__zusatz { display: flex; gap: var(--space-200); align-items: center; font-size: var(--font-sm); }
.rechner__ergebnis-label { margin: 0; font-size: var(--font-xs, 12px); letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.7; }
.rechner__preis { margin: 0; font-size: 3rem; line-height: 1; font-weight: var(--font-bold); }
.rechner__detail, .rechner__klein { margin: 0; font-size: var(--font-xs, 12px); opacity: 0.75; }
.rechner__raten { display: flex; flex-direction: column; gap: var(--space-200); border-top: 1px solid rgba(255, 255, 255, 0.15); padding-top: var(--space-300); }
.rechner__laufzeiten { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-100, 6px); }
.rechner__laufzeit { min-height: 40px; border-radius: var(--border-radius-md, 10px); border: 1px solid rgba(255, 255, 255, 0.25); background: transparent; color: inherit; font: inherit; cursor: pointer; }
.rechner__laufzeit--aktiv { background: var(--color-primary-50, #f6efe4); color: var(--color-text, #111); }
.rechner__rate { margin: 0; display: flex; justify-content: space-between; align-items: center; padding: var(--space-300); border-radius: var(--border-radius-md, 10px); background: rgba(255, 255, 255, 0.08); }
.rechner__rate strong { font-size: var(--font-2xl, 1.75rem); }
@media (min-width: 900px) {
  .rechner__raster { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); align-items: start; }
  .rechner__ergebnis { position: sticky; top: 96px; }
}
</style>
