<template>
  <div ref="wrap" class="horizontalFilterChips">
    <div
      ref="scrollEl"
      class="horizontalFilterChips__scroll"
      @scroll="updateOverflow"
    >
      <ul class="horizontalFilterChips__list">
        <li>
          <button
            type="button"
            class="horizontalFilterChips__button"
            :class="{
              'horizontalFilterChips__button--active': modelValue === null,
            }"
            :aria-pressed="modelValue === null"
            @click="emit('update:modelValue', null)"
          >
            {{ allLabel }}
          </button>
        </li>
        <li v-for="item in items" :key="item.key">
          <button
            type="button"
            class="horizontalFilterChips__button"
            :class="{
              'horizontalFilterChips__button--active': modelValue === item.key,
            }"
            :aria-pressed="modelValue === item.key"
            @click="emit('update:modelValue', item.key)"
          >
            {{ item.label }}
          </button>
        </li>
      </ul>
    </div>

    <div
      v-if="canScrollRight"
      class="horizontalFilterChips__gradient horizontalFilterChips__gradient--right"
      aria-hidden="true"
    />
    <div
      v-if="canScrollLeft"
      class="horizontalFilterChips__gradient horizontalFilterChips__gradient--left"
      aria-hidden="true"
    />

    <button
      v-if="canScrollRight"
      type="button"
      class="horizontalFilterChips__chevron"
      :aria-label="nextLabel"
      @click="scrollRight"
    >
      <span aria-hidden="true">
        <IconChevronRight :size="20" />
      </span>
    </button>
    <button
      v-if="canScrollLeft"
      type="button"
      class="horizontalFilterChips__chevron horizontalFilterChips__chevron--left"
      :aria-label="previousLabel"
      @click="scrollLeft"
    >
      <span aria-hidden="true">
        <IconChevronLeft :size="20" />
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-vue";

type FilterChipItem = {
  key: string;
  label: string;
};

const props = withDefaults(
  defineProps<{
    items: FilterChipItem[];
    modelValue: string | null;
    allLabel: string;
    nextLabel?: string;
    previousLabel?: string;
  }>(),
  {
    nextLabel: "Weitere Filter anzeigen",
    previousLabel: "Zurück zu vorherigen Filtern",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();

const wrap = ref<HTMLElement | null>(null);
const scrollEl = ref<HTMLElement | null>(null);
const canScrollRight = ref(false);
const canScrollLeft = ref(false);

watch(
  () => props.items,
  async () => {
    await nextTick();
    updateOverflow();
  },
  { deep: true },
);

onMounted(async () => {
  window.addEventListener("resize", updateOverflow);
  await nextTick();
  updateOverflow();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateOverflow);
});

function updateOverflow() {
  const el = scrollEl.value;
  if (!el) {
    canScrollLeft.value = false;
    canScrollRight.value = false;
    return;
  }

  const maxScrollLeft = Math.max(el.scrollWidth - el.clientWidth, 0);
  const hasOverflow = maxScrollLeft > 2;
  const atEnd = el.scrollLeft >= maxScrollLeft - 2;
  const atStart = el.scrollLeft <= 2;

  canScrollRight.value = hasOverflow && !atEnd;
  canScrollLeft.value = hasOverflow && !atStart;
}

function scrollRight() {
  const el = scrollEl.value;
  if (!el) return;
  el.scrollTo({
    left: el.scrollLeft + el.clientWidth,
    behavior: "smooth",
  });
}

function scrollLeft() {
  const el = scrollEl.value;
  if (!el) return;
  el.scrollTo({
    left: el.scrollLeft - el.clientWidth,
    behavior: "smooth",
  });
}
</script>

<style scoped>
.horizontalFilterChips {
  --horizontalFilterChips-chevron-size: 2.25rem;
  --horizontalFilterChips-fade-width: 4rem;
  position: relative;
}

.horizontalFilterChips__scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding-right: var(--space-card-pad);
  box-sizing: border-box;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.horizontalFilterChips__scroll::-webkit-scrollbar {
  display: none;
}

.horizontalFilterChips__list {
  display: flex;
  flex-wrap: nowrap;
  gap: var(--space-200);
  margin: 0;
  padding: 0;
  list-style: none;
  white-space: nowrap;
}

.horizontalFilterChips__list > li {
  flex: 0 0 auto;
}

.horizontalFilterChips__button {
  display: inline-block;
  appearance: none;
  border: none;
  border-radius: var(--border-radius-200);
  padding: var(--space-200) var(--space-400);
  background: transparent;
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.horizontalFilterChips__button:hover {
  background-color: var(--card-color-bg-item-hover);
}

.horizontalFilterChips__button--active {
  background-color: var(--card-color-bg-item-hover);
}

.horizontalFilterChips__gradient {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--horizontalFilterChips-fade-width);
  z-index: 1;
  pointer-events: none;
}

.horizontalFilterChips__gradient--right {
  right: 0;
  background: linear-gradient(
    to right,
    transparent 0%,
    var(--card-color-bg)
      calc(100% - (var(--horizontalFilterChips-chevron-size) / 2)),
    var(--card-color-bg) 100%
  );
}

.horizontalFilterChips__gradient--left {
  left: 0;
  background: linear-gradient(
    to left,
    transparent 0%,
    var(--card-color-bg)
      calc(100% - (var(--horizontalFilterChips-chevron-size) / 2)),
    var(--card-color-bg) 100%
  );
}

.horizontalFilterChips__chevron {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--horizontalFilterChips-chevron-size);
  height: var(--horizontalFilterChips-chevron-size);
  padding: 0;
  border: 0;
  background: var(--card-color-bg-light);
  cursor: pointer;
  box-shadow: -4px 0 8px rgb(0 0 0 / 0.06);
}

.horizontalFilterChips__chevron > span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  height: 80%;
  border-radius: 999px;
}

.horizontalFilterChips__chevron:hover > span {
  border: 2px solid var(--color-white);
}

.horizontalFilterChips__chevron--left {
  right: auto;
  left: 0;
}
</style>
