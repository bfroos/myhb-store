<template>
  <div class="reviewContent">
    <div class="reviewContent__header">
      <a
        v-if="sourceUrl"
        :href="sourceUrl"
        target="_blank"
        rel="noopener nofollow"
        :aria-label="`Zur Bewertung bei ${source?.toLowerCase()}`"
      >
        <UiMoleculeReviewsBadge
          :rating="rating"
          :source="source"
          height="1.75rem"
        />
      </a>
      <UiMoleculeReviewsBadge
        v-else
        :rating="rating"
        :source="source"
        height="1.75rem"
      />
      <div class="reviewContent__name">{{ author }}</div>
      <div class="reviewContent__text">
        <span v-if="isExpanded || !needsTruncation">{{ text }}</span>
        <span v-else>{{ truncatedText }}</span>
        &nbsp;
        <UiAtomBaseButton
          v-if="needsTruncation"
          variant="link"
          size="sm"
          @click="toggleExpanded"
        >
          {{ isExpanded ? $t("common.less") : $t("common.more") }}
        </UiAtomBaseButton>
      </div>
    </div>
    <div v-if="location" class="reviewContent__location">
      <IconMapPin size="2.25em" stroke="1.5" />
      <div>
        <strong> {{ globals?.brand?.nameShort }} {{ location }}</strong>
        <div v-if="city">
          {{ city }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IconMapPin } from "@tabler/icons-vue";
import { ReviewSource } from "~/lib/strapi/dto/enums";
import { ref, computed } from "vue";
import { useGlobals } from "~/composables/useGlobals";

const globals = useGlobals();

const props = defineProps<{
  author: string;
  text?: string;
  rating: number;
  location?: string;
  city?: string;
  source?: ReviewSource;
  sourceUrl?: string;
}>();

const isExpanded = ref(false);

const needsTruncation = computed(
  () => props.text?.length && props.text.length > 400
);

const truncatedText = computed(() => {
  if (!needsTruncation.value) return props.text;
  return (props.text?.substring(0, 400) ?? "") + "...";
});

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};
</script>
<style scoped>
.reviewContent {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-600);
  color: var(--color-text);
}
.reviewContent__name {
  font-weight: var(--font-bold);
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  margin: var(--space-400) 0;
}
.reviewContent__location {
  display: flex;
  gap: var(--space-200);
  font-size: var(--font-xs);
  line-height: var(--line-xs);
}
.reviewContent__text {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}
.reviewContent__toggle {
  display: inline-block;
  margin-top: var(--space-200);
  padding: var(--space-100) var(--space-200);
  background: transparent;
  border: none;
  color: var(--color-primary, #0066cc);
  cursor: pointer;
  font-size: var(--font-sm);
  text-decoration: underline;
  font-weight: var(--font-medium, 500);
}
.reviewContent__toggle:hover {
  opacity: 0.8;
}
</style>
