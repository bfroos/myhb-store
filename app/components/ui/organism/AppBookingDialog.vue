<template>
  <iframe
    v-if="params.url"
    :src="params.url"
    class="appBookingDialog"
    title="Termin buchen"
    allow="clipboard-write; payment"
    loading="eager"
  />
</template>
<script setup lang="ts">
const dialogRef = inject("dialogRef") as any;
const params = ref<any>({});

onMounted(() => {
  params.value = dialogRef.value.data;
});
</script>
<style scoped>
.appBookingDialog {
  width: 100% !important;
  height: 100% !important;
  border: 0;
  display: block;
  overflow: hidden;
}
</style>
