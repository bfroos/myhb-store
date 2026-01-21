<template>
  <BaseEmptyState
    v-if="treatmentPageGroups.length === 0"
    :title="$t('treatments.errors.noTreatmentsGroups.title')"
    :description="$t('treatments.errors.noTreatmentsGroups.description')"
  />
  <template v-else>
    <BaseAppHeader />
    <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
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
