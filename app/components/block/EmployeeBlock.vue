<template>
  <BlockMediaCard
    :headline="headline"
    :intro="intro"
    :content="content"
    :media="employee?.photo"
    :media-caption="true"
    :caption-title="captionTitle"
    :caption-description="captionDescription"
    :cardSettings="cardSettings"
    :layout="layout"
    :links="links"
  />
</template>
<script setup lang="ts">
import type { BlockEmployeeDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockEmployeeDto>();

const captionTitle = computed(() => {
  const e = props.employee;
  if (!e) return "";

  return [e.academicTitle, e.firstName, e.lastName]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(" ");
});

const captionDescription = computed(() => {
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
