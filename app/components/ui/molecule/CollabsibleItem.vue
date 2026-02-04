<template>
  <div
    class="collabsibleItem"
    :class="{ 'collabsibleItem--tight': tightSpacing }"
  >
    <button
      :id="`collabsible-button-${id}`"
      class="collabsibleItem__summary"
      :aria-expanded="isOpen"
      :aria-controls="`collabsible-content-${id}`"
      @click="toggle"
      @keydown="handleKeydown"
    >
      <span class="collabsibleItem__title">
        <slot name="title">{{ title }}</slot>
      </span>
      <IconCirclePlus
        v-if="!isOpen"
        :size="32"
        stroke="1.5"
        class="collabsibleItem__icon"
        aria-hidden="true"
      />
      <IconCircleMinus
        v-else
        :size="32"
        stroke="1.5"
        class="collabsibleItem__icon"
        aria-hidden="true"
      />
    </button>
    <div
      :id="`collabsible-content-${id}`"
      ref="contentRef"
      class="collabsibleItem__content"
      :class="{ 'collabsibleItem__content--open': isOpen }"
      role="region"
      :aria-labelledby="`collabsible-button-${id}`"
      :aria-hidden="!isOpen ? 'true' : 'false'"
    >
      <div class="collabsibleItem__contentInner">
        <slot name="content">
          <UiLayoutRichText v-if="content" :blocks="content" />
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconCirclePlus, IconCircleMinus } from "@tabler/icons-vue";
import { ref, nextTick, watch, onMounted } from "vue";

const props = withDefaults(
  defineProps<{
    id: string | number;
    title?: string;
    content?: any[];
    defaultOpen?: boolean;
    tightSpacing?: boolean;
  }>(),
  {
    defaultOpen: false,
    tightSpacing: false,
  },
);

const emit = defineEmits<{
  toggle: [isOpen: boolean];
}>();

const isOpen = ref(props.defaultOpen);
const contentRef = ref<HTMLElement | null>(null);

const toggle = async () => {
  const wasOpen = isOpen.value;

  if (wasOpen) {
    if (contentRef.value) {
      animateClose(contentRef.value);
    }
    isOpen.value = false;
  } else {
    isOpen.value = true;
    await nextTick();
    if (contentRef.value) {
      animateOpen(contentRef.value);
    }
  }

  emit("toggle", isOpen.value);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggle();
  }
  if (event.key === "Escape" && isOpen.value) {
    event.preventDefault();
    toggle();
  }
};

const animateOpen = (element: HTMLElement) => {
  const inner = element.querySelector(
    ".collabsibleItem__contentInner",
  ) as HTMLElement;
  if (!inner) return;

  const startHeight = 0;
  const endHeight = inner.offsetHeight;
  const duration = 400;
  const startTime = performance.now();

  element.style.height = `${startHeight}px`;
  element.style.opacity = "0";

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeProgress = 1 - Math.pow(1 - progress, 3);

    const currentHeight =
      startHeight + (endHeight - startHeight) * easeProgress;
    element.style.height = `${currentHeight}px`;
    element.style.opacity = String(easeProgress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.style.height = "auto";
    }
  };

  requestAnimationFrame(animate);
};

const animateClose = (element: HTMLElement) => {
  const inner = element.querySelector(
    ".collabsibleItem__contentInner",
  ) as HTMLElement;
  if (!inner) return;

  const startHeight = element.offsetHeight;
  const endHeight = 0;
  const duration = 300;
  const startTime = performance.now();
  const startOpacity = parseFloat(getComputedStyle(element).opacity) || 1;

  element.style.height = `${startHeight}px`;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeProgress = Math.pow(progress, 3);

    const currentHeight =
      startHeight - (startHeight - endHeight) * easeProgress;
    element.style.height = `${currentHeight}px`;
    element.style.opacity = String(startOpacity * (1 - easeProgress));

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.style.height = "0px";
    }
  };

  requestAnimationFrame(animate);
};

onMounted(async () => {
  if (props.defaultOpen && contentRef.value) {
    await nextTick();
    const inner = contentRef.value.querySelector(
      ".collabsibleItem__contentInner",
    ) as HTMLElement;
    if (inner) {
      contentRef.value.style.height = "auto";
      contentRef.value.style.opacity = "1";
    }
  }
});

watch(
  () => props.defaultOpen,
  (newValue) => {
    if (newValue !== isOpen.value) {
      toggle();
    }
  },
);
</script>

<style scoped>
.collabsibleItem {
  flex: 1;
}

.collabsibleItem:first-child .collabsibleItem__summary {
  border-top: none;
}

.collabsibleItem__content {
  height: 0;
  overflow: hidden;
  opacity: 0;
  color: var(--color-text-light);
}

.collabsibleItem__contentInner {
  padding: 0 0 var(--space-400);
}

.collabsibleItem__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-500);
  width: 100%;
  padding: var(--space-500) 0;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--font-lg);
  text-align: left;
  line-height: var(--line-lg);
  color: var(--color-text);
  background: none;
  border: none;
  border-top: 1px solid var(--color-border-mute);
}

.collabsibleItem__title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-400);
  padding: var(--space-400) 0;
  cursor: pointer;
}

.collabsibleItem__icon {
  margin-left: auto;
  color: var(--color-text-light);
  flex-shrink: 0;
}

.collabsibleItem__summary:focus-visible {
  border-radius: 2px;
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
}

.collabsibleItem--tight .collabsibleItem__summary {
  padding: var(--space-200) 0;
  font-size: var(--font-md);
  line-height: var(--line-md);
}
</style>
