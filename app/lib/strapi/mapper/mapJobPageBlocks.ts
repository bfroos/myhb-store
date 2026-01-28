import { BlockPageHeaderLayout, ColorTheme } from "../dto/enums";
import type { JobDto } from "../dto/collections";
import type { StrapiRichText } from "../dto/types";
import { formatPriceInEuro } from "~/utils/formatPriceInEuro";

export function mapJobPageBlocks(jobDetails: JobDto) {
  const blocks = {
    jobHero: buildPageHeaderBlock(),
    jobDescription: buildJobDescriptionBlock(),
  };

  function buildPageHeaderBlock() {
    return {
      headline: jobDetails.title,
      intro: jobDetails.genderHint,
      layout: BlockPageHeaderLayout.COMPACT,
      media: jobDetails.cover,
      fixedImageAspectRatio: true,
      cardSettings: {
        colorTheme: ColorTheme.STRONG,
      },
    };
  }

  function buildJobDescriptionBlock() {
    const locations = jobDetails.locations?.map((location) => {
      return `${location.city.name} (${location.name})`;
    });

    const isSaleryRange =
      jobDetails.hourlyRateMinInEuroCent && jobDetails.hourlyRateMaxInEuroCent;

    const hourlyRate = isSaleryRange
      ? formatPriceInEuro(jobDetails.hourlyRateMinInEuroCent ?? 0, {
          showCurrencySymbol: false,
        }) +
        " – " +
        formatPriceInEuro(jobDetails.hourlyRateMaxInEuroCent ?? 0, {
          showCurrencySymbol: true,
        })
      : formatPriceInEuro(jobDetails.hourlyRateMinInEuroCent ?? 0, {
          showCurrencySymbol: true,
        });

    const startDate = jobDetails.startDate
      ? new Date(jobDetails.startDate).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : undefined;

    const employmentTypes =
      jobDetails.employmentTypes ??
      (jobDetails.employmentTypes ? jobDetails.employmentTypes : undefined);

    const contractTypes =
      jobDetails.contractTypes ??
      (jobDetails.contractTypes ? jobDetails.contractTypes : undefined);

    return {
      startDate,
      applyTarget: jobDetails.applyTarget,
      hourlyRate,
      locations,
      recruiter: jobDetails.recruiter,
      employmentTypes,
      contractTypes,
      content: jobDetails.content as StrapiRichText | undefined,
      url: jobDetails.url,
      email: jobDetails.email,
    };
  }

  return blocks;
}
