<template>
  <ul class="companyStatsList">
    <li v-if="mapData.customersCount > 0">
      <strong>{{ mapData.customersCountLabel }}+</strong>
      <span>{{ $t(mapData.customersLabelKey.value) }}</span>
    </li>
    <li v-if="mapData.loungeCount > 0">
      <strong>{{ mapData.loungeCountLabel }}</strong>
      <span>{{ $t(mapData.loungesLabelKey.value) }}</span>
    </li>
    <li v-if="mapData.doctorCount > 0">
      <strong>{{ mapData.doctorCountLabel }}</strong>
      <span>{{ $t(mapData.doctorsLabelKey.value) }}</span>
    </li>
    <li v-if="mapData.clinicCount > 0">
      <strong>{{ mapData.clinicCountLabel }}</strong>
      <span>{{ $t(mapData.clinicLabelKey.value) }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
const mapData = await useLocationMapData();
</script>

<style scoped>
.companyStatsList {
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
}

.companyStatsList > li {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: var(--space-100);
  max-width: 100%;
  min-width: 140px;
  padding: var(--space-600) 0;
  border-top: var(--color-border-mute) 1px solid;
  border-left: var(--color-border-mute) 1px solid;
  margin-left: -1px;
}

.companyStatsList > li > strong {
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
}

.companyStatsList > li > span {
  color: var(--color-text-light);
}
</style>
