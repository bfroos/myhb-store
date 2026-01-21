<template>
  <div class="blogArticle__date">
    <span>{{ day }}</span>
    <span>{{ month }}</span>
    <span>{{ year }}</span>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  date: string | Date;
}>();

const dateObj = computed(() => {
  if (!props.date) return null;
  const d = typeof props.date === "string" ? new Date(props.date) : props.date;
  return isNaN(d.getTime()) ? null : d;
});

const day = computed(() => {
  if (!dateObj.value) return "";
  return dateObj.value.getDate().toString();
});

const month = computed(() => {
  if (!dateObj.value) return "";
  const monthName = dateObj.value.toLocaleDateString("de-DE", {
    month: "long",
  });
  return monthName.substring(0, 3);
});

const year = computed(() => {
  if (!dateObj.value) return "";
  return dateObj.value.getFullYear().toString();
});
</script>
<style scoped>
.blogArticle__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.blogArticle__date > span:nth-child(1) {
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
}
.blogArticle__date > span:nth-child(2) {
  font-weight: var(--font-bold);
  text-transform: uppercase;
  color: var(--color-text-light);
}
.blogArticle__date > span:nth-child(3) {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-light);
}
</style>
