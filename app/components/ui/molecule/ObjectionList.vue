<template>
  <!-- Einwaende mit Antwort ("Noch unsicher?") fuer block/ObjectionSection.vue
       (Seiten ohne v2-Vorlage); angelehnt an den Abschnitt der v2-Vorlage,
       die den Block in ihrem eigenen Markup zeigt (adsV2/Page.vue).
       Mobil untereinander, ab 900 px zwei Spalten; eine ungerade letzte Karte
       steht mittig (gleiche Raster-Logik wie UiMoleculeDoctorTeamList).
       Farben ueber CSS-Variablen, damit jede Flaeche (theme-*, v2-Gestaltungen)
       sie setzen kann:
         --objection-card-bg, --objection-card-text, --objection-card-text-light,
         --objection-icon-color -->
  <ul v-if="items.length" class="objection-list" role="list">
    <li v-for="item in items" :key="item.key" class="objection-list__item">
      <span class="objection-list__icon" aria-hidden="true">
        <UiLayoutIconWrapper v-if="item.icon?.iconData" :size="22" :icon="item.icon" :stroke-width="1.75">
          <g v-html="item.icon.iconData" />
        </UiLayoutIconWrapper>
        <component :is="item.iconComponent ?? IconCircleCheck" v-else size="22" />
      </span>
      <div class="objection-list__body">
        <h3 class="objection-list__q">{{ item.title }}</h3>
        <p v-if="item.parts.length" class="objection-list__a">
          <template v-for="(part, i) in item.parts" :key="i"><strong v-if="part.strong" class="objection-list__em">{{ part.text }}</strong><template v-else>{{ part.text }}</template></template>
        </p>
        <div v-if="item.link" class="objection-list__link" data-track-placement="objection_link">
          <SharedButton :button="item.link" :data="linkData" :button-props="{ variant: 'link', size: 'sm' }" />
        </div>
        <slot name="action" :item="item" />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { IconCircleCheck } from "@tabler/icons-vue";
import type { IconHubIconDto } from "~/lib/strapi/dto/types";
import type { SharedButtonDto } from "~/lib/strapi/dto/components";

export type ObjectionListItem = {
  key: string;
  title: string;
  /** Antwort in Teilen (fette Teile optional). */
  parts: { text: string; strong: boolean }[];
  /** Icon aus Strapi (Iconhub) ... */
  icon?: IconHubIconDto | null;
  /** ... oder ein Tabler-Icon (Texte aus dem Code). */
  iconComponent?: Component | null;
  /** Link unter der Antwort (shared.button). */
  link?: SharedButtonDto | null;
  [key: string]: unknown;
};

defineProps<{
  items: ObjectionListItem[];
  /** Buchungsdaten fuer Links mit Buchungs-Aktion (wie SharedButton :data). */
  linkData?: Record<string, unknown>;
}>();
</script>

<style scoped>
.objection-list {
  --objection-gap: var(--space-300);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--objection-gap);
  margin: 0;
  padding: 0;
  list-style: none;
}

.objection-list__item {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: var(--space-300);
  flex: 1 1 100%;
  min-width: 0;
  padding: var(--space-400);
  border-radius: var(--border-radius-200, 12px);
  background: var(--objection-card-bg, var(--card-color-bg-sub, var(--color-gray-100)));
  color: var(--objection-card-text, inherit);
  text-align: left;
}

.objection-list__icon {
  display: flex;
  margin-top: 1px;
  color: var(--objection-icon-color, currentColor);
}

.objection-list__body {
  min-width: 0;
}

/* Wie die bisherige <strong>-Zeile: deutlich fetter als der Fliesstext
   (--font-bold ist 500 und waere kaum vom Text zu unterscheiden) */
.objection-list__q {
  margin: 0 0 var(--space-100);
  font-size: inherit;
  line-height: inherit;
  font-weight: bolder;
}

.objection-list__a {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--objection-card-text-light, var(--color-text-light));
  /* lange Zeilen vermeiden */
  max-width: 65ch;
}

.objection-list__em {
  font-weight: var(--font-bold);
  color: var(--objection-card-text, var(--color-text));
}

/* Link: Textfarbe der Karte (auch auf dunklen Karten lesbar), Touch-Flaeche
   mind. 44 px hoch */
.objection-list__link {
  display: flex;
  align-items: center;
  min-height: 44px;
  margin-top: var(--space-100);
}

.objection-list__link :deep(.button) {
  --button-color-text: currentColor;
  font-weight: var(--font-bold);
}

/* Unterstreichung am Label: BaseButton setzt sie am <a>, das inline-flex-
   Label erbt sie aber nicht - ohne waere der Link nicht als Link erkennbar */
.objection-list__link :deep(.button__label) {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.objection-list__link :deep(.button:focus-visible) {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

@media (min-width: 900px) {
  .objection-list__item {
    flex: 0 1 calc((100% - var(--objection-gap)) / 2);
  }
}
</style>
