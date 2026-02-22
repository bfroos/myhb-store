<template>
  <div class="app">
    <BaseAppHeader />
    <main>
      <slot />
    </main>
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
.app > :nth-child(2) {
  flex: 1;
}
</style>
