<template>
  <nav class="appHeaderMainNav" aria-label="Hauptnavigation">
    <div
      ref="wrap"
      class="appHeaderMainNav__wrap"
      @mouseenter="cancelHideSubnav"
      @mouseleave="requestHideSubnav"
    >
      <div
        ref="scrollContainer"
        class="appHeaderMainNav__scroll"
        @scroll="updateOverflow"
      >
        <ul
          ref="listEl"
          class="appHeaderMainNav__list"
          :class="{
            'appHeaderMainNav__list--center': !hasOverflow,
            'appHeaderMainNav__list--start': hasOverflow,
          }"
        >
          <li
            v-for="link in links"
            :key="link.href"
            class="appHeaderMainNav__item"
          >
            <NuxtLinkLocale
              class="appHeaderMainNav__link"
              :class="{
                'appHeaderMainNav__link--active': currentMainNavId === link.id,
              }"
              :to="link.href"
              @mouseenter="showSubnav(link.id)"
            >
              {{ link.label }}
            </NuxtLinkLocale>
          </li>
        </ul>
      </div>

      <div
        v-if="canScrollRight"
        class="appHeaderMainNav__gradient appHeaderMainNav__gradient--right"
        aria-hidden="true"
      />
      <div
        v-if="canScrollLeft"
        class="appHeaderMainNav__gradient appHeaderMainNav__gradient--left"
        aria-hidden="true"
      />
      <button
        v-if="canScrollRight"
        type="button"
        class="appHeaderMainNav__chevron"
        aria-label="Weitere Menüpunkte anzeigen"
        @click="scrollRight"
      >
        <span aria-hidden="true">
          <IconChevronRight :size="24" />
        </span>
      </button>
      <button
        v-if="canScrollLeft"
        type="button"
        class="appHeaderMainNav__chevron appHeaderMainNav__chevron--left"
        aria-label="Zurück zu vorherigen Menüpunkten"
        @click="scrollLeft"
      >
        <span aria-hidden="true">
          <IconChevronLeft :size="24" />
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-vue";

type LinkItem = {
  id: number;
  label: string;
  href: string;
};

const props = defineProps<{
  links: LinkItem[];
  currentMainNavId: number | null;
}>();

const wrap = ref<HTMLElement | null>(null);
const scrollContainer = ref<HTMLElement | null>(null);
const listEl = ref<HTMLElement | null>(null);

const hasOverflow = ref(false);
const canScrollRight = ref(false);
const canScrollLeft = ref(false);

const emit = defineEmits<{
  (e: "showSubnav", id: number): void;
  (e: "requestHideSubnav"): void;
  (e: "cancelHideSubnav"): void;
}>();

function showSubnav(id: number) {
  emit("showSubnav", id);
}

function requestHideSubnav() {
  emit("requestHideSubnav");
}

function cancelHideSubnav() {
  emit("cancelHideSubnav");
}

function updateOverflow() {
  const wrapEl = wrap.value;
  const scrollEl = scrollContainer.value;
  const list = listEl.value;
  if (!wrapEl || !scrollEl) return;
  // Sichtbare Breite = Wrap; Overflow = wenn Liste breiter ist
  const visibleWidth = wrapEl.clientWidth;
  const contentWidth = list ? list.scrollWidth : scrollEl.scrollWidth;
  hasOverflow.value = contentWidth > visibleWidth;
  const atEnd =
    scrollEl.scrollLeft + scrollEl.clientWidth >= scrollEl.scrollWidth - 2;
  const atStart = scrollEl.scrollLeft <= 2;
  canScrollRight.value = hasOverflow.value && !atEnd;
  canScrollLeft.value = hasOverflow.value && !atStart;
}

function scrollRight() {
  const el = scrollContainer.value;
  if (!el) return;
  const step = el.clientWidth;
  el.scrollTo({
    left: el.scrollLeft + step,
    behavior: "smooth",
  });
}

function scrollLeft() {
  const el = scrollContainer.value;
  if (!el) return;
  const step = el.clientWidth;
  el.scrollTo({
    left: el.scrollLeft - step,
    behavior: "smooth",
  });
}

let ro: ResizeObserver | null = null;
let onResize: (() => void) | null = null;

onMounted(async () => {
  ro = new ResizeObserver(() => updateOverflow());
  if (scrollContainer.value) ro.observe(scrollContainer.value);
  if (wrap.value) ro.observe(wrap.value);
  if (listEl.value) ro.observe(listEl.value);
  onResize = () => updateOverflow();
  window.addEventListener("resize", onResize);
  await nextTick();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => updateOverflow());
  });
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => updateOverflow());
  }
});

watch(
  () => props.links,
  async () => {
    await nextTick();
    updateOverflow();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  ro?.disconnect();
  ro = null;
  if (onResize) {
    window.removeEventListener("resize", onResize);
    onResize = null;
  }
});
</script>

<style scoped>
.appHeaderMainNav {
  flex: 1;
  min-width: 0;
  width: 100%;
}
.appHeaderMainNav__wrap {
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}
.appHeaderMainNav__scroll {
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.appHeaderMainNav__scroll::-webkit-scrollbar {
  display: none;
}
.appHeaderMainNav__list {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
  white-space: nowrap;
}
.appHeaderMainNav__list--center {
  justify-content: center;
}
.appHeaderMainNav__list--start {
  justify-content: flex-start;
}
.appHeaderMainNav__item {
  position: relative;
  flex: 0 0 auto;
}
.appHeaderMainNav__link {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-size: 1rem;
}
.appHeaderMainNav__link--active,
.appHeaderMainNav__link:hover {
  background: var(--color-gray-100);
  border-radius: var(--border-radius-200);
}

.appHeaderMainNav__gradient {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4rem;
  z-index: 1;
  pointer-events: none;
}
.appHeaderMainNav__gradient--right {
  right: 0;
  background: linear-gradient(
    to right,
    transparent,
    var(--color-page-bg, #fff)
  );
}
.appHeaderMainNav__gradient--left {
  left: 0;
  background: linear-gradient(to left, transparent, var(--color-page-bg, #fff));
}
.appHeaderMainNav__chevron {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 0;
  background: var(--color-card-bg-light);
  cursor: pointer;
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.06);
}
.appHeaderMainNav__chevron > span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  height: 80%;
  border-radius: 999px;
}
.appHeaderMainNav__chevron:hover span {
  background: var(--color-gray-200);
}
.appHeaderMainNav__chevron--left {
  right: auto;
  left: 0;
}
</style>
