<template>
  <div
    class="appHeader__desktop appHeader__subNav"
    @mouseenter="cancelHideSubnav"
    @mouseleave="requestHideSubnav"
  >
    <ul v-if="items && items.length > 0" class="appheader__subNav__list">
      <li v-for="item in items" :key="item.href">
        <NuxtLinkLocale
          class="appheader__subNav__link"
          :to="item.href"
          @click="emit('hideSubnav')"
        >
          {{ item.label }}
        </NuxtLinkLocale>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "requestHideSubnav"): void;
  (e: "cancelHideSubnav"): void;
  (e: "hideSubnav"): void;
}>();

type SubnavItem = {
  id: number;
  label: string;
  href: string;
};

const props = defineProps<{
  items: SubnavItem[];
}>();

function requestHideSubnav() {
  emit("requestHideSubnav");
}

function cancelHideSubnav() {
  emit("cancelHideSubnav");
}
</script>
<style scoped>
.appHeader__subNav {
  position: absolute;
  top: calc(100% + var(--space-200));
  left: calc(var(--space-card-pad-sm) * -1);
  width: calc(100% + var(--space-card-pad-sm) * 2);
  background: var(--color-card-bg-light);
  box-shadow: var(--shadow-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius-200);
  padding: var(--space-card-pad-xs);
  list-style: none;
  margin: 0;
  z-index: 1000;
}

.appHeader__subNav::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  height: var(--space-200);
}
.appheader__subNav__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
.appheader__subNav__link {
  display: block;
  padding: var(--space-400) var(--space-400);
  border-radius: var(--border-radius-200);
  text-decoration: none;
}
.appheader__subNav__link:hover {
  background: var(--color-gray-100);
}
</style>
