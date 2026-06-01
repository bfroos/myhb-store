import { mapDoctorPageBlocks } from "~/lib/strapi/mapper/mapDoctorPageBlocks";
import type { LocalizationDto } from "~/lib/strapi/dto/types";

export function useDoctorPage(brandName: string = "") {
  const { locale, fallbackLocale, t } = useI18n();
  const page = ref<any | null>(null);
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const localizations = ref<LocalizationDto[]>([]);
  const { brandName: globalBrandName } = useBrand();

  const breadcrumbItems = computed(() => [
    {
      title: t("doctors.breadcrumbTitle"),
      to: "/aerzte",
    },
    {
      title: fixedBlocks.value?.hero?.headline,
    },
  ]);

  async function fetchPage(): Promise<boolean> {
    const route = useRoute();
    const slug = route.params.slug as string;

    const { data, error } = await useStrapiFetch<any>(
      `/employees/by-slug/${slug}`,
      {
        query: {
          locale: currentLocale,
        },
        fetchOptions: {
          key: `doctor-page:${currentLocale}:${slug}`,
        },
      },
    );

    if (error.value) {
      throw handleFetchError(error.value, t);
    }

    if (!data.value?.data || data.value.data.hideFromPublic) {
      throw handleNotFound(t);
    }

    page.value = data.value.data;
    localizations.value = data.value.data.localizations;

    return true;
  }

  const fixedBlocks = computed(() => mapDoctorPageBlocks(page.value));

  const seo = computed(() => {
    const doctorName = fixedBlocks.value?.hero?.headline ?? "";
    const role = fixedBlocks.value?.hero?.intro ?? "Arzt";
    const cities = [
      ...new Set(
        page.value?.locations
          ?.map((location: any) => location.city?.name)
          ?.filter(Boolean) ?? [],
      ),
    ].join(", ");
    
    // Get specialties from treatment specialties
    const specialties = (
      page.value?.treatmentSpecialties?.slice(0, 3) ?? []
    )
      .map((t: any) => t.name)
      .join(", ") || "Ästhetische Medizin";
    
    return {
      metaTitle: t("doctors.doctor.seo.title", {
        doctorName,
        role,
        brandName: globalBrandName.value,
      }),
      metaDescription: t("doctors.doctor.seo.description", {
        doctorName,
        role,
        brandName: globalBrandName.value,
        specialties,
        cities: cities || "Deutschland",
      }),
    };
  });

  return {
    fetchPage,
    fixedBlocks,
    seo,
    breadcrumbItems,
    localizations,
  };
}
