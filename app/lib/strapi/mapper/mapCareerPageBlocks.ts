import type { JobDto } from "../dto/collections";

export function mapCareerPageBlocks(careerPage: any, jobs: JobDto[]) {
  const { t } = useI18n();

  const fixedBlocks = {
    jobTeasers: buildJobTeasersBlockModel(),
  };

  function buildJobTeasersBlockModel() {
    if (!jobs || jobs.length === 0) {
      return null;
    }

    return {
      headline:
        careerPage?.jobTeasers?.headline ?? t("blocks.jobTeasers.headline"),
      showFilters: false,
      jobs: jobs,
      cardSettings: careerPage?.jobTeasers?.cardSettings,
    };
  }

  return fixedBlocks;
}
