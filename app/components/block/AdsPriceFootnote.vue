<template>
  <!--
    go.* (Ads-Modus): EINE kleine Fussnotenzeile am Seitenende. Erklaert das
    Sternchen der Neukundenpreise und nennt den regulaeren Preis - beides
    steht seit 30.09.2026 nicht mehr im Hero (Benjamin: erster Screen ohne
    Rechnung und Fussnoten). www: nicht gerendert.
  -->
  <UiLayoutSectionBlock v-if="line">
    <p class="ads-price-footnote" data-new-customer-footnote>
      {{ line }}
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
  /** Eigener Text statt der Neukundenpreis-Zeile (Startguthaben, #2188). */
  text?: string | null;
}>();

const offer = useNewCustomerOffer(
  () => props.treatment,
  () => props.treatmentPathKey,
  () => props.force,
);
const line = computed(() => props.text || offer.value?.pageFootnote || null);
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
