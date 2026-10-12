<template>
  <!--
    Pflichthinweis nach § 5b Abs. 3 UWG (bfroos/myhb-store#307, E24): Wer mit
    Verbraucherbewertungen wirbt, muss sagen, ob und wie er ihre Echtheit
    sicherstellt. Text wie in der App (ReviewAuthenticityNote,
    myhb-app/myhb-os#278): Google prueft, nicht wir - eine behauptete eigene
    Pruefung waere selbst der Verstoss.
    <details> statt Tooltip: geht ohne JavaScript und auf dem Telefon auf.
  -->
  <details class="authNote" :class="{ 'authNote--text': withLabel }" @click.stop>
    <summary class="authNote__toggle" :aria-label="withLabel ? undefined : t('common.reviewsAuthenticityTitle')">
      <IconInfoCircle class="authNote__icon" size="1em" aria-hidden="true" />
      <span v-if="withLabel" class="authNote__label">{{ t("common.reviewsAuthenticityTitle") }}</span>
    </summary>
    <div class="authNote__panel" role="note">
      <strong class="authNote__title">{{ t("common.reviewsAuthenticityTitle") }}</strong>
      <p class="authNote__body">{{ t("common.reviewsAuthenticityBody") }}</p>
    </div>
  </details>
</template>

<script setup lang="ts">
import { IconInfoCircle } from "@tabler/icons-vue";

defineProps<{
  /** Beschriftung neben dem Symbol ("Woher die Bewertungen kommen"). */
  withLabel?: boolean;
}>();

const { t } = useI18n();
</script>

<style scoped>
.authNote {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
  font-size: 0.875rem;
  line-height: 1.3;
}
.authNote__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  cursor: pointer;
  list-style: none;
  color: inherit;
  opacity: 0.75;
  padding: 0.25em;
  border-radius: 999px;
}
.authNote__toggle::-webkit-details-marker {
  display: none;
}
.authNote__toggle:hover,
.authNote[open] .authNote__toggle {
  opacity: 1;
}
.authNote__toggle:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
.authNote__icon {
  width: 1.1em;
  height: 1.1em;
  flex: none;
}
.authNote__label {
  text-decoration: underline;
  text-underline-offset: 2px;
}
/* Klappt im Textfluss auf: Karten mit overflow:hidden schneiden ihn so nicht ab. */
.authNote[open] {
  display: block;
  flex-basis: 100%;
}
.authNote__panel {
  margin-top: 6px;
  max-width: min(22rem, calc(100vw - 2rem));
  padding: 0.75rem 0.875rem;
  border-radius: 12px;
  background: #fff;
  color: #1f1f1f;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  text-align: left;
  font-weight: 400;
}
.authNote__title {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}
.authNote__body {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.45;
}
</style>
