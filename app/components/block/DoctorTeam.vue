<template>
  <!-- Strapi blocks.doctor-team auf Seiten ohne v2-Vorlage (BlockRenderer).
       Die v2-Ads-Vorlage rendert den Block selbst (adsV2/Page.vue), mit
       demselben UiMoleculeDoctorTeamList und derselben Datenlogik. -->
  <UiLayoutSectionBlock v-if="cards.length">
    <UiLayoutCardSurface :card-settings="cardSettings ?? undefined">
      <div class="doctor-team">
        <h2 v-if="headline" class="doctor-team__heading">{{ headline }}</h2>
        <p v-if="description" class="doctor-team__intro">{{ description }}</p>
        <UiMoleculeDoctorTeamList :doctors="cards" class="doctor-team__list" />
        <p v-if="trustText" class="doctor-team__trust">{{ trustText }}</p>
        <div v-if="showCta !== false && cta" class="doctor-team__actions">
          <SharedButton :button="cta" :button-props="{ size: 'lg' }" class="doctor-team__btn" />
        </div>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { resolveDoctorCards } from "#shared/doctorTeam";
import type { BlockDoctorTeamDto } from "~/lib/strapi/dto/doctorTeam";
import type { StrapiMedia } from "~/lib/strapi/dto/types";

// showCta: Vue setzt ein fehlendes Boolean-Prop sonst auf false, der CTA
// waere dann stillschweigend weg; in Strapi ist der Standard true.
const props = withDefaults(defineProps<BlockDoctorTeamDto>(), { showCta: true });

const cards = computed(() => resolveDoctorCards<StrapiMedia>(props.doctors));
</script>

<style scoped>
.doctor-team {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-card-pad);
  text-align: center;
}

.doctor-team__heading {
  margin: 0 0 var(--space-400);
  text-wrap: balance;
}

.doctor-team__intro {
  max-width: 60ch;
  margin: 0 0 var(--space-500);
  color: var(--color-text-light);
}

.doctor-team__list {
  width: 100%;
  max-width: 760px;
}

.doctor-team__trust {
  max-width: 60ch;
  margin: var(--space-600) 0 0;
  color: var(--color-text-light);
}

.doctor-team__actions {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: var(--space-500);
}

/* mobil volle Breite (Touch-Flaeche), ab 900 px Inhaltsbreite */
.doctor-team__btn {
  width: 100%;
}

@media (min-width: 900px) {
  .doctor-team__btn {
    width: auto;
  }
}
</style>
