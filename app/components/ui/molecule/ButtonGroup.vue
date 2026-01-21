<template>
  <div class="buttonGroup">
    <slot />
  </div>
</template>
<style scoped>
.buttonGroup {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-400);
}
</style>
