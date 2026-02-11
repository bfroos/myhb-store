<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="qualifications">
        <header class="qualifications__header">
          <h2 v-if="headline" class="qualifications__heading">
            {{ headline }}
          </h2>
        </header>
        <div class="qualifications__body">
          <dl class="qualifications__list">
            <div
              v-for="(group, index) in qualifications ?? []"
              :key="group.label ?? index"
              class="qualifications__item"
            >
              <dt class="qualifications__term">{{ group.label }}</dt>
              <dd class="qualifications__detail">
                <ul class="qualifications__items" role="list">
                  <li
                    v-for="(textItem, idx) in group.items"
                    :key="textItem.text ?? idx"
                    class="qualifications__text"
                  >
                    {{ textItem.text }}
                  </li>
                </ul>
              </dd>
            </div>
            <div v-if="hasVitaEntries" class="qualifications__item">
              <dt class="qualifications__term">
                {{ t("blocks.qualifications.vita") }}
              </dt>
              <dd class="qualifications__detail">
                <dl class="qualifications__vita">
                  <div
                    v-for="(entry, index) in vitaEntries ?? []"
                    :key="`${entry.fromYear}-${entry.toYear ?? 'now'}-${index}`"
                    class="qualifications__vita-entry"
                  >
                    <dt class="qualifications__vita-term">
                      {{ entry.fromYear }} –
                      {{ entry.toYear ?? t("common.date.today") }}
                    </dt>
                    <dd class="qualifications__vita-detail">
                      {{ entry.text }}
                    </dd>
                  </div>
                </dl>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { BlockQualificationsBlockDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockQualificationsBlockDto>();
const { t } = useI18n();

const hasContent = computed(
  () =>
    !!props.headline ||
    (props.qualifications?.length ?? 0) > 0 ||
    (props.vitaEntries?.length ?? 0) > 0,
);

const hasVitaEntries = computed(() => (props.vitaEntries?.length ?? 0) > 0);
</script>

<style scoped>
.qualifications {
  display: flex;
  flex-direction: column;
  padding: var(--space-card-pad);
  width: 100%;
}

.qualifications__heading {
  margin: 0 0 var(--space-600);
}

.qualifications__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-600);
}

.qualifications__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-600);
  margin: 0;
}

.qualifications__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
}

.qualifications__term {
  font-weight: var(--font-bold);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
  text-transform: uppercase;
  margin: 0;
}

.qualifications__detail {
  margin: 0 0 0 1em;
}

.qualifications__items {
  list-style-type: disc;
  margin: 0 0 0 1em;
  padding: 0;
}

.qualifications__text {
  margin: 0;
}

.qualifications__vita {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  row-gap: var(--space-400);
  margin: 0;
}

.qualifications__vita-entry {
  display: flex;
  flex-direction: column;
  gap: var(--space-100);
}

.qualifications__vita-term {
  font-weight: var(--font-bold);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
  text-transform: uppercase;
}

.qualifications__vita-detail {
  margin: 0;
}

@media (min-width: 900px) {
  .qualifications__item {
    display: grid;
    grid-template-columns: 140px 1fr;
  }

  .qualifications__detail {
    margin: 0;
  }

  .qualifications__vita {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: var(--space-400);
  }

  .qualifications__vita-entry {
    display: contents;
  }

  .qualifications__vita-term {
    margin: 0;
  }
}
</style>
