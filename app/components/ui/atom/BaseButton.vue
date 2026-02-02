<template>
  <button
    v-if="props.as === 'button'"
    :type="props.as === 'button' ? props.type : undefined"
    :disabled="buttonDisabled"
    :aria-label="iconOnlyComputed ? ariaLabel : undefined"
    :aria-disabled="ariaDisabled"
    class="button"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span
      v-if="$slots.prefix"
      class="button__icon button__icon--prefix"
      aria-hidden="true"
    >
      <slot name="prefix" />
    </span>

    <span v-if="!iconOnlyComputed" class="button__label">
      <slot />
    </span>

    <span v-else class="button__icon" aria-hidden="true">
      <slot />
    </span>

    <span
      v-if="$slots.suffix"
      class="button__icon button__icon--suffix"
      aria-hidden="true"
    >
      <slot name="suffix" />
    </span>
  </button>

  <a
    v-else-if="props.as === 'a'"
    :href="linkHref"
    :target="linkTarget"
    :rel="linkRel"
    :aria-label="iconOnlyComputed ? ariaLabel : undefined"
    :aria-disabled="ariaDisabled"
    :tabindex="linkTabindex"
    class="button"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span
      v-if="$slots.prefix"
      class="button__icon button__icon--prefix"
      aria-hidden="true"
    >
      <slot name="prefix" />
    </span>

    <span v-if="!iconOnlyComputed" class="button__label">
      <slot />
    </span>

    <span v-else class="button__icon" aria-hidden="true">
      <slot />
    </span>

    <span
      v-if="$slots.suffix"
      class="button__icon button__icon--suffix"
      aria-hidden="true"
    >
      <slot name="suffix" />
    </span>
  </a>

  <component
    v-else
    :is="resolvedNuxtLinkComponent"
    :to="nuxtLinkTo"
    :prefetch="nuxtLinkPrefetch"
    :external="nuxtLinkExternal"
    :aria-label="iconOnlyComputed ? ariaLabel : undefined"
    :aria-disabled="ariaDisabled"
    :tabindex="linkTabindex"
    class="button"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span
      v-if="$slots.prefix"
      class="button__icon button__icon--prefix"
      aria-hidden="true"
    >
      <slot name="prefix" />
    </span>

    <span v-if="!iconOnlyComputed" class="button__label">
      <slot />
    </span>

    <span v-else class="button__icon" aria-hidden="true">
      <slot />
    </span>

    <span
      v-if="$slots.suffix"
      class="button__icon button__icon--suffix"
      aria-hidden="true"
    >
      <slot name="suffix" />
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, useSlots, resolveComponent, type Component } from "vue";
import type { BaseButtonProps } from "~/lib/ui/types";

const props = withDefaults(defineProps<BaseButtonProps>(), {
  as: "button",
  type: "button",
  disabled: false,
  variant: "primary",
  size: "md",
  iconOnly: false,
  isToggle: false,
  ariaLabel: "",
  prefetch: undefined,
  external: false,
  fullWidth: false,
  wide: false,
});

const slots = useSlots();

// Resolve Nuxt components using resolveComponent for SSR safety
// This ensures they are properly imported as components, not just strings
let NuxtLinkComponent: Component | string = "NuxtLink";
let NuxtLinkLocaleComponent: Component | string = "NuxtLinkLocale";

try {
  NuxtLinkComponent = resolveComponent("NuxtLink");
} catch {
  NuxtLinkComponent = "NuxtLink";
}

try {
  NuxtLinkLocaleComponent = resolveComponent("NuxtLinkLocale");
} catch {
  NuxtLinkLocaleComponent = "NuxtLinkLocale";
}

const resolvedNuxtLinkComponent = computed<Component | string>(() => {
  return props.as === "nuxt-link" ? NuxtLinkComponent : NuxtLinkLocaleComponent;
});

const iconOnlyComputed = computed(() => {
  const hasDefault = !!slots
    .default?.()
    .some((v) => String(v.children ?? "").trim().length);
  return props.iconOnly || !hasDefault;
});

const buttonClasses = computed(() => [
  `button--${props.variant}`,
  `button--${props.size}`,
  { "button--wide": props.wide },
  { "button--isToggle": props.isToggle },
  { "button--iconOnly": iconOnlyComputed.value },
  { "button--fullWidth": props.fullWidth },
]);

const buttonType = computed(() => {
  return props.as === "button" ? props.type : undefined;
});

const buttonDisabled = computed(() => {
  return props.as === "button" ? props.disabled : undefined;
});

const linkHref = computed(() => {
  if (props.as === "a" && !props.disabled) {
    return props.href;
  }
  return undefined;
});

const linkTarget = computed(() => {
  return props.as === "a" ? props.target : undefined;
});

const linkRel = computed(() => {
  return props.as === "a" ? props.rel : undefined;
});

const nuxtLinkTo = computed(() => {
  if (
    (props.as === "nuxt-link" || props.as === "nuxt-link-locale") &&
    !props.disabled
  ) {
    return props.to;
  }
  return undefined;
});

const nuxtLinkPrefetch = computed(() => {
  return props.as === "nuxt-link" || props.as === "nuxt-link-locale"
    ? props.prefetch
    : undefined;
});

const nuxtLinkExternal = computed(() => {
  return props.as === "nuxt-link" || props.as === "nuxt-link-locale"
    ? props.external
    : undefined;
});

const ariaDisabled = computed(() => {
  return props.disabled ? "true" : undefined;
});

const linkTabindex = computed(() => {
  // Only set tabindex for link elements when disabled
  if (
    props.disabled &&
    (props.as === "a" ||
      props.as === "nuxt-link" ||
      props.as === "nuxt-link-locale")
  ) {
    return "-1";
  }
  return undefined;
});

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    event.stopPropagation();
  }
};
</script>

<style scoped>
/* Base */
.button {
  --button-control-height: 40px;
  --button-color-bg: var(--button-primary-color-bg, var(--color-black));
  --button-color-bg-hover: var(
    --button-primary-color-bg-hover,
    var(--color-gray-900)
  );
  --button-color-text: var(--button-primary-color-text, var(--color-gray-50));
  --button-color-border: var(--button-primary-color-border, transparent);
  --button-color-border-hover: var(
    --button-primary-color-border-hover,
    transparent
  );
  --button-font-size: var(--font-sm);

  height: var(--button-control-height);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-200);

  padding: 0 calc(var(--button-control-height) / 2);
  border-radius: 999px;
  border: 2px solid var(--button-color-border);

  font-size: var(--button-font-size);
  font-weight: var(--font-bold);
  text-decoration: none;
  line-height: 1;
  white-space: nowrap;

  background: var(--button-color-bg);
  color: var(--button-color-text);

  transition: all 0.15s linear;

  cursor: pointer;
  user-select: none;
}

.button:not([disabled]):not([aria-disabled="true"]):hover {
  background: var(--button-color-bg-hover);
  border-color: var(--button-color-border-hover);
}

/* Toggle */
.button--isToggle {
  border-radius: var(--border-radius-200);
}
.button--isToggle.button--tertiary {
  pointer-events: none;
  cursor: default;
}

/* Sizes */
.button--xs {
  --button-control-height: var(--control-height-xs);
}

.button--sm {
  --button-control-height: var(--control-height-sm);
}

.button--lg {
  --button-control-height: var(--control-height-lg);
}

/* Icon layout */
.button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  width: 1.5em;
  height: 1.5em;
}

.button__label {
  display: inline-flex;
  align-items: center;
}

/* Icon-only */
.button--iconOnly {
  width: var(--button-control-height);
  padding: 0;
}

/* Variants */
.button--secondary {
  --button-color-bg: var(--button-secondary-color-bg, var(--color-gray-200));
  --button-color-bg-hover: var(
    --button-secondary-color-bg-hover,
    var(--color-gray-300)
  );
  --button-color-text: var(--button-secondary-color-text, var(--color-black));
}

.button--tertiary {
  --button-color-bg: transparent;
  --button-color-bg-hover: transparent;
  --button-color-text: var(--button-tertiary-color-text, var(--color-black));
  --button-color-border: var(
    --button-tertiary-color-border,
    var(--color-gray-800)
  );
  --button-color-border-hover: var(
    --button-tertiary-color-border-hover,
    var(--color-black)
  );
}

.button--quaternary {
  --button-color-bg: transparent;
  --button-color-bg-hover: var(
    --button-quaternary-color-bg-hover,
    var(--color-gray-200)
  );
  --button-color-text: var(--button-quaternary-color-text, var(--color-black));
  --button-color-border: transparent;
  font-weight: var(--font-regular);
}

.button--link,
.button--text {
  --button-color-bg: transparent;
  --button-color-bg-hover: transparent;
  --button-color-text: var(--color-text);
  padding: 0;
  height: auto;
  font-weight: var(--font-regular);
}

.button--sm :is(.button__label, .button__icon) {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.button--xs :is(.button__label, .button__icon) {
  font-size: var(--font-xs);
  line-height: var(--line-xs);
}

.button--link {
  text-decoration: underline;
}

.button--fullWidth {
  width: 100%;
}

.button--wide {
  padding-left: var(--button-control-height);
  padding-right: var(--button-control-height);
}

/* Disabled state */
.button:disabled,
.button[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  pointer-events: none;
}

/* Active state for click animation */
.button:active:not([disabled]):not([aria-disabled="true"]) {
  transform: scale(0.95);
}

/* Focus styles for accessibility (keyboard navigation only) */
.button:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
}
</style>
