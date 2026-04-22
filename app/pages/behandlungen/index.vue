<template>
  <BaseEmptyState
    v-if="treatmentPageGroups.length === 0"
    :title="$t('treatments.errors.noTreatmentsGroups.title')"
    :description="$t('treatments.errors.noTreatmentsGroups.description')"
  />
  <template v-else>
    <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
    <h1 class="treatments-page__title">{{ $t('treatments.pageTitle') }}</h1>
    <BlockTreatmentTeasers
      v-for="(group, index) in treatmentPageGroups"
      :key="group.groupId"
      :treatment-pages="group.treatmentPages"
      :headline="group.groupName"
      :show-prices="true"
      :show-descriptions="true"
      :show-short-descriptions="true"
      :card-settings="{ colorTheme: themeOrder[index % themeOrder.length] }"
    />
  </template>
</template>
<script setup lang="ts">
import { ColorTheme } from "~/lib/strapi/dto/enums";

const { fetchTreatmentPageGroups, treatmentPageGroups, seo } =
  useTreatmentsPage();

const themeOrder = [ColorTheme.LIGHT, ColorTheme.SOFT, ColorTheme.NEUTRAL];

const treatmentPageGroupsLoaded = await fetchTreatmentPageGroups();

if (treatmentPageGroupsLoaded) {
  await setPageSeo(seo.value);
}

const breadcrumbItems = computed(() => [
  {
    title: $t("treatments.treatment.allTreatments"),
    to: "/behandlungen",
  },
]);
</script>
<style scoped>
.treatments-page__title {
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
  margin: var(--space-600) 0 var(--space-500);
  padding: 0 var(--space-page-x);
  text-align: center;
}

@media (min-width: 900px) {
  .treatments-page__title {
    font-size: var(--font-3xl);
    line-height: var(--line-3xl);
    margin: var(--space-700) 0 var(--space-600);
  }
}
</style>
