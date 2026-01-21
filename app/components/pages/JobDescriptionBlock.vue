<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface>
      <article class="jobDescription">
        <header class="jobDescription__header">
          <h2>{{ $t("career.job.description.headline") }}</h2>
        </header>
        <div class="jobDescription__content">
          <div class="jobDescription__body">
            <UiLayoutRichText :blocks="content" />
          </div>
          <aside class="jobDescription__aside">
            <div class="jobDescription__aside__inner">
              <h2>{{ $t("career.job.description.details") }}</h2>
              <dl>
                <template v-if="employmentType">
                  <dt>{{ $t("career.job.description.employmentType") }}</dt>
                  <dd>
                    <span>
                      {{ $t(`career.job.employmentType.${employmentType}`) }}
                    </span>
                  </dd>
                </template>
                <template v-if="contractType">
                  <dt>{{ $t("career.job.description.contractType") }}</dt>
                  <dd>
                    <span>
                      {{ $t(`career.job.contractType.${contractType}`) }}
                    </span>
                  </dd>
                </template>
                <template v-if="startDate">
                  <dt>{{ $t("career.job.description.startDate") }}</dt>
                  <dd>
                    <span>
                      {{ startDate }}
                    </span>
                  </dd>
                </template>
                <template v-if="hourlyRate">
                  <dt>{{ $t("career.job.description.hourlyRate") }}</dt>
                  <dd>
                    <span>
                      {{ hourlyRate }}
                    </span>
                  </dd>
                </template>
                <template v-if="locations && locations.length > 0">
                  <dt>{{ $t("career.job.description.locations") }}</dt>
                  <dd>
                    <ul>
                      <li v-for="location in locations" :key="location">
                        {{ location }}
                      </li>
                    </ul>
                  </dd>
                </template>
              </dl>
              <UiAtomBaseButton
                v-if="applyTarget === JobApplyTarget.URL"
                size="lg"
                fullWidth
                :href="url"
              >
                {{ $t("career.job.apply") }}
              </UiAtomBaseButton>
              <UiAtomBaseButton
                v-if="applyTarget === JobApplyTarget.EMAIL"
                size="lg"
                as="a"
                fullWidth
                :href="`mailto:${email}`"
              >
                {{ $t("career.job.apply") }}
              </UiAtomBaseButton>
              <div v-if="recruiter" class="jobDescription__aside__recruiter">
                <UiAtomMediaPicture
                  v-if="recruiter.photo"
                  :media="recruiter.photo"
                  :default-format="ImageFormat.THUMBNAIL"
                />
                <div>
                  <b>{{ recruiter.firstName }} {{ recruiter.lastName }}</b>
                  <p v-if="applyTarget === JobApplyTarget.EMAIL">
                    <a :href="`mailto:${email}`">{{ email }}</a>
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import {
  JobContractType,
  JobEmploymentType,
  ImageFormat,
} from "~/lib/strapi/dto/enums";
import { JobApplyTarget } from "~/lib/strapi/dto/enums";
import type { StrapiRichText } from "~/lib/strapi/dto/types";
import type { EmployeeDto } from "~/lib/strapi/dto/collections";

const props = defineProps<{
  startDate?: string;
  applyTarget: JobApplyTarget;
  hourlyRate?: string;
  locations?: string[];
  employmentType?: JobEmploymentType;
  contractType?: JobContractType;
  content?: StrapiRichText;
  url?: string;
  email?: string;
  recruiter?: EmployeeDto;
}>();
</script>
<style scoped>
.jobDescription {
  position: relative;
}

.jobDescription__header {
  padding: var(--space-card-pad);
  border-bottom: 1px solid var(--color-border-mute);
}

.jobDescription__body {
  flex: 3;
  padding: var(--space-card-pad);
}

.jobDescription__aside {
  flex: 0 0 400px;
  max-width: 100%;
}

.jobDescription__aside__inner {
  padding: var(--space-card-pad);
}

.jobDescription__aside dl {
  margin: 0 0 var(--space-card-pad);
}

.jobDescription__aside dt {
  font-weight: var(--font-bold);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

.jobDescription__aside dd {
  margin: 0 0 var(--space-400);
}

.jobDescription__aside h2 {
  font-weight: var(--font-bold);
  font-size: var(--font-xl);
  line-height: var(--line-xl);
  margin: 0 0 var(--space-400);
}

.jobDescription__aside__recruiter {
  display: flex;
  align-items: center;
  gap: var(--space-400);
  margin: var(--space-card-pad-xs) 0 0 0;
}

.jobDescription__aside__recruiter :deep(img) {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.jobDescription__aside__recruiter p {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

@media (min-width: 900px) {
  .jobDescription__content {
    display: grid;
    grid-template-columns: 1fr 400px;
  }
  .jobDescription__body {
    border-right: 1px solid var(--color-border-mute);
  }
  .jobDescription__aside__inner {
    position: sticky;
    top: 0;
  }
}
</style>
