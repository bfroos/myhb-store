<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="jobTeasers">
        <div class="jobTeasers__header">
          <h2>{{ headline }}</h2>
          <Select
            v-if="availableCities.length > 0"
            v-model="selectedCity"
            :options="cityOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('blocks.jobTeasers.filter.placeholder')"
            size="small"
            class="jobTeasers__filter-select"
            :aria-label="t('blocks.jobTeasers.filter.label')"
          />
        </div>
        <ul class="jobTeasers__list">
          <li v-for="job in filteredJobs" :key="job.id">
            <NuxtLinkLocale
              :to="`/karriere/jobs/${job.slug}`"
              class="jobTeasers__link"
            >
              <div class="jobTeasers__link__inner">
                <div>
                  <b> {{ job.title }} ({{ job.genderHint }}) </b>
                  <dl>
                    <div v-if="job.employmentType">
                      <dt><IconClockHour3 size="1.5em" stroke="1.5" /></dt>
                      <dd>
                        {{
                          $t(`career.job.employmentType.${job.employmentType}`)
                        }}
                      </dd>
                    </div>
                    <div
                      v-if="
                        job.hourlyRateMinInEuroCent ||
                        job.hourlyRateMaxInEuroCent
                      "
                    >
                      <dt><IconCoinEuro size="1.5em" stroke="1.5" /></dt>
                      <dd>
                        {{
                          formatPriceInEuroRange(
                            job.hourlyRateMinInEuroCent,
                            job.hourlyRateMaxInEuroCent,
                          )
                        }}
                      </dd>
                    </div>
                    <div v-if="job.locations && job.locations.length > 0">
                      <dt><IconMapPin size="1.5em" stroke="1.5" /></dt>
                      <dd>
                        {{ formatLocations(job.locations) }}
                      </dd>
                    </div>
                  </dl>
                </div>
                <IconCircleArrowRight size="40" stroke="1" />
              </div>
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
import { computed, ref } from "vue";
import Select from "primevue/select";
import type { BlockJobTeasersDto } from "~/lib/strapi/dto/components";
import type { LocationDto, JobDto } from "~/lib/strapi/dto/collections";

const props = defineProps<BlockJobTeasersDto>();
const { t } = useI18n();

const selectedCity = ref<string | null>(null);

// Extract all unique cities from all jobs
const availableCities = computed(() => {
  if (!props.jobs) return [];

  const cities = new Set<string>();
  props.jobs.forEach((job) => {
    if (job.locations) {
      job.locations.forEach((location) => {
        if (location.city?.name) {
          cities.add(location.city.name);
        }
      });
    }
  });

  return Array.from(cities).sort();
});

// Create options for Select component
const cityOptions = computed(() => {
  const options: Array<{ label: string; value: string | null }> = [
    { label: t("blocks.jobTeasers.filter.all"), value: null },
  ];

  availableCities.value.forEach((city) => {
    options.push({
      label: city,
      value: city,
    });
  });

  return options;
});

// Filter jobs based on selected city
const filteredJobs = computed(() => {
  if (!props.jobs) return [];

  if (!selectedCity.value) {
    return props.jobs;
  }

  return props.jobs.filter((job: JobDto) => {
    if (!job.locations) return false;
    return job.locations.some(
      (location) => location.city?.name === selectedCity.value,
    );
  });
});

function formatLocations(locations: LocationDto[]): string {
  const cityNames = locations.map((location) => location.city.name);
  const uniqueCities = [...new Set(cityNames)];
  const maxDisplay = 3;

  if (uniqueCities.length <= maxDisplay) {
    return uniqueCities.join(", ");
  }

  const displayed = uniqueCities.slice(0, maxDisplay);
  const remaining = uniqueCities.length - maxDisplay;
  return `${displayed.join(", ")} + ${remaining} ${t(
    "blocks.jobTeasers.andMore",
  )}`;
}
</script>
<style scoped>
.jobTeasers {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}

.jobTeasers__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-600);
  padding: var(--space-card-pad);
}

.jobTeasers__filter-select {
  min-width: 200px;
}

.jobTeasers__list > li {
  border-top: 1px solid var(--color-border-mute);
}

.jobTeasers__link {
  display: block;
  padding: var(--space-200);
  text-decoration: none;
}

.jobTeasers__link__inner {
  display: grid;
  grid-template-columns: 1fr max-content;
  align-items: center;
  text-decoration: none;
  padding: calc(var(--space-card-pad) - var(--space-200));
}

.jobTeasers__link__inner b {
  display: block;
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  margin: 0 0 var(--space-400);
}

.jobTeasers__link__inner dl {
  display: flex;
  flex-direction: column;
  row-gap: var(--space-300);
  column-gap: var(--space-600);
  color: var(--color-text-light);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.jobTeasers__link__inner dl > div {
  display: flex;
  gap: var(--space-200);
}

.jobTeasers__link__inner dl dt {
  display: flex;
  align-items: center;
  gap: var(--space-200);
}

.jobTeasers__link__inner :deep(svg) {
  color: var(--color-text-muted);
  transition: background 0.2s ease;
}

.jobTeasers__link:hover .jobTeasers__link__inner :deep(svg) {
  color: var(--color-text);
}

.jobTeasers__list > li:first-child .jobTeasers__link__inner {
  border-top-right-radius: calc(var(--border-radius-card) - var(--space-200));
}

.jobTeasers__list > li:last-child .jobTeasers__link__inner {
  border-bottom-right-radius: calc(
    var(--border-radius-card) - var(--space-200)
  );
}

@media screen and (min-width: 900px) {
  .jobTeasers {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }

  .jobTeasers__list {
    border-left: 1px solid var(--color-border-mute);
  }

  .jobTeasers__list > li:first-child {
    border-top: none;
  }

  .jobTeasers__link__inner dl {
    flex-direction: row;
  }
}
</style>
