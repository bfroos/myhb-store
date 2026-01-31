export async function useCounts() {
  const { data } = await useStrapiFetch<{
    data: {
      loungeCount: number;
      clinicCount: number;
      doctorCount: number;
    };
  }>("/locations/counts", {
    fetchOptions: {
      key: `counts:de`,
    },
  });

  const value = data.value?.data;

  return {
    loungeCount: value?.loungeCount ?? 0,
    clinicCount: value?.clinicCount ?? 0,
    doctorCount: value?.doctorCount ?? 0,
  };
}
