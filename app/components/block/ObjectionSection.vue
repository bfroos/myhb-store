<template>
  <!-- Strapi blocks.objection-section auf Seiten ohne v2-Vorlage
       (BlockRenderer). Die v2-Ads-Vorlage liest den Block selbst
       (adsV2/Page.vue) und zeigt ihn in ihrem eigenen Markup; gemeinsame
       Datenlogik: shared/objections.ts. Ohne Preis- und Rabattkontext
       entfallen hier Karten mit {preis}/{rabatt}. -->
  <UiLayoutSectionBlock v-if="cards.length">
    <UiLayoutCardSurface :card-settings="cardSettings ?? undefined">
      <div class="objections">
        <h2 v-if="headline" class="objections__heading">{{ headline }}</h2>
        <p v-if="subheadline" class="objections__sub">{{ subheadline }}</p>
        <UiMoleculeObjectionList :items="cards" class="objections__list" />
        <div v-if="showCta !== false && cta" class="objections__actions">
          <SharedButton :button="cta" :button-props="{ size: 'lg' }" class="objections__btn" />
        </div>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { resolveObjectionCards } from "#shared/objections";
import type { BlockObjectionSectionDto } from "~/lib/strapi/dto/objections";
import type { IconHubIconDto } from "~/lib/strapi/dto/types";
import type { SharedButtonDto } from "~/lib/strapi/dto/components";

// showCta: Vue setzt ein fehlendes Boolean-Prop sonst auf false (siehe
// block/DoctorTeam.vue); in Strapi ist der Standard true.
const props = withDefaults(defineProps<BlockObjectionSectionDto>(), { showCta: true });

const cards = computed(() =>
  resolveObjectionCards<IconHubIconDto, SharedButtonDto>(props.items).map((c) => ({
    ...c,
    parts: c.text ? [{ text: c.text, strong: false }] : [],
  })),
);
</script>

<style scoped>
.objections {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-card-pad);
  text-align: center;
}

.objections__heading {
  margin: 0 0 var(--space-400);
  text-wrap: balance;
}

.objections__sub {
  max-width: 60ch;
  margin: 0 0 var(--space-500);
  color: var(--color-text-light);
}

.objections__list {
  width: 100%;
}

.objections__actions {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: var(--space-500);
}

.objections__btn {
  width: 100%;
}

@media (min-width: 900px) {
  .objections__btn {
    width: auto;
  }
}
</style>
