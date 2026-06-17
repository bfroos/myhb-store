<template>
  <section
    v-if="hasContent"
    class="block seo"
    :class="[themeClass, { 'block--elevated': elevated }]"
  >
    <div class="seo__list" role="list">
      <UiMoleculeCollabsibleItem
        v-for="(item, idx) in items"
        :key="item.id"
        :id="item.id"
        :title="item.title"
        :content="item.content"
        :default-open="(idx === 0 && openFirst) || item.isOpenByDefault"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SharedCollapsibleItemDto } from "~/lib/strapi/dto/components";

const props = withDefaults(defineProps<{
  items?: SharedCollapsibleItemDto[];
  openFirst?: boolean;
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
  openFirst: false,
  items: () => [],
});

const hasContent = computed(() => (props.items?.length ?? 0) > 0);
</script>

<style scoped>
.block {
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  padding: 0 var(--space-card-pad);
}
.block--elevated { box-shadow: var(--shadow-1); }
.seo__list {
  display: flex;
  flex-direction: column;
}
@media (min-width: 900px) {
  .block { padding: 0 var(--space-card-pad-lg, 32px); max-width: 1000px; margin-inline: auto; }
}
</style>
