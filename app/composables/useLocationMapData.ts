import type { LocationForMapInput } from "~/utils/locationMapProjection";

export async function useLocationMapData() {
  const { formatInteger, localeIso } = useFormatInteger();

  const [globals, counts, locationsForMap] = await Promise.all([
    useGlobals(),
    useCounts(),
    useLocationsForMap(),
  ]);

  const customersCount =
    Number(globals.value?.marketing?.customersCount ?? 0) || 0;
  const loungeCount = Number(counts.loungeCount ?? 0) || 0;
  const clinicCount = Number(counts.clinicCount ?? 0) || 0;
  const doctorCount = Number(counts.doctorCount ?? 0) || 0;

  const customersCountLabel = computed(() => {
    void localeIso.value;
    return formatInteger(customersCount);
  });
  const loungeCountLabel = computed(() => {
    void localeIso.value;
    return formatInteger(loungeCount);
  });
  const clinicCountLabel = computed(() => {
    void localeIso.value;
    return formatInteger(clinicCount);
  });
  const doctorCountLabel = computed(() => {
    void localeIso.value;
    return formatInteger(doctorCount);
  });

  const customersLabelKey = computed(() =>
    pluralKey("blocks.locationMap.footer.customers", 2),
  );
  const loungesLabelKey = computed(() =>
    pluralKey("blocks.locationMap.footer.lounges", loungeCount),
  );
  const doctorsLabelKey = computed(() =>
    pluralKey("blocks.locationMap.footer.doctors", doctorCount),
  );
  const clinicLabelKey = computed(() =>
    pluralKey("blocks.locationMap.footer.clinic", clinicCount),
  );

  const locations = computed<LocationForMapInput[]>(
    () => locationsForMap.locations.value ?? [],
  );

  return {
    customersCount,
    loungeCount,
    clinicCount,
    doctorCount,
    customersCountLabel,
    loungeCountLabel,
    clinicCountLabel,
    doctorCountLabel,
    customersLabelKey,
    loungesLabelKey,
    doctorsLabelKey,
    clinicLabelKey,
    locations,
  };
}
