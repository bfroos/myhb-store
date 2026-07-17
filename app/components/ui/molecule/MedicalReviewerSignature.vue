<template>
  <aside class="medReviewer" aria-label="Medizinische Prüfung">
    <img
      v-if="reviewer.photoUrl"
      :src="reviewer.photoUrl"
      :alt="reviewer.name"
      class="medReviewer__photo"
      width="44"
      height="44"
      loading="lazy"
    />
    <p class="medReviewer__text">
      <span class="medReviewer__label">Medizinisch geprüft von </span>
      <NuxtLinkLocale
        :to="`/aerzte/${reviewer.slug}`"
        class="medReviewer__name"
      >{{ reviewer.name }}<template v-if="reviewer.jobTitle">, {{ reviewer.jobTitle }}</template></NuxtLinkLocale>
      <span v-if="formattedDate" class="medReviewer__date">
        · Zuletzt aktualisiert am {{ formattedDate }}
      </span>
    </p>
  </aside>
</template>

<script setup lang="ts">
import type { MedicalReviewer } from "~/utils/medicalReviewer";

const props = defineProps<{
  reviewer: MedicalReviewer;
  date?: string | null;
}>();

const formattedDate = computed(() => {
  if (!props.date) return "";
  const d = new Date(props.date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
});
</script>

<style scoped>
.medReviewer {
  display: flex;
  align-items: center;
  gap: var(--space-300, 0.75rem);
  width: 100%;
  max-width: 72rem;
  margin: var(--space-400, 1rem) auto;
  padding: var(--space-300, 0.75rem) var(--space-400, 1rem);
  box-sizing: border-box;
  border: 1px solid var(--color-gray-200, #e5e7eb);
  border-radius: var(--space-200, 0.5rem);
  background: var(--color-gray-50, #f9fafb);
}
.medReviewer__photo {
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}
.medReviewer__text {
  margin: 0;
  font-size: var(--font-sm, 0.875rem);
  line-height: 1.4;
  color: var(--color-gray-600, #4b5563);
}
.medReviewer__label {
  color: var(--color-gray-500, #6b7280);
}
.medReviewer__name {
  font-weight: 600;
  color: var(--color-black, #111);
  text-decoration: underline;
}
.medReviewer__date {
  color: var(--color-gray-500, #6b7280);
}
</style>
