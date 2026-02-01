<template>
  <div class="app">
    <div>
      <BaseAppHeader />
      <slot />
    </div>
    <BaseAppFooter />
    <Toast />
    <DynamicDialog />
  </div>
</template>
<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.app > * {
  flex: 1;
}
.app > :last-child {
  flex: none;
}
</style>
