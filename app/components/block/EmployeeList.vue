<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="employees">
        <header class="employees__header">
          <h2 v-if="headline" class="employees__heading">{{ headline }}</h2>
          <div v-if="hasContentBlocks" class="employees__intro">
            <UiLayoutRichText :blocks="content!" />
          </div>
        </header>
        <div v-if="hasEmployees" class="employees__list-wrapper">
          <ul class="employees__list" role="list">
            <li v-for="emp in employees" :key="emp.id" class="employees__item">
              <NuxtLinkLocale
                :to="`/aerzte/${emp.slug}`"
                class="employees__figure"
              >
                <UiAtomMediaPicture
                  v-if="emp.photo && isMediaImage(emp.photo)"
                  :media="emp.photo"
                  :sources="imageSources"
                  class="employees__image"
                />
                <IconUser
                  v-else
                  size="50%"
                  stroke="1"
                  class="employees__placeholder"
                  aria-hidden="true"
                />
              </NuxtLinkLocale>
              <div class="employees__body">
                <p class="employees__meta">
                  <strong class="employees__name">{{
                    getEmployeeFullName(emp)
                  }}</strong>
                  <span v-if="getEmployeeMeta(emp)" class="employees__role">
                    {{ getEmployeeMeta(emp) }}
                  </span>
                </p>
                <UiAtomBaseButton
                  as="nuxt-link-locale"
                  :to="`/aerzte/${emp.slug}`"
                  size="sm"
                  variant="secondary"
                >
                  {{ t("blocks.employeeList.readMore") }}
                </UiAtomBaseButton>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { IconUser } from "@tabler/icons-vue";
import { ImageFormat, ImageBreakpoint } from "~/lib/strapi/dto/enums";
import type { BlockEmployeeListDto } from "~/lib/strapi/dto/components";
import type { EmployeeDto } from "~/lib/strapi/dto/collections";
import { isMediaImage } from "~/utils/media";

const props = defineProps<BlockEmployeeListDto>();
const { t } = useI18n();

const imageSources = {
  [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
  [ImageBreakpoint.LARGE]: ImageFormat.LARGE,
};

const hasContent = computed(
  () =>
    (!!props.headline && (props.content?.length ?? 0) > 0) ||
    (props.employees?.length ?? 0) > 0,
);

const hasContentBlocks = computed(() => (props.content?.length ?? 0) > 0);

const hasEmployees = computed(() => (props.employees?.length ?? 0) > 0);

function getEmployeeFullName(emp: EmployeeDto): string {
  return [emp.academicTitle, emp.firstName, emp.lastName]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

function getEmployeeMeta(emp: EmployeeDto): string {
  const department = (emp.department ?? "").trim();
  const departmentCapitalized = department
    ? department.charAt(0).toUpperCase() + department.slice(1)
    : "";

  return [emp.role, departmentCapitalized]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(" · ");
}
</script>

<style scoped>
.employees {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.employees__header {
  padding: var(--space-card-pad);
}

.employees__heading {
  margin: 0 0 var(--space-600);
}

.employees__intro {
  margin: 0;
}

.employees__list-wrapper {
  min-width: 0;
}

.employees__list {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-600);
  border-top: 1px solid var(--color-border-mute);
  padding: var(--space-card-pad);
  list-style: none;
  margin: 0;
}

.employees__item {
  display: flex;
  flex-direction: column;
  background-color: var(--color-gray-100);
  border-radius: var(--border-radius-500);
  overflow: hidden;
}

.employees__figure {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 3 / 2;
  color: var(--color-text-muted);
  overflow: hidden;
}

.employees__figure:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
}

.employees__image {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 2 / 1;
}

.employees__image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.employees__placeholder {
  flex-shrink: 0;
}

.employees__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--space-400);
}

.employees__meta {
  margin: 0 0 var(--space-400);
}

.employees__name {
  display: block;
}

.employees__role {
  display: block;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  font-weight: normal;
}

@media (min-width: 900px) {
  .employees {
    flex-direction: row;
  }

  .employees__header {
    flex: 1 1 33%;
  }

  .employees__list-wrapper {
    flex: 2 1 67%;
  }

  .employees__list {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
