<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiOrganismMediaCard
      :card-settings="cardSettings"
      :layout="layout"
      :media-caption="!!employee"
      :caption-title="employeeFullName"
      :caption-description="employeeMeta"
    >
      <template #headline>
        <h2 v-if="headline" class="employee__heading">{{ headline }}</h2>
      </template>
      <template #intro>
        <p v-if="intro" class="employee__intro">{{ intro }}</p>
      </template>
      <template #content>
        <div v-if="hasContentBlocks" class="employee__content">
          <UiLayoutRichText :blocks="content!" />
        </div>
      </template>
      <template #media>
        <UiAtomMediaPicture
          v-if="employee?.photo && isMediaImage(employee.photo)"
          :media="employee.photo"
          :sources="imageSources"
          class="employee__photo"
        />
      </template>
      <template #links>
        <div v-if="hasLinks" class="employee__links">
          <UiMoleculeButtonGroup>
            <SharedButton v-for="link in links" :key="link.id" :button="link" />
          </UiMoleculeButtonGroup>
        </div>
      </template>
    </UiOrganismMediaCard>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { ImageFormat, ImageBreakpoint } from "~/lib/strapi/dto/enums";
import type { BlockEmployeeDto } from "~/lib/strapi/dto/components";
import { isMediaImage } from "~/utils/media";

const props = defineProps<BlockEmployeeDto>();

const imageSources = {
  [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
};

const hasContent = computed(
  () =>
    !!props.headline ||
    !!props.intro ||
    (props.content?.length ?? 0) > 0 ||
    !!props.employee?.photo ||
    (props.links?.length ?? 0) > 0,
);

const hasContentBlocks = computed(() => (props.content?.length ?? 0) > 0);

const hasLinks = computed(() => (props.links?.length ?? 0) > 0);

const employeeFullName = computed(() => {
  const e = props.employee;
  if (!e) return "";

  return [e.academicTitle, e.firstName, e.lastName]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(" ");
});

const employeeMeta = computed(() => {
  const e = props.employee;
  if (!e) return "";

  const department = (e.department ?? "").trim();
  const departmentCapitalized = department
    ? department.charAt(0).toUpperCase() + department.slice(1)
    : "";

  return [e.role, departmentCapitalized]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(" · ");
});
</script>

<style scoped>
.employee__heading {
  margin: 0 0 var(--space-600);
}

.employee__intro {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  padding-bottom: var(--space-600);
  margin: 0 0 var(--space-600);
  border-bottom: 1px solid var(--color-border-mute);
}

.employee__content {
  color: var(--color-text-light);
}

.employee__photo {
  aspect-ratio: 3 / 2;
}

.employee__links {
  margin-top: var(--space-600);
}
</style>
