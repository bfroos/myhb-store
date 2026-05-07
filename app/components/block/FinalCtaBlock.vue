<template>
  <section class="block final" :class="[themeClass, { 'block--elevated': elevated }]">
    <h2 v-if="headline" class="final__heading">{{ headline }}</h2>
    <p v-if="text" class="final__text">{{ text }}</p>
    <div class="final__cta">
      <button v-if="primaryCta" type="button" class="button button--primary button--lg button--fullWidth" @click="$emit('primary')">
        {{ primaryCta.label }}
      </button>
      <button v-if="secondaryCta" type="button" class="button button--tertiary button--lg button--fullWidth" @click="$emit('secondary')">
        {{ secondaryCta.label }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CtaProp { label: string; to?: string }

withDefaults(defineProps<{
  headline?: string;
  text?: string;
  primaryCta?: CtaProp;
  secondaryCta?: CtaProp;
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
  headline: "Bereit für ein frisches, natürliches Aussehen?",
  text: "Sichere Dir jetzt Deinen Termin – wir freuen uns auf Dich.",
  primaryCta: () => ({ label: "Jetzt Termin buchen" }),
  secondaryCta: () => ({ label: "Kostenlose Beratung" }),
});

defineEmits<{ primary: []; secondary: [] }>();
</script>

<style scoped>
.block {
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  padding: var(--space-card-pad);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-500);
}
.block--elevated { box-shadow: var(--shadow-1); }
.final__heading {
  margin: 0;
  font-size: var(--font-3xl);
  line-height: var(--line-3xl);
  font-weight: var(--font-bold);
  max-width: 22ch;
  letter-spacing: -0.01em;
}
.final__text {
  margin: 0;
  color: var(--color-text-light);
  font-size: var(--font-md);
  line-height: var(--line-md);
  max-width: 40ch;
}
.final__cta {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}
.button {
  height: var(--control-height-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 calc(var(--control-height-lg) / 2);
  border-radius: 999px;
  border: 2px solid transparent;
  font: inherit;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s linear;
}
.button--fullWidth { width: 100%; }
.button--primary {
  background: var(--button-primary-color-bg, #000);
  color: var(--button-primary-color-text, #fff);
}
.button--primary:hover { background: var(--button-primary-color-bg-hover, #292a2c); }
.button--tertiary {
  background: transparent;
  color: var(--button-tertiary-color-text, #000);
  border-color: var(--button-tertiary-color-border, #000);
}
.button--tertiary:hover { background: rgba(0,0,0,0.04); }
.button:active { transform: scale(0.97); }
@media (min-width: 900px) {
  .block { padding: var(--space-800) var(--space-card-pad); }
  .final__heading { font-size: var(--font-5xl); line-height: var(--line-5xl); max-width: 28ch; }
  .final__cta { flex-direction: row; justify-content: center; width: auto; }
  .final__cta .button { width: auto; padding: 0 var(--space-700); }
}
</style>
