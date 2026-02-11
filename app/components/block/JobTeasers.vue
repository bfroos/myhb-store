<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="jobs">
        <header class="jobs__header">
          <h2 v-if="headline" class="jobs__heading">{{ headline }}</h2>
          <Select
            v-if="showFilter"
            v-model="selectedCity"
            :options="cityOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('blocks.jobTeasers.filter.placeholder')"
            class="jobs__filter"
            :aria-label="t('blocks.jobTeasers.filter.label')"
          />
        </header>
        <ul v-if="hasJobs" class="jobs__list" role="list">
          <li v-for="job in filteredJobs" :key="job.id" class="jobs__item">
            <NuxtLinkLocale
              :to="`/karriere/jobs/${job.slug}`"
              class="jobs__link"
            >
              <div class="jobs__body">
                <strong class="jobs__title">
                  {{ getJobTitle(job) }}
                </strong>
                <dl v-if="getJobMetaItems(job).length > 0" class="jobs__meta">
                  <div
                    v-for="(item, idx) in getJobMetaItems(job)"
                    :key="idx"
                    class="jobs__meta-item"
                  >
                    <dt class="jobs__meta-term">
                      <component
                        :is="item.icon"
                        size="1.5em"
                        stroke="1.5"
                        aria-hidden="true"
                      />
                    </dt>
                    <dd class="jobs__meta-desc">{{ item.label }}</dd>
                  </div>
                </dl>
              </div>
              <IconCircleArrowRight
                size="40"
                stroke="1"
                class="jobs__arrow"
                aria-hidden="true"
              />
            </NuxtLinkLocale>
          </li>
        </ul>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import {
  IconCircleArrowRight,
  IconClockHour3,
  IconCoinEuro,
  IconMapPin,
} from "@tabler/icons-vue";
import Select from "primevue/select";
import { formatPriceInEuroRange } from "~/utils/formatPriceInEuro";
import type { BlockJobTeasersDto } from "~/lib/strapi/dto/components";
import type { LocationDto, JobDto } from "~/lib/strapi/dto/collections";
import type { JobEmploymentType } from "~/lib/strapi/dto/enums";

const props = defineProps<BlockJobTeasersDto>();
const { t } = useI18n();

const selectedCity = ref<string | null>(null);

const hasContent = computed(
  () => !!props.headline || (props.jobs?.length ?? 0) > 0,
);

const hasJobs = computed(() => (props.jobs?.length ?? 0) > 0);

const availableCities = computed(() => {
  if (!props.jobs) return [];
  const cities = new Set<string>();
  props.jobs.forEach((job) => {
    job.locations?.forEach((loc) => {
      if (loc.city?.name) cities.add(loc.city.name);
    });
  });
  return Array.from(cities).sort();
});

const showFilter = computed(
  () => (props.jobs?.length ?? 0) > 1 && availableCities.value.length > 0,
);

const cityOptions = computed(() => {
  const options: Array<{ label: string; value: string | null }> = [
    { label: t("blocks.jobTeasers.filter.all"), value: null },
  ];
  availableCities.value.forEach((city) => {
    options.push({ label: city, value: city });
  });
  return options;
});

const filteredJobs = computed(() => {
  if (!props.jobs) return [];
  if (!selectedCity.value) return props.jobs;
  return props.jobs.filter((job) =>
    job.locations?.some((loc) => loc.city?.name === selectedCity.value),
  );
});

function getJobTitle(job: JobDto): string {
  const suffix = job.genderHint ? ` (${job.genderHint})` : "";
  return `${job.title}${suffix}`;
}

type MetaItem = { icon: typeof IconClockHour3; label: string };

function getJobMetaItems(job: JobDto): MetaItem[] {
  const items: MetaItem[] = [];

  if ((job.employmentTypes?.length ?? 0) > 0) {
    items.push({
      icon: IconClockHour3,
      label: formatEmploymentTypes(job.employmentTypes ?? []),
    });
  }

  if (job.hourlyRateMinInEuroCent ?? job.hourlyRateMaxInEuroCent) {
    items.push({
      icon: IconCoinEuro,
      label: formatPriceInEuroRange(
        job.hourlyRateMinInEuroCent,
        job.hourlyRateMaxInEuroCent,
      ),
    });
  }

  if ((job.locations?.length ?? 0) > 0) {
    items.push({
      icon: IconMapPin,
      label: formatLocations(job.locations ?? []),
    });
  }

  return items;
}

function formatEmploymentTypes(types: JobEmploymentType[]): string {
  return types.map((type) => t(`career.job.employmentType.${type}`)).join(", ");
}

function formatLocations(locations: LocationDto[]): string {
  const cityNames = locations
    .map((loc) => loc.city?.name)
    .filter((name): name is string => Boolean(name));
  const unique = [...new Set(cityNames)];
  const max = 3;

  if (unique.length <= max) return unique.join(", ");
  const displayed = unique.slice(0, max);
  const remaining = unique.length - max;
  return `${displayed.join(", ")} + ${remaining} ${t(
    "blocks.jobTeasers.andMore",
  )}`;
}
</script>

<style scoped>
.jobs {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.jobs__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-600);
  padding: var(--space-card-pad);
}

.jobs__heading {
  margin: 0;
  font-size: var(--font-4xl);
  line-height: var(--line-4xl);
}

.jobs__filter {
  min-width: 200px;
}

.jobs__list {
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid var(--color-border-mute);
}

.jobs__item {
  border-top: 1px solid var(--color-border-mute);
}

.jobs__item:first-child {
  border-top: none;
}

.jobs__link {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: var(--space-400);
  padding: var(--space-card-pad);
  text-decoration: none;
  color: inherit;
}

.jobs__link:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
}

.jobs__body {
  min-width: 0;
}

.jobs__title {
  display: block;
  font-size: var(--font-xl);
  line-height: var(--line-xl);
  font-weight: 600;
  margin: 0 0 var(--space-400);
}

.jobs__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  margin: 0;
  color: var(--color-text-light);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.jobs__meta-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-200);
  margin: 0;
}

.jobs__meta-term {
  flex-shrink: 0;
  margin: 0;
}

.jobs__meta-desc {
  margin: 0;
}

.jobs__meta-term :deep(svg) {
  color: var(--color-text-light);
}

.jobs__arrow {
  flex-shrink: 0;
  color: var(--color-text-light);
  transition: color 0.2s ease;
}

.jobs__link:hover .jobs__arrow {
  color: var(--color-text);
}

@media (min-width: 900px) {
  .jobs {
    flex-direction: row;
  }

  .jobs__header {
    flex: 1 1 33%;
    border-right: 1px solid var(--color-border-mute);
    border-radius: var(--border-radius-card) 0 0 var(--border-radius-card);
  }

  .jobs__list {
    flex: 2 1 67%;
    border-top: none;
    border-left: 1px solid var(--color-border-mute);
  }

  .jobs__item {
    border-top: 1px solid var(--color-border-mute);
  }

  .jobs__item:first-child {
    border-top: none;
  }

  .jobs__meta {
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: var(--space-600);
  }
}
</style>
