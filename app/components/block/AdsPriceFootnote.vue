<template>
  <!--
    go.* (Ads-Modus): EINE kleine Fussnotenzeile am Seitenende. Erklaert das
    Sternchen der Neukundenpreise und nennt den regulaeren Preis - beides
    steht seit 30.09.2026 nicht mehr im Hero (Benjamin: erster Screen ohne
    Rechnung und Fussnoten). www: nicht gerendert.
  -->
  <UiLayoutSectionBlock v-if="offer">
    <p class="ads-price-footnote" data-new-customer-footnote>
      {{ offer.pageFootnote }}
    </p>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { TreatmentDto } from "~/lib/strapi/dto/collections";

const props = defineProps<{
  treatment?: TreatmentDto | null;
  treatmentPathKey?: string | null;
  /** Auch auf www (bundesweite v2-Seiten fuer Meta, app/pages/aktion). */
  force?: boolean;
}>();

const offer = useNewCustomerOffer(
  () => props.treatment,
  () => props.treatmentPathKey,
  () => props.force,
);
</script>

<style scoped>
.ads-price-footnote {
  margin: 0 auto;
  max-width: 72ch;
  font-size: var(--font-xs);
  line-height: 1.4;
  color: var(--color-text-light);
  text-align: center;
}
</style>
