<template>
  <section class="result theme-light">
    <p v-if="istBeispiel" class="result__demo">
      Vorschau-Modus: Es ist noch kein Analyse-Anbieter angebunden, die Werte
      unten sind Beispielwerte.
    </p>

    <div v-if="ergebnis.hautalter" class="result__age">
      <span class="result__age-number">{{ ergebnis.hautalter }}</span>
      <span class="result__age-label">geschätztes Hautalter</span>
    </div>

    <h2 class="result__headline">Das sagt dein Hautbild</h2>

    <ul class="result__metrics">
      <li v-for="merkmal in merkmale" :key="merkmal.key" class="result__metric">
        <div class="result__metric-head">
          <span class="result__metric-title">{{ merkmal.titel }}</span>
          <span :class="['result__badge', `result__badge--${merkmal.stufe}`]">
            {{ stufenText[merkmal.stufe] }}
          </span>
        </div>
        <div class="result__bar" role="presentation">
          <div class="result__bar-fill" :style="{ width: `${merkmal.wert}%` }" />
        </div>
        <p class="result__metric-hint">{{ merkmal.hinweis }}</p>
      </li>
    </ul>

    <template v-if="empfehlungen.length">
      <h2 class="result__headline">Was jetzt Sinn ergibt</h2>
      <ul class="result__tips">
        <li v-for="tipp in empfehlungen" :key="tipp.merkmal" class="result__tip">
          <h3 class="result__tip-title">{{ tipp.titel }}</h3>
          <p class="result__tip-text">{{ tipp.text }}</p>
          <p v-if="tipp.behandlung" class="result__tip-treatment">
            Im Gespräch wahrscheinlich Thema: <strong>{{ tipp.behandlung.name }}</strong>
          </p>
          <UiAtomBaseButton
            as="a"
            :href="beratungsDeeplink(tipp)"
            external
            size="md"
            @click="$emit('booking', tipp)"
          >
            Kostenlose Beratung buchen
          </UiAtomBaseButton>
        </li>
      </ul>
    </template>
    <p v-else class="result__allgood">
      Deine Haut zeigt in allen Merkmalen unauffällige Werte. Wenn dich trotzdem
      etwas stört, buch dir gern eine kostenlose Beratung.
    </p>

    <p class="result__disclaimer">
      Diese Analyse ist eine kosmetische Einschätzung und <strong>keine
      medizinische Diagnose</strong>. Sie ersetzt kein ärztliches Gespräch. Dein
      Foto haben wir nicht gespeichert – lädst du die Seite neu, ist das
      Ergebnis weg.
    </p>

    <button class="result__restart" type="button" @click="$emit('restart')">
      Neue Analyse starten
    </button>
  </section>
</template>

<script setup lang="ts">
/**
 * Ergebnisseite (#136).
 *
 * Drei Dinge stehen hier bewusst so:
 * - Das Hautalter ist die groesste Zahl. Es ist der Haken, an dem die ganze
 *   Seite haengt, und der einzige Wert, den jede versteht.
 * - Jede Empfehlung fuehrt in die **kostenlose Beratung**, nie direkt in eine
 *   kostenpflichtige Behandlung (siehe `#shared/hautanalyse`).
 * - Der Hinweis "keine Diagnose" steht unter dem Ergebnis, nicht im Impressum.
 *
 * Noch nicht gebaut: "Ergebnis per Mail schicken" aus #136. Das braucht einen
 * eigenen Einwilligungstext und den HubSpot-Weg — und es darf nie zur
 * Bedingung fuer das Ergebnis werden, so wie beim Wettbewerb.
 */
import {
  MERKMAL_LABELS,
  beratungsDeeplink,
  stufeFuer,
  type Empfehlung,
  type HautanalyseErgebnis,
  type Stufe,
} from "#shared/hautanalyse";

const props = defineProps<{
  ergebnis: HautanalyseErgebnis;
  empfehlungen: Empfehlung[];
}>();

defineEmits<{ restart: []; booking: [empfehlung: Empfehlung] }>();

const stufenText: Record<Stufe, string> = {
  gut: "unauffällig",
  mittel: "beobachten",
  auffaellig: "fällt auf",
};

const istBeispiel = computed(() => props.ergebnis.quelle.startsWith("Beispielwerte"));

/** Auffaelligstes zuerst — die Ergebnisseite soll nicht mit "alles gut" starten. */
const merkmale = computed(() =>
  [...props.ergebnis.merkmale]
    .sort((a, b) => a.wert - b.wert)
    .map((m) => ({
      key: m.key,
      wert: m.wert,
      stufe: stufeFuer(m.wert),
      titel: MERKMAL_LABELS[m.key].titel,
      hinweis: MERKMAL_LABELS[m.key].hinweis,
    })),
);
</script>

<style scoped>
.result {
  max-width: var(--container-width-xs);
  margin: 0 auto;
  padding: var(--space-600) var(--container-pad-xs) var(--space-800);
}

.result__demo {
  margin: 0 0 var(--space-500);
  padding: var(--space-300);
  border: 1px dashed var(--color-border-mute);
  border-radius: var(--border-radius-200);
  font-size: var(--font-sm);
  color: var(--color-text-light);
}

.result__age {
  display: grid;
  justify-items: center;
  margin-bottom: var(--space-600);
}

.result__age-number {
  font-size: var(--font-5xl);
  line-height: var(--line-5xl);
  font-weight: var(--font-bold);
}

.result__age-label {
  font-size: var(--font-sm);
  color: var(--color-text-muted);
}

.result__headline {
  margin: 0 0 var(--space-400);
  font-size: var(--font-xl);
}

.result__metrics,
.result__tips {
  display: grid;
  gap: var(--space-300);
  margin: 0 0 var(--space-700);
}

.result__metric,
.result__tip {
  padding: var(--space-400);
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius-300);
  background: var(--color-card-bg-light);
}

.result__metric-head {
  display: flex;
  gap: var(--space-200);
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-200);
}

.result__metric-title {
  font-weight: var(--font-bold);
}

.result__badge {
  flex: none;
  padding: 2px var(--space-200);
  border-radius: var(--border-radius-800);
  font-size: var(--font-xs);
  white-space: nowrap;
}

.result__badge--gut {
  background: var(--color-card-bg-soft);
  color: var(--color-text-light);
}

.result__badge--mittel {
  background: var(--color-card-bg-neutral);
  color: var(--color-text);
}

.result__badge--auffaellig {
  background: var(--color-card-bg-strong);
  color: var(--strong-color-text);
}

.result__bar {
  height: 6px;
  margin-bottom: var(--space-200);
  overflow: hidden;
  border-radius: var(--border-radius-800);
  background: var(--color-card-bg-neutral);
}

.result__bar-fill {
  height: 100%;
  background: var(--color-text);
}

.result__metric-hint {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--color-text-light);
}

.result__tip-title {
  margin: 0 0 var(--space-200);
  font-size: var(--font-lg);
}

.result__tip-text,
.result__tip-treatment {
  margin: 0 0 var(--space-300);
  font-size: var(--font-sm);
  line-height: var(--line-md);
  color: var(--color-text-light);
}

.result__allgood {
  margin: 0 0 var(--space-700);
  color: var(--color-text-light);
}

.result__disclaimer {
  margin: 0 0 var(--space-400);
  font-size: var(--font-xs);
  line-height: var(--line-md);
  color: var(--color-text-muted);
}

.result__restart {
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-text-light);
  font: inherit;
  font-size: var(--font-sm);
  text-decoration: underline;
  cursor: pointer;
}
</style>
