<template>
  <section class="intro theme-light">
    <p class="intro__kicker">Kostenlose Hautanalyse</p>
    <h1 class="intro__headline">Wie alt schätzt deine Haut dich?</h1>
    <p class="intro__lead">
      Ein Selfie, ein paar Sekunden, und du siehst, woran deine Haut gerade
      arbeitet – und was in einem Gespräch mit unseren Ärztinnen und Ärzten
      Sinn ergibt.
    </p>

    <ol class="intro__steps">
      <li><strong>Selfie</strong> – direkt hier, ohne App</li>
      <li><strong>Ergebnis</strong> – in unter einer Minute</li>
      <li><strong>Beratung</strong> – kostenlos, wenn du magst</li>
    </ol>

    <div class="intro__consent">
      <p class="intro__consent-title">Bevor es losgeht</p>
      <p class="intro__consent-text">
        Für die Analyse verarbeiten wir ein Foto deines Gesichts. Daraus lesen
        wir Merkmale wie Linien, Feuchtigkeit und Poren – das sind
        Gesundheitsdaten. Dein Foto wird nur für die Analyse verwendet und
        <strong>nicht gespeichert</strong>; du bekommst Merkmalswerte, keine
        Diagnose. Mehr dazu in unserer
        <NuxtLink to="/datenschutz" class="intro__link">Datenschutzerklärung</NuxtLink>.
      </p>

      <label class="intro__check">
        <input v-model="einwilligung" type="checkbox">
        <span>
          Ich willige ein, dass mein Foto zur Hautanalyse verarbeitet wird
          (Art. 9 Abs. 2 lit. a DSGVO). Ich kann das jederzeit widerrufen.
        </span>
      </label>

      <label class="intro__check">
        <input v-model="volljaehrig" type="checkbox">
        <span>Ich bin mindestens 18 Jahre alt.</span>
      </label>
    </div>

    <UiAtomBaseButton
      size="lg"
      full-width
      :disabled="!bereit"
      @click="$emit('start')"
    >
      Hautanalyse starten
    </UiAtomBaseButton>
    <p class="intro__note">
      Keine Anmeldung, keine E-Mail nötig. Das Ergebnis siehst du sofort.
    </p>
  </section>
</template>

<script setup lang="ts">
/**
 * Erster Schritt: erklaeren, dann einwilligen lassen, dann erst die Kamera
 * (#136). Die Reihenfolge ist der Unterschied zu den beiden Vorbildern, die wir
 * uns angesehen haben (PHC und Kalia Lab): dort steht die Kamera vor jeder
 * Einwilligung.
 *
 * Bewusst **kein** E-Mail-Feld an dieser Stelle. Kalia Lab verlangt die
 * Marketing-Einwilligung vor dem Ergebnis ("ist fuer die Nutzung des Dienstes
 * erforderlich") — das ist eine Kopplung, die bei Gesundheitsdaten nicht
 * traegt. Die E-Mail fragen wir nach dem Ergebnis, freiwillig.
 */
const einwilligung = defineModel<boolean>("einwilligung", { default: false });
const volljaehrig = defineModel<boolean>("volljaehrig", { default: false });

defineEmits<{ start: [] }>();

const bereit = computed(() => einwilligung.value && volljaehrig.value);
</script>

<style scoped>
.intro {
  max-width: var(--container-width-xs);
  margin: 0 auto;
  padding: var(--space-600) var(--container-pad-xs) var(--space-800);
  text-align: center;
}

.intro__kicker {
  margin: 0 0 var(--space-200);
  font: var(--font-sm) / var(--line-sm) var(--font-family-base);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.intro__headline {
  margin: 0 0 var(--space-300);
  font-size: var(--h1-font-size);
  line-height: var(--line-2xl);
}

.intro__lead {
  margin: 0 auto var(--space-600);
  color: var(--color-text-light);
}

.intro__steps {
  display: grid;
  gap: var(--space-200);
  margin: 0 0 var(--space-600);
  text-align: left;
}

.intro__steps li {
  padding: var(--space-300);
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius-300);
  background: var(--color-card-bg-light);
}

.intro__consent {
  margin-bottom: var(--space-500);
  padding: var(--space-400);
  border: 1px solid var(--color-border-mute);
  border-radius: var(--border-radius-300);
  text-align: left;
}

.intro__consent-title {
  margin: 0 0 var(--space-200);
  font-weight: var(--font-bold);
}

.intro__consent-text {
  margin: 0 0 var(--space-400);
  font-size: var(--font-sm);
  line-height: var(--line-md);
  color: var(--color-text-light);
}

.intro__link {
  color: inherit;
  text-decoration: underline;
}

.intro__check {
  display: flex;
  gap: var(--space-200);
  align-items: flex-start;
  margin-bottom: var(--space-300);
  font-size: var(--font-sm);
  line-height: var(--line-md);
  cursor: pointer;
}

.intro__check input {
  flex: none;
  width: 20px;
  height: 20px;
  margin-top: 2px;
}

.intro__note {
  margin: var(--space-300) 0 0;
  font-size: var(--font-xs);
  color: var(--color-text-muted);
}
</style>
