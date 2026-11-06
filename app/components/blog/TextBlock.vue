<template>
  <!-- Ratgeber-Layout (myhb-os#418): "Auf einen Blick" als hervorgehobene Box,
       sonst ruhige Lesetypografie mit Luft zwischen den Abschnitten. -->
  <div class="blogText" :class="{ 'blogText--glance': isGlance }">
    <UiLayoutRichText :blocks="content" />
  </div>
</template>
<script setup lang="ts">
import type { StrapiRichText } from "~/lib/strapi/dto/types";

const props = defineProps<{
  content: StrapiRichText;
}>();

const isGlance = computed(() => {
  const first = (props.content as any[] | undefined)?.[0];
  if (first?.type !== "heading") return false;
  const text = (first.children ?? []).map((c: any) => c.text ?? "").join("").trim();
  return /^auf einen blick$/i.test(text);
});
</script>

<style scoped>
.blogText {
  font-size: 1.0625rem;
  line-height: 1.7;
}
.blogText :deep(h2) {
  margin: 2.4em 0 0.6em;
  font-size: clamp(1.375rem, 1.2rem + 0.7vw, 1.75rem);
  line-height: 1.25;
}
.blogText :deep(h3) {
  margin: 1.8em 0 0.4em;
  font-size: 1.2rem;
  line-height: 1.3;
}
.blogText :deep(p) {
  margin: 0 0 1em;
}
.blogText :deep(ul),
.blogText :deep(ol) {
  margin: 0 0 1.2em;
  padding-left: 1.3em;
}
.blogText :deep(li) {
  margin-bottom: 0.45em;
}
.blogText :deep(a) {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.blogText--glance {
  margin: 0 0 2em;
  padding: var(--space-card-pad);
  background: var(--color-gray-100, #f4f2ef);
  border-radius: var(--border-radius-card, 24px);
}
.blogText--glance :deep(h2) {
  margin: 0 0 0.8em;
  font-size: 1.125rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.blogText--glance :deep(ul) {
  margin: 0;
  padding: 0;
  list-style: none;
}
.blogText--glance :deep(li) {
  position: relative;
  margin-bottom: 0.7em;
  padding-left: 2em;
}
.blogText--glance :deep(li:last-child) {
  margin-bottom: 0;
}
.blogText--glance :deep(li)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.3em;
  width: 1.2em;
  height: 1.2em;
  border-radius: 50%;
  background: var(--color-black, #111)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 8.5l2.5 2.5L12 5.5' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
    center / 70% no-repeat;
}
</style>
