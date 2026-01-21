import type { LocationType } from "~/lib/strapi/dto/enums";

export async function useLocationCounts() {
  const { locale, fallbackLocale } = useI18n();
  const activeLocale = (locale.value || fallbackLocale.value) as string;

  // Performance: Wir brauchen nur die Anzahl. Strapi liefert diese über meta.pagination.total,
  // daher pageSize=1 (minimaler Payload).
  // Wichtig (Nuxt): keine weiteren `use*`-Composables nach einem `await` aufrufen.
  // Daher beide Requests parallel initialisieren und gemeinsam awaiten.
  const [loungeRes, clinicRes] = await Promise.all([
    useStrapiFetch<any>("/api/locations", {
      query: {
        locale: activeLocale,
        fields: ["type"],
        filters: {
          type: {
            $eq: "lounge" as LocationType,
          },
        },
        pagination: {
          page: 1,
          pageSize: 1,
        },
      },
      fetchOptions: {
        key: `locationCounts:lounge:${activeLocale}`,
        dedupe: "defer",
      },
    }),
    useStrapiFetch<any>("/api/locations", {
      query: {
        locale: activeLocale,
        fields: ["type"],
        filters: {
          type: {
            $eq: "clinic" as LocationType,
          },
        },
        pagination: {
          page: 1,
          pageSize: 1,
        },
      },
      fetchOptions: {
        key: `locationCounts:clinic:${activeLocale}`,
        dedupe: "defer",
      },
    }),
  ]);

  const loungeData = loungeRes.data;
  const clinicData = clinicRes.data;

  const loungeCount =
    loungeData.value?.meta?.pagination?.total ??
    (Array.isArray(loungeData.value?.data)
      ? loungeData.value.data.filter((x: any) => x?.type === "lounge").length
      : 0);

  const clinicCount =
    clinicData.value?.meta?.pagination?.total ??
    (Array.isArray(clinicData.value?.data)
      ? clinicData.value.data.filter((x: any) => x?.type === "clinic").length
      : 0);

  return {
    loungeCount,
    clinicCount,
  };
}
