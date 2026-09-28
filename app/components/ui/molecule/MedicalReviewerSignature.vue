<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.STRONG }">
      <aside class="medReviewer" :aria-label="$t('treatment.medicalReviewer.ariaLabel')">
        <div class="medReviewer__frame">
          <div class="medReviewer__avatar">
            <img
              v-if="reviewer.photoUrl"
              :src="reviewer.photoUrl"
              :alt="reviewer.name"
              class="medReviewer__photo"
              width="112"
              height="112"
              loading="lazy"
            />
            <IconRosetteDiscountCheckFilled class="medReviewer__badge" aria-hidden="true" />
          </div>
          <div class="medReviewer__body">
            <p class="medReviewer__text">
              <span class="medReviewer__label">{{ $t("treatment.medicalReviewer.label") }}</span>{{ " " }}<NuxtLinkLocale
                :to="`/aerzte/${reviewer.slug}`"
                class="medReviewer__name"
              >{{ reviewer.name }}<template v-if="reviewer.jobTitle">, {{ reviewer.jobTitle }}</template></NuxtLinkLocale>
            </p>
            <span v-if="formattedDate" class="medReviewer__rule" aria-hidden="true" />
            <p v-if="formattedDate" class="medReviewer__date">
              {{ $t("treatment.medicalReviewer.lastUpdated", { date: formattedDate }) }}
            </p>
          </div>
          <div class="medReviewer__seal" aria-hidden="true">
            <IconRosetteDiscountCheckFilled class="medReviewer__sealIcon" />
          </div>
        </div>
      </aside>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { IconRosetteDiscountCheckFilled } from "@tabler/icons-vue";
import { ColorTheme } from "~/lib/strapi/dto/enums";
import type { MedicalReviewer } from "~/utils/medicalReviewer";

const props = defineProps<{
  reviewer: MedicalReviewer;
  date?: string | null;
}>();

const { locale, localeProperties } = useI18n();
const dateLocale = computed(
  () => (localeProperties.value?.iso as string | undefined) ?? locale.value,
);

const formattedDate = computed(() => {
  if (!props.date) return "";
  const d = new Date(props.date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(dateLocale.value, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
});
</script>

<style scoped>
.medReviewer {
  padding: var(--space-500);
}
.medReviewer__frame {
  position: relative;
  display: grid;
  grid-template-columns: 112px 1fr 112px;
  align-items: center;
  gap: var(--space-700);
  min-height: 208px;
  box-sizing: border-box;
  padding: var(--space-700) var(--space-800);
  border: 1px solid var(--color-border-mute);
  border-radius: calc(var(--border-radius-card) - var(--space-500) / 2);
}
.medReviewer__frame::before {
  content: "";
  position: absolute;
  inset: 6px;
  border: 1px solid var(--color-border-light);
  border-radius: calc(var(--border-radius-card) - var(--space-500) / 2 - 6px);
  pointer-events: none;
}
.medReviewer__avatar {
  position: relative;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: var(--color-gray-100);
  box-shadow: 0 0 0 4px var(--card-color-bg), 0 0 0 6px var(--color-text-light);
}
.medReviewer__photo {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.medReviewer__badge {
  display: none;
}
.medReviewer__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-400);
  min-width: 0;
  text-align: center;
}
.medReviewer__text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-300);
  margin: 0;
}
.medReviewer__label {
  font-size: var(--font-sm);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-light);
}
.medReviewer__name {
  font-size: var(--font-3xl);
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-text);
  text-decoration: none;
}
.medReviewer__name:hover,
.medReviewer__name:focus-visible {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 6px;
}
.medReviewer__rule {
  position: relative;
  width: min(240px, 60%);
  height: 1px;
  background: var(--color-text-light);
}
.medReviewer__rule::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 7px;
  height: 7px;
  background: var(--color-text);
  transform: translate(-50%, -50%) rotate(45deg);
  box-shadow: 0 0 0 4px var(--card-color-bg);
}
.medReviewer__date {
  margin: 0;
  font-size: var(--font-sm);
  letter-spacing: 0.04em;
  color: var(--color-text-light);
}
.medReviewer__seal {
  display: grid;
  place-items: center;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  border: 2px solid var(--color-text);
  box-shadow: inset 0 0 0 6px var(--card-color-bg), inset 0 0 0 7px var(--color-text-light);
}
.medReviewer__sealIcon {
  width: 56px;
  height: 56px;
  color: var(--color-text);
}

@media screen and (max-width: 768px) {
  .medReviewer {
    padding: var(--space-300);
  }
  .medReviewer__frame {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: var(--space-500);
    min-height: 0;
    padding: var(--space-700) var(--space-500);
    border-radius: calc(var(--border-radius-card) - var(--space-300) / 2);
  }
  .medReviewer__frame::before {
    border-radius: calc(var(--border-radius-card) - var(--space-300) / 2 - 6px);
  }
  .medReviewer__avatar {
    width: 88px;
    height: 88px;
  }
  .medReviewer__badge {
    display: block;
    position: absolute;
    right: -6px;
    bottom: -6px;
    width: 30px;
    height: 30px;
    padding: 1px;
    border-radius: 50%;
    background: var(--card-color-bg);
    color: var(--color-text);
  }
  .medReviewer__label {
    font-size: var(--font-xs);
    letter-spacing: 0.16em;
  }
  .medReviewer__name {
    font-size: var(--font-xl);
  }
  .medReviewer__seal {
    display: none;
  }
}
</style>
