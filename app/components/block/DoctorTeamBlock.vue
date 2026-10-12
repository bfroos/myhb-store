<template>
  <UiLayoutSectionBlock v-if="cards.length">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <section class="team">
        <h2 v-if="headline" class="team__heading">{{ headline }}</h2>
        <p v-if="description" class="team__text">{{ description }}</p>
        <ul class="team__grid" role="list">
          <li v-for="card in cards" :key="card.key" class="team__card">
            <component
              :is="card.link ? NuxtLink : 'div'"
              :to="card.link"
              class="team__link"
            >
              <div v-if="card.image" class="team__image">
                <UiAtomMediaPicture :media="card.image" :alt="card.alt" />
              </div>
              <p class="team__name">{{ card.name }}</p>
              <p v-if="card.role" class="team__role">{{ card.role }}</p>
            </component>
          </li>
        </ul>
        <p v-if="trustText" class="team__text">{{ trustText }}</p>
        <SharedButton
          v-if="showCta !== false && cta"
          :button="cta"
          :button-props="{ size: 'lg' }"
          class="team__cta"
        />
      </section>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";
import type { EmployeeDto } from "~/lib/strapi/dto/collections";
import type { CardSettingsDto, SharedButtonDto } from "~/lib/strapi/dto/components";
import type { StrapiMedia } from "~/lib/strapi/dto/types";

type DoctorCard = {
  id?: number | string;
  employee?: Partial<EmployeeDto> | null;
  name?: string;
  role?: string;
  image?: StrapiMedia | null;
  imageAlt?: string;
  profileLink?: string;
};

const props = defineProps<{
  headline?: string;
  description?: string;
  doctors?: DoctorCard[];
  trustText?: string;
  showCta?: boolean;
  cta?: SharedButtonDto | null;
  cardSettings?: CardSettingsDto;
}>();

const localePath = useLocalePath();

const cards = computed(() =>
  (props.doctors ?? [])
    .map((doctor, index) => {
      const employee = doctor.employee;
      const name =
        doctor.name ||
        [employee?.academicTitle, employee?.firstName, employee?.lastName]
          .filter(Boolean)
          .join(" ");
      const link =
        doctor.profileLink ||
        (employee?.slug ? localePath(`/aerzte/${employee.slug}`) : undefined);
      return {
        key: doctor.id ?? index,
        name,
        role: doctor.role || employee?.role,
        image: doctor.image ?? employee?.photo ?? null,
        alt: doctor.imageAlt || name,
        link,
      };
    })
    .filter((card) => card.name),
);
</script>

<style scoped>
.team {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
}
.team__heading {
  margin: 0;
}
.team__text {
  margin: 0;
  color: var(--color-text-light);
  font-size: var(--font-md);
  line-height: var(--line-md);
}
.team__grid {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr));
  gap: var(--space-500);
}
.team__link {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  color: inherit;
  text-decoration: none;
}
.team__image {
  border-radius: var(--border-radius-card-figure);
  overflow: hidden;
  aspect-ratio: 4 / 5;
  background: var(--color-gray-200);
}
.team__image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.team__name {
  margin: 0;
  font-weight: var(--font-bold);
  font-size: var(--font-md);
}
.team__role {
  margin: 0;
  color: var(--color-text-light);
  font-size: var(--font-sm);
}
.team__cta {
  align-self: start;
}
</style>
