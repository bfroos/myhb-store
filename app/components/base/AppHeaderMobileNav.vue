<template>
  <div class="mobileMenu__backdrop">
    <div class="mobileMenu__drawer">
      <div class="mobileMenu__header">
        <UiAtomBaseButton @click="closeMobileMenu" variant="tertiary">
          <IconX :size="24" />
        </UiAtomBaseButton>
        <SharedButton
          :button="{
            label: $t('cta.bookAppointment'),
            method: SharedButtonMethod.ACTION,
            action: SharedButtonAction.APPOINTMENT_BOOKING,
          }"
        />
      </div>
      <div class="mobileMenu__content">
        <nav class="mobileMenu__mainNav">
          <ul class="mobileMenu__mainNav__parentList">
            <li v-for="item in props.items.mainNavItems" :key="item.slug">
              <button
                v-if="item.children.length > 0"
                type="button"
                class="mobileMenu__link mobileMenu__link--parent"
                :class="{
                  'mobileMenu__link--active': openSubnavSlug === item.slug,
                }"
                @click="toggleSubnav(item.slug)"
              >
                <span>{{ item.name }}</span>
                <IconChevronDown
                  v-if="openSubnavSlug !== item.slug"
                  :size="24"
                />
                <IconChevronUp v-else :size="24" />
              </button>
              <NuxtLinkLocale
                v-else
                :to="`/behandlungen/${item.slug}`"
                class="mobileMenu__link mobileMenu__link--parent"
                @click="closeMobileMenu"
              >
                {{ item.name }}
              </NuxtLinkLocale>
              <ul
                v-if="item.children.length > 0"
                class="mobileMenu__mainNav__childrenList"
                :class="{
                  'mobileMenu__mainNav__childrenList--open':
                    openSubnavSlug === item.slug,
                }"
              >
                <li>
                  <NuxtLinkLocale
                    :to="`/behandlungen/${item.slug}`"
                    class="mobileMenu__link"
                    @click="closeMobileMenu"
                  >
                    {{ item.name }} {{ $t("common.general") }}
                  </NuxtLinkLocale>
                </li>
                <li v-for="child in item.children" :key="child.slug">
                  <NuxtLinkLocale
                    :to="`/behandlungen/${item.slug}/${child.slug}`"
                    class="mobileMenu__link"
                    @click="closeMobileMenu"
                  >
                    {{ child.name }}
                  </NuxtLinkLocale>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
        <nav class="mobileMenu__secondaryNav">
          <ul>
            <li v-for="item in props.items.secondaryNavItems" :key="item.slug">
              <NuxtLinkLocale
                :to="`/${item.slug}`"
                class="mobileMenu__link"
                @click="closeMobileMenu"
              >
                {{ item.name }}
              </NuxtLinkLocale>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconChevronDown, IconChevronUp, IconX } from "@tabler/icons-vue";
import { SharedButtonMethod, SharedButtonAction } from "~/lib/strapi/dto/enums";

const emit = defineEmits<{
  (e: "closeMobileMenu"): void;
}>();

const props = defineProps<{
  items: {
    secondaryNavItems: { name: string; slug: string }[];
    mainNavItems: {
      name: string;
      slug: string;
      children: { name: string; slug: string }[];
    }[];
  };
}>();

function closeMobileMenu() {
  emit("closeMobileMenu");
  document.body.style.overflow = "";
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closeMobileMenu();
}

const openSubnavSlug = ref<string | null>(null);

function toggleSubnav(slug: string) {
  openSubnavSlug.value = openSubnavSlug.value === slug ? null : slug;
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.mobileMenu__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--color-card-bg-light);
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.mobileMenu__drawer {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: var(--space-400) var(--container-pad) var(--space-600);
}

.mobileMenu__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-400);
  padding: var(--space-400) var(--space-card-pad-sm);
  background: var(--color-gray-100);
  border-radius: var(--border-radius-card);
}

.mobileMenu__brand {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.mobileMenu__brand > svg {
  height: 32px;
  max-height: 32px;
  width: auto;
  display: block;
}

.mobileMenu__content {
  padding: var(--space-600) 0;
}

.mobileMenu__content a {
  text-decoration: none;
}

.mobileMenu__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-radius: var(--border-radius-200);
  height: 40px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.mobileMenu__link--active,
.mobileMenu__link:hover {
  background: var(--color-gray-100);
}

.mobileMenu__link--parent {
  font-weight: var(--font-bold);
}

.mobileMenu__mainNav__parentList,
.mobileMenu__secondaryNav__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-100);
}

.mobileMenu__mainNav__childrenList {
  display: none;
  margin-top: var(--space-100);
}

.mobileMenu__mainNav__childrenList a {
  padding-left: var(--space-600);
}

.mobileMenu__mainNav__childrenList--open {
  display: block;
}

.mobileMenu__secondaryNav {
  margin-top: var(--space-600);
  padding-top: var(--space-600);
  border-top: 1px solid var(--color-border-mute);
}

@media screen and (min-width: 900px) {
  .mobileMenu__backdrop {
    display: none;
  }
}
</style>
