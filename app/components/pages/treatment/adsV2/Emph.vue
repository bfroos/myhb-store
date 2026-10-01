<template>
  <!--
    go.-Vorlage v2: Fliesstext mit fetten Schluesselwoertern (Agentur-Feedback
    01.10.2026). Die Teile kommen aus adsV2Emphasize
    (shared/adsTemplateV2Content.ts), kein v-html.
  -->
  <template v-for="(part, i) in parts" :key="i"><strong v-if="part.strong" class="v2-em">{{ part.text }}</strong><template v-else>{{ part.text }}</template></template>
</template>

<script setup lang="ts">
import type { AdsV2TextPart } from "#shared/adsTemplateV2Content";

defineProps<{ parts: AdsV2TextPart[] }>();
</script>

<style scoped>
.v2-em {
  font-weight: var(--font-bold);
  color: var(--color-text);
}
</style>
