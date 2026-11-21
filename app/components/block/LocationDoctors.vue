<template>
  <UiLayoutSectionBlock v-if="doctors.length">
    <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.SOFT }">
      <div class="locationDoctors" data-location-doctors>
        <h2 class="locationDoctors__title">{{ title }}</h2>
        <ul class="locationDoctors__list" role="list">
          <li v-for="d in doctors" :key="d.slug">
            <NuxtLinkLocale :to="`/aerzte/${d.slug}`" class="locationDoctors__link">
              {{ d.name }}
            </NuxtLinkLocale>
          </li>
        </ul>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
/**
 * store#422 (E24): Die Standortseite verlinkt die Ärzte dieses Standorts.
 * Ärzteseiten bekamen vorher höchstens einen internen Link (Audit 05.11.2026);
 * für Google sind sie ein Zeichen, dass echte Ärzte behandeln.
 * Daten: /api/standort-aerzte/:loc (nur öffentliche Ärzte mit eigener Seite).
 */
import { ColorTheme } from "~/lib/strapi/dto/enums";
import type { StandortArztLink } from "#shared/standortAerzte";

const props = defineProps<{
  locationSlug: string;
}>();

const { locale } = useI18n();
const { data } = await useFetch<{ doctors?: StandortArztLink[] }>(
  () => `/api/standort-aerzte/${props.locationSlug}`,
  { key: `standort-aerzte:${props.locationSlug}`, default: () => ({ doctors: [] }) },
);
const doctors = computed(() => data.value?.doctors ?? []);
// Standortnamen wechseln den Artikel („in den Köln Arcaden“, „in der
// MediaPark Klinik“), deshalb ohne Namen.
const title = computed(() => (locale.value === "en" ? "Our doctors at this location" : "Unsere Ärzte an diesem Standort"));
</script>

<style scoped>
.locationDoctors {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-s, 0.75rem);
}
.locationDoctors__title {
  margin: 0;
  font-size: var(--font-l, 1.25rem);
}
.locationDoctors__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.locationDoctors__link {
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
