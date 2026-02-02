<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <article class="employeeList">
        <header class="employeeList__header">
          <h2 v-if="headline">{{ headline }}</h2>
          <UiLayoutRichText
            v-if="content && content.length > 0"
            :blocks="content"
          />
        </header>
        <div
          v-if="employees && employees.length > 0"
          class="employeeList__items"
        >
          <ul class="employeeList__itemsList">
            <li
              v-for="employee in employees"
              :key="employee.id"
              class="employeeList__item"
            >
              <NuxtLinkLocale
                :to="`/aerzte/${employee.slug}`"
                class="employeeList__itemImage"
              >
                <UiAtomMediaPicture
                  v-if="employee.photo"
                  :media="employee.photo"
                />
                <IconUser v-else size="50%" stroke="1" />
              </NuxtLinkLocale>
              <div class="employeeList__itemContent">
                <p>
                  <b>
                    {{ employee.academicTitle }} {{ employee.firstName }}
                    {{ employee.lastName }}
                  </b>
                  <span v-if="employee.role">
                    {{ employee.role }}
                    <template v-if="employee.department">
                      · {{ employee.department }}
                    </template>
                  </span>
                </p>
                <div>
                  <UiAtomBaseButton
                    as="nuxt-link-locale"
                    :to="`/aerzte/${employee.slug}`"
                    size="sm"
                    variant="secondary"
                  >
                    {{ $t("blocks.employeeList.readMore") }}
                  </UiAtomBaseButton>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </article>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import { IconUser } from "@tabler/icons-vue";
import type { BlockEmployeeListDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockEmployeeListDto>();
</script>
<style scoped>
.employeeList {
  display: flex;
  flex-direction: column;
}

.employeeList__header {
  padding: var(--space-card-pad);
}

.employeeList__header h2 {
  margin-bottom: var(--space-600);
}

.employeeList__itemsList {
  display: grid;
  gap: var(--space-600);
  grid-template-columns: 1fr;
  border-top: 1px solid var(--color-border-mute);
  padding: var(--space-card-pad);
}

.employeeList__item {
  display: flex;
  flex-direction: column;
  background-color: var(--color-gray-100);
  border-radius: var(--border-radius-500);
  overflow: hidden;
}

.employeeList__item :deep(picture) {
  display: block;
  aspect-ratio: 2 / 1;
}

.employeeList__item :deep(picture) > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.employeeList__itemImage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  aspect-ratio: 2 / 1;
  color: var(--color-text-muted);
}

.employeeList__itemContent {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--space-400);
}

.employeeList__itemContent > p {
  margin-bottom: var(--space-400);
}

.employeeList__itemContent > p > span {
  display: block;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

@media screen and (min-width: 900px) {
  .employeeList {
    flex-direction: row;
  }

  .employeeList__header {
    flex: 1;
  }

  .employeeList__items {
    flex: 2;
  }

  .employeeList__itemsList {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
