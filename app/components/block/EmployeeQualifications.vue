<template>
  <UiLayoutSectionBlock
    v-if="
      (qualifications && qualifications.length > 0) ||
      (vitaEntries && vitaEntries.length > 0)
    "
  >
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="qualificationsBlock">
        <h2 v-if="headline">{{ headline }}</h2>
        <div class="qualificationsBlock__content">
          <dl class="qualificationsBlock__contentList">
            <div
              v-for="item in qualifications"
              :key="item.label"
              class="qualificationsBlock__contentItem"
            >
              <dt>{{ item.label }}</dt>
              <dd>
                <ul>
                  <li
                    v-for="text in item.items"
                    :key="text.text"
                    class="qualificationsBlock__contentItemText"
                  >
                    {{ text.text }}
                  </li>
                </ul>
              </dd>
            </div>
            <div
              v-if="vitaEntries && vitaEntries.length > 0"
              class="qualificationsBlock__contentItem"
            >
              <dt>
                {{ $t("blocks.qualifications.vita") }}
              </dt>
              <dd>
                <dl class="qualificationsBlock__contentItemList">
                  <template
                    v-for="item in vitaEntries"
                    :key="item.text"
                    class="qualificationsBlock__contentItemText"
                  >
                    <dt>
                      {{ item.fromYear }} –
                      {{ item.toYear || $t("common.date.today") }}
                    </dt>
                    <dd>
                      {{ item.text }}
                    </dd>
                  </template>
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
</script>
<style scoped>
.qualificationsBlock {
  display: flex;
  flex-direction: column;
  padding: var(--space-card-pad);
}

.qualificationsBlock ul {
  list-style-type: disc;
  margin: 0 0 0 1em;
}

.qualificationsBlock__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-600);
}

.qualificationsBlock h2 {
  margin-bottom: var(--space-600);
}
.qualificationsBlock__contentList,
.qualificationsBlock__contentItemList {
  display: flex;
  flex-direction: column;
  gap: var(--space-600);
}
.qualificationsBlock__contentItemList {
  row-gap: var(--space-200);
}
.qualificationsBlock__contentItem {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
}
.qualificationsBlock__contentItem > dt,
.qualificationsBlock__contentItemText dt {
  font-weight: var(--font-bold);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
  text-transform: uppercase;
}

.qualificationsBlock__contentItemText dt {
  display: block;
  margin: 0 0 var(--space-200);
}

@media screen and (min-width: 900px) {
  .qualificationsBlock__contentItemList {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: var(--space-400);
  }

  .qualificationsBlock__contentItem {
    display: grid;
    grid-template-columns: 140px 1fr;
  }
}
</style>
