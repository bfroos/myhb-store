<template>
  <section v-if="methoden.length" :id="anchorId" class="rechner">
    <div class="rechner__kopf">
      <p v-if="eyebrow" class="rechner__eyebrow">{{ eyebrow }}</p>
      <h2 v-if="headline" class="rechner__titel">{{ headline }}</h2>
      <p v-if="text" class="rechner__text">{{ text }}</p>
    </div>

    <div class="rechner__raster">
      <!-- Eingabe (weisse Karte) -->
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

        <div class="rechner__gruppe">
          <div class="rechner__zeile">
            <label :for="`${anchorId}-einheiten`" class="rechner__label">{{ bereiche.length ? 2 : 1 }}. Anzahl {{ unitLabel }}</label>
            <span class="rechner__wert">{{ zahl(einheiten) }}</span>
          </div>
          <input
            :id="`${anchorId}-einheiten`"
            v-model.number="einheiten"
            type="range"
            :min="minUnits"
            :max="maxUnits"
            :step="stepUnits"
            class="rechner__regler"
          />
          <div class="rechner__grenzen"><span>{{ zahl(minUnits) }}</span><span>{{ zahl(maxUnits) }}</span></div>
        </div>

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
              <span>{{ formatEuroCent(m.pricePerGraftCent) }} / {{ einheitEinzahl }}</span>
            </button>
          </div>
        </fieldset>

        <label v-for="z in zusaetze" :key="z.label" class="rechner__zusatz">
          <input v-model="gewaehlteZusaetze" type="checkbox" :value="z.label" />
          <span><strong>{{ zusatzTitel(z.label) }}</strong>{{ zusatzRest(z.label) }} (+ {{ formatEuro(z.priceCent) }})</span>
        </label>
      </div>

      <!-- Ergebnis (dunkle Karte) -->
      <aside class="rechner__ergebnis theme-strong">
        <p class="rechner__ergebnis-label">Dein Richtpreis</p>
        <p class="rechner__preis">{{ formatEuro(gesamtCent) }}</p>
        <p class="rechner__detail">
          {{ zahl(einheiten) }} {{ unitLabel }} · {{ methode?.label }}<template v-if="methode"> · {{ formatEuroCent(methode.pricePerGraftCent) }} pro {{ einheitEinzahl }}</template><template v-if="gewaehlteZusaetze.length"> · inkl. Zusatz</template>
        </p>

        <template v-if="showInstallments && monate.length">
          <div class="rechner__trenner" />
          <p class="rechner__raten-titel">Ratenrechner</p>
          <div class="rechner__raten-gruppe">
            <div class="rechner__zeile">
              <label :for="`${anchorId}-anzahlung`" class="rechner__klein-label">Anzahlung</label>
              <span>{{ formatEuro(anzahlung) }}</span>
            </div>
            <input
              :id="`${anchorId}-anzahlung`"
              v-model.number="anzahlung"
              type="range"
              min="0"
              :max="anzahlungMax"
              step="10000"
              class="rechner__regler rechner__regler--hell"
            />
          </div>
          <div class="rechner__raten-gruppe">
            <span class="rechner__klein-label">Laufzeit</span>
            <div class="rechner__laufzeiten">
              <button
                v-for="m in monate"
                :key="m"
                type="button"
                class="rechner__laufzeit"
                :class="{ 'rechner__laufzeit--aktiv': laufzeit === m }"
                :aria-pressed="laufzeit === m"
                @click="laufzeit = m"
              >
                {{ m }} Mon.
              </button>
            </div>
          </div>
          <p class="rechner__rate">
            <span>Monatliche Rate</span>
            <strong>{{ formatEuro(rateCent) }}</strong>
          </p>
          <p class="rechner__klein">
            Ohne Zinsen: Gesamtbetrag {{ formatEuro(anzahlung + rateCent * laufzeit) }} (Anzahlung + {{ laufzeit }} Raten). Bonität vorausgesetzt.
          </p>
        </template>

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
 * Preisrechner fuer OP-Landingpages (E28, myhb-app/myhb-os#1639), Aufbau
 * nach Michaels Entwurf: weisse Eingabe-Karte links, dunkle Preis-Karte mit
 * Ratenrechner rechts. Alle Zahlen aus Strapi (blocks.price-calculator),
 * keine Preise im Code. Das Ergebnis geht mit der Anfrage aus dem Funnel mit.
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
    minPriceCent?: number;
    footnote?: string | null;
    ctaLabel?: string | null;
    anchor?: string | null;
  }>(),
  {
    areas: () => [],
    minUnits: 300,
    maxUnits: 3000,
    stepUnits: 100,
    defaultUnits: 1500,
    unitLabel: "Grafts",
    methods: () => [],
    extras: () => [],
    showInstallments: false,
    installmentMonths: "6,12,24,36",
    downPaymentCent: 0,
    minPriceCent: 0,
  },
);

const anchorId = computed(() => (props.anchor || "rechner").replace(/^#/, ""));
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
    props.minPriceCent,
  ),
);
const anzahlungMax = computed(() => Math.floor(gesamtCent.value / 10000) * 10000);
const anzahlungWahl = ref<number | null>(null);
const anzahlung = computed({
  get: () => Math.min(anzahlungWahl.value ?? props.downPaymentCent, anzahlungMax.value),
  set: (v: number) => (anzahlungWahl.value = v),
});
const rateCent = computed(() => monatsrateCent(gesamtCent.value, anzahlung.value, laufzeit.value));

const zahl = (n: number) => n.toLocaleString("de-DE");
const formatEuroCent = (cent: number) =>
  (cent / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
/** "PRP-Eigenbluttherapie-Paket zur Unterstützung …" → fett bis zum ersten Leerzeichen-Wort "zur/für" */
const zusatzTitel = (l: string) => l.split(/\s(?=zur|für|zum)\s?/)[0] ?? l;
const zusatzRest = (l: string) => l.slice(zusatzTitel(l).length);

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
  document.getElementById("anfrage")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
</script>

<style scoped>
.rechner { display: flex; flex-direction: column; gap: var(--space-700, 32px); scroll-margin-top: 96px; }
.rechner__kopf { display: flex; flex-direction: column; gap: var(--space-300, 12px); max-width: 45rem; }
.rechner__eyebrow { margin: 0; font-size: var(--font-sm); letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-gray-700); }
.rechner__titel { margin: 0; font-size: var(--font-4xl); line-height: var(--line-4xl); font-weight: var(--font-bold); }
.rechner__text { margin: 0; color: var(--color-text-light); font-size: var(--font-md); line-height: var(--line-md); }
.rechner__raster { display: grid; gap: var(--space-600, 24px); }
.rechner__eingabe, .rechner__ergebnis {
  border-radius: var(--border-radius-card-figure); padding: var(--space-700, 28px);
  display: flex; flex-direction: column; gap: var(--space-700, 28px);
}
.rechner__eingabe { background: var(--color-white); }
.rechner__ergebnis { background: var(--card-color-bg); color: var(--card-color-text, #fff); gap: var(--space-500, 20px); }
.rechner__gruppe { border: 0; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.rechner__gruppe legend, .rechner__label { font-weight: var(--font-bold); margin-bottom: 4px; }
.rechner__zeile { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.rechner__wert { font-size: var(--font-2xl); font-weight: var(--font-bold); }
.rechner__kacheln { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.rechner__kacheln--zwei { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.rechner__kachel {
  min-height: 64px; display: flex; flex-direction: column; gap: 2px; text-align: left; padding: 12px 16px;
  border: 2px solid var(--color-gray-200); border-radius: var(--border-radius-500);
  background: var(--color-white); color: var(--color-black); font: inherit; cursor: pointer;
}
.rechner__kachel strong { font-weight: var(--font-bold); }
.rechner__kachel span { font-size: var(--font-sm); color: var(--color-gray-700); }
.rechner__kachel--aktiv { border-color: var(--color-black); background: var(--color-gray-100); }
.rechner__regler { width: 100%; height: 44px; accent-color: var(--color-black); }
.rechner__regler--hell { accent-color: var(--color-white); }
.rechner__grenzen { display: flex; justify-content: space-between; font-size: var(--font-sm); color: var(--color-gray-700); }
.rechner__zusatz { display: flex; gap: 12px; align-items: center; min-height: 44px; cursor: pointer; }
.rechner__zusatz input { width: 22px; height: 22px; flex: none; accent-color: var(--color-black); }
.rechner__ergebnis-label { margin: 0; font-size: var(--font-sm); letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-gray-400); }
.rechner__preis { margin: 0; font-size: 3.25rem; line-height: 1; font-weight: var(--font-bold); }
.rechner__detail { margin: 0; font-size: var(--font-sm); color: var(--color-gray-300); }
.rechner__trenner { height: 1px; background: var(--color-gray-800); }
.rechner__raten-titel { margin: 0; font-weight: var(--font-bold); }
.rechner__raten-gruppe { display: flex; flex-direction: column; gap: 8px; }
.rechner__klein-label { font-size: var(--font-sm); color: var(--color-gray-300); }
.rechner__laufzeiten { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.rechner__laufzeit {
  min-height: 44px; border-radius: var(--border-radius-400); border: 1px solid var(--color-gray-700);
  background: transparent; color: inherit; font: inherit; font-size: var(--font-sm); cursor: pointer;
}
.rechner__laufzeit--aktiv { background: var(--color-white); color: var(--color-black); border-color: var(--color-white); }
.rechner__rate {
  margin: 0; display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap;
  padding: 18px; border-radius: var(--border-radius-600); background: var(--color-gray-900);
}
.rechner__rate span { color: var(--color-gray-300); }
.rechner__rate strong { font-size: 2rem; font-weight: var(--font-bold); }
.rechner__klein { margin: 0; font-size: var(--font-xs); color: var(--color-gray-400); }
@media (min-width: 1024px) {
  .rechner__titel { font-size: var(--font-5xl); line-height: var(--line-5xl); }
  .rechner__raster { grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); align-items: start; }
  .rechner__eingabe, .rechner__ergebnis { padding: var(--space-800, 32px); }
}
</style>
