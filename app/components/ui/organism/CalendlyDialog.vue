<template>
  <CalendlyInlineWidget
    v-if="params.url"
    :url="params.url"
    class="calendlyDialog"
  />
  <ul v-else class="calendlyDialog__locations">
    <li v-for="location in locations" :key="location.slug">
      <UiMoleculeLocationItem
        :item="location"
        layout="list"
        :on-book="() => handleLocationClick(location.calendlyUrl)"
        @close="handleClose()"
      />
    </li>
  </ul>
</template>
<script setup lang="ts">
import type { MoleculeLocationItem } from "~/lib/ui/types";

type CalendlyLocation = MoleculeLocationItem & {
  calendlyUrl: string;
};

const dialogRef = inject("dialogRef") as any;
const params = ref<any>({});
const locations = ref<CalendlyLocation[]>([]);
const { locale, fallbackLocale, t } = useI18n();

const handleLocationClick = (calendlyUrl: string) => {
  params.value.url = calendlyUrl;
};

const handleClose = () => {
  dialogRef.value.close();
};

const fetchLocations = async () => {
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const { data, error } = await useStrapiFetch<{
    data: CalendlyLocation[];
  }>("/locations/with-calendly-url", {
    query: {
      locale: currentLocale,
    },
    fetchOptions: {
      key: `locations-calendly:${currentLocale}`,
    },
  });

  if (error.value) {
    throw handleFetchError(error.value, t);
  }

  locations.value = data.value.data || [];
};

onMounted(() => {
  params.value = dialogRef.value.data;
  if (!params.value?.url) {
    fetchLocations();
  }
});
</script>
<style scoped>
.calendlyDialog {
  width: 100% !important;
  height: 100% !important;
}
.calendlyDialog__locations {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  padding: var(--space-card-pad-xs);
}
</style>
