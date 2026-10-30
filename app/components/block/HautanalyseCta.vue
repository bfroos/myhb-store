<template>
  <!-- myhb-os#1445: Angebot der kostenlosen Hautanalyse, bewusst unaufgeregt im
       Verlauf der Seite. Kein Diagnose- oder Wirkversprechen (HWG): der Block
       bietet die Analyse an und bestaetigt keine Behandlung. -->
  <UiLayoutSectionBlock spacing="sibling">
    <section class="hautanalyse-cta" data-track-placement="hautanalyse_cta">
      <div class="hautanalyse-cta__text">
        <h2 class="hautanalyse-cta__title">{{ titel }}</h2>
        <p class="hautanalyse-cta__body">
          Mach die kostenlose Hautanalyse per Selfie in unserer App. Danach
          besprichst du alles in einer kostenlosen Beratung mit einem Arzt.
        </p>
        <p class="hautanalyse-cta__hint">
          Dafür brauchst du ein kostenloses Konto. Die Analyse ersetzt keine
          ärztliche Untersuchung.
        </p>
      </div>
      <UiAtomBaseButton as="a" :href="href" variant="secondary" size="md">
        Kostenlose Hautanalyse starten
      </UiAtomBaseButton>
    </section>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { hautanalyseDeeplink } from "#shared/hautanalyseCta";

const props = withDefaults(
  defineProps<{ content: string; medium?: "behandlungsseite" | "startseite"; titel?: string }>(),
  { medium: "behandlungsseite", titel: "Unsicher, ob das zu dir passt?" },
);
const href = computed(() => hautanalyseDeeplink(props.content, props.medium));
</script>

<style scoped>
.hautanalyse-cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-500);
  background: var(--color-card-bg-light, #fff);
  border-radius: var(--border-radius-card, 24px);
  padding: var(--space-card-pad);
}
.hautanalyse-cta__text {
  flex: 1 1 28rem;
  min-width: 0;
}
.hautanalyse-cta__title {
  margin: 0 0 var(--space-300);
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  line-height: 1.3;
}
.hautanalyse-cta__body {
  margin: 0;
  max-width: 52rem;
  line-height: 1.5;
}
.hautanalyse-cta__hint {
  margin: var(--space-300) 0 0;
  font-size: var(--font-sm);
  color: var(--color-gray-600, #666);
}
</style>
