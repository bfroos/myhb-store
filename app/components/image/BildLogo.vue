<template>
  <svg
    v-bind="$attrs"
    class="inlineSvg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 27 27"
    fill="currentColor"
    alt="Bild Logo"
  >
    <path
      d="M12.404 4.661v22.114h-3.23V4.661h3.23zM17.032.002v26.773h-3.23V.002h3.23zM26.201 0v26.774l-6.367-.009c-.776-.002-1.405-.644-1.407-1.443l.004-19.218c.002-.8.627-1.443 1.396-1.444h3.144V0h3.23zM6.376.002c.768.002 1.398.644 1.399 1.443v9.382a1.36 1.36 0 0 1-1.347 1.367l-.142-.001c.818 0 1.488.68 1.488 1.515v11.614c-.002.8-.632 1.441-1.408 1.443H0L.002.002h6.374zM3.23 14.211v9.243h1.326v-9.243H3.23zm18.415 9.243h1.326V7.931h-1.326v15.523zM3.23 3.307v7.627h1.326V3.307H3.23zM12.404.001v3.306h-3.23V.001h3.23z"
    />
  </svg>
</template>
<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>

<style scoped>
.inlineSvg {
  display: block;
}
</style>
