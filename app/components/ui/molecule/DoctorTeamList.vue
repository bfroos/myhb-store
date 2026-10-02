<template>
  <!-- Aerzt:innen als runde Portraets mit Titel/Name (ehemals .v2-doctors in
       adsV2/Page.vue). Genutzt von der v2-Vorlage und BlockDoctorTeam.vue.
       Raster: mobil drei, ab 900 px vier pro Reihe; unvollstaendige Reihen
       stehen mittig, damit 1, 2 oder 4+ Karten ausgewogen wirken. -->
  <ul v-if="doctors.length" class="doctor-team-list" role="list">
    <li v-for="doc in doctors" :key="doc.key" class="doctor-team-list__item">
      <component
        :is="linkTag(doc)"
        v-bind="linkAttrs(doc)"
        class="doctor-team-list__card"
        :class="{ 'doctor-team-list__card--link': !!doc.profileLink }"
      >
        <span class="doctor-team-list__photo">
          <UiAtomMediaPicture
            v-if="doc.photo"
            :media="doc.photo"
            :alt="doc.alt"
          />
          <IconUser
            v-else
            size="50%"
            stroke="1"
            class="doctor-team-list__placeholder"
            aria-hidden="true"
          />
        </span>
        <span class="doctor-team-list__name">
          <span class="doctor-team-list__title">{{ doc.title || "\u00a0" }}</span>
          <strong class="doctor-team-list__full">{{ doc.name }}</strong>
        </span>
      </component>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { resolveComponent } from "vue";
import { IconUser } from "@tabler/icons-vue";
import type { ResolvedDoctorCard } from "#shared/doctorTeam";
import type { StrapiMedia } from "~/lib/strapi/dto/types";

defineProps<{
  doctors: ResolvedDoctorCard<StrapiMedia>[];
}>();

const NuxtLinkLocale = resolveComponent("NuxtLinkLocale");

function linkTag(doc: ResolvedDoctorCard<StrapiMedia>) {
  if (!doc.profileLink) return "div";
  return doc.profileLink.startsWith("/") ? NuxtLinkLocale : "a";
}

function linkAttrs(doc: ResolvedDoctorCard<StrapiMedia>) {
  if (!doc.profileLink) return {};
  return doc.profileLink.startsWith("/")
    ? { to: doc.profileLink }
    : { href: doc.profileLink, rel: "noopener" };
}
</script>

<style scoped>
.doctor-team-list {
  --doctor-team-gap: var(--space-300);
  --doctor-team-cols: 3;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-500) var(--doctor-team-gap);
  margin: 0;
  padding: 0;
  list-style: none;
}

.doctor-team-list__item {
  flex: 0 0
    calc(
      (100% - (var(--doctor-team-cols) - 1) * var(--doctor-team-gap)) /
        var(--doctor-team-cols)
    );
  min-width: 0;
}

.doctor-team-list__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-200);
  height: 100%;
  text-align: center;
  color: inherit;
  text-decoration: none;
  border-radius: var(--border-radius-500);
}

.doctor-team-list__card--link:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 4px;
}

.doctor-team-list__card--link:hover .doctor-team-list__full {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.doctor-team-list__photo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  /* Tablet: drei Spalten waeren sonst ~200 px grosse Kreise */
  max-width: 150px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 999px;
  background: var(--doctor-team-photo-bg, var(--color-gray-200));
  color: var(--color-text-muted);
}

.doctor-team-list__photo :deep(picture),
.doctor-team-list__photo :deep(img) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.doctor-team-list__photo :deep(img) {
  object-fit: cover;
  object-position: center 25%;
}

/* Zwei feste Zeilen (Titel / Name), damit alle Namen auf einer Hoehe stehen */
.doctor-team-list__name {
  display: grid;
  grid-template-rows: auto auto;
  width: 100%;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.doctor-team-list__title {
  color: var(--color-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doctor-team-list__full {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  min-height: calc(2em * var(--line-sm, 1.5));
  hyphens: auto;
}

@media (min-width: 900px) {
  .doctor-team-list {
    --doctor-team-cols: 4;
  }
}
</style>
