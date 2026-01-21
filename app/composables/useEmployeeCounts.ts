import { EmployeeType } from "~/lib/strapi/dto/enums";

export async function useEmployeeCounts() {
  const { locale, fallbackLocale } = useI18n();
  const activeLocale = (locale.value || fallbackLocale.value) as string;

  const { data } = await useStrapiFetch<any>("/api/employees", {
    query: {
      locale: activeLocale,
      fields: ["isActive", "employeeType"],
      filters: {
        isActive: {
          $eq: true,
        },
        employeeType: {
          $eq: EmployeeType.DOCTOR,
        },
      },
      pagination: {
        page: 1,
        pageSize: 1,
      },
    },
    fetchOptions: {
      key: `employeeCounts:${EmployeeType.DOCTOR}:${activeLocale}`,
      dedupe: "defer",
    },
  });

  const doctorCount =
    data.value?.meta?.pagination?.total ??
    (Array.isArray(data.value?.data)
      ? data.value.data.filter(
          (x: any) =>
            x?.isActive === true && x?.employeeType === EmployeeType.DOCTOR
        ).length
      : 0);

  return {
    doctorCount,
  };
}
