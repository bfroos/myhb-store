<template>
  <ul v-if="hasContent" class="stats" role="list">
    <li v-for="item in statItems" :key="item.key" class="stats__item">
      <strong class="stats__value">{{ item.value }}</strong>
      <span class="stats__label">{{ t(item.labelKey) }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
const mapData = await useLocationMapData();
const { t } = useI18n();

type StatItem = {
  key: string;
  value: string;
  labelKey: string;
};

const statItems = computed<StatItem[]>(() => {
  const items: StatItem[] = [];

  if (mapData.customersCount > 0) {
    items.push({
      key: "customers",
      value: `${mapData.customersCountLabel.value}+`,
      labelKey: mapData.customersLabelKey.value,
    });
  }

  if (mapData.loungeCount > 0) {
    items.push({
      key: "lounges",
      value: mapData.loungeCountLabel.value,
      labelKey: mapData.loungesLabelKey.value,
    });
  }

  if (mapData.doctorCount > 0) {
    items.push({
      key: "doctors",
      value: mapData.doctorCountLabel.value,
      labelKey: mapData.doctorsLabelKey.value,
    });
  }

  if (mapData.clinicCount > 0) {
    items.push({
      key: "clinic",
      value: mapData.clinicCountLabel.value,
      labelKey: mapData.clinicLabelKey.value,
    });
  }

  return items;
});

const hasContent = computed(() => statItems.value.length > 0);
</script>

<style scoped>
.stats {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.stats__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: var(--space-100);
  min-width: 140px;
  max-width: 100%;
  padding: var(--space-600) 0;
  margin-left: -1px;
  border-top: 1px solid var(--color-border-mute);
  border-left: 1px solid var(--color-border-mute);
}

.stats__value {
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
}

.stats__label {
  color: var(--color-text-light);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}
</style>
