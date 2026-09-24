<template>
  <p class="bookingTreatmentContext">
    <template v-if="priceLabel">
      {{ t("dialogs.booking.treatmentContext", { treatment: name, price: priceLabel }) }}
    </template>
    <template v-else>{{ name }}</template>
  </p>
</template>
<script setup lang="ts">
import type { BookingTreatmentContext } from "~/lib/bookingTreatmentContext";

/**
 * Kontextzeile im Kopf des Buchungsdialogs (bfroos/myhb-store#78).
 *
 * Erscheint nur, wenn der Dialog von einer Behandlungsseite geoeffnet wurde,
 * und bleibt stehen, wenn der Kunde im Dialog den Standort wechselt — die
 * Behandlung wandert als Deeplink-Parameter mit (#66/#148). Zeigt die Seite
 * keinen Preis, steht hier nur der Name.
 */
defineProps<BookingTreatmentContext>();
const { t } = useI18n();
</script>
<style scoped>
.bookingTreatmentContext {
  flex: none;
  margin: 0;
  padding: var(--space-300) var(--space-card-pad-xs);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  font-weight: var(--font-bold);
  color: var(--color-text);
  background: var(--color-card-bg-light);
  border-bottom: 1px var(--color-border-mute) solid;
}
</style>
