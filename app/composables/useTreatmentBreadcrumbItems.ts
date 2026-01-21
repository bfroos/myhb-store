import type { BreadcrumbItem } from "~/lib/ui/types";

type ServicePageCrumbDto = {
  headline?: string;
};
type ServicePageCrumbResponseDto = {
  data?: ServicePageCrumbDto | null;
};

function humanizeSlug(slug: string): string {
  const s = (slug ?? "").replace(/-/g, " ").trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function useTreatmentBreadcrumbItems(
  slugSegments: string[]
): Promise<BreadcrumbItem[]> {
  const config = useRuntimeConfig();
  const { locale, fallbackLocale, t } = useI18n();

  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const basePath = currentLocale === "en" ? "/treatments" : "/behandlungen";

  const segments = (slugSegments ?? []).filter(Boolean);
  if (segments.length === 0) return [];

  const items: BreadcrumbItem[] = [
    {
      title: t("treatments.treatment.allTreatments"),
      to: basePath,
    },
  ];

  const prefixKeys = segments.map((_, idx) =>
    segments.slice(0, idx + 1).join("/")
  );

  for (let i = 0; i < prefixKeys.length; i++) {
    const prefixKey = prefixKeys[i];
    const isLast = i === prefixKeys.length - 1;
    const segment = segments[i] ?? "";
    const fallbackTitle = humanizeSlug(segment);

    let title = fallbackTitle;
    try {
      const res = await $fetch<ServicePageCrumbResponseDto>(
        `${config.public.strapiUrl}/api/treatment-pages/by-path/${prefixKey}`,
        {
          query: {
            locale: currentLocale,
            fields: ["headline"],
          },
        }
      );
      title = res?.data?.headline || fallbackTitle;
    } catch {
      // fallback: slug humanized
      title = fallbackTitle;
    }

    items.push({
      title,
      to: isLast ? undefined : `${basePath}/${prefixKey}`,
    });
  }

  return items;
}
