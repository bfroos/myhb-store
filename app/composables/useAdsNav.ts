import { isAdsSurgeryPathKey } from "#shared/adsLocationTreatments";

export type AdsNavItem = {
  id: number;
  name: string;
  slug: string;
  pathKey?: string;
  href: string;
  children: AdsNavItem[];
};

/**
 * go.* (Ads-Modus): Behandlungsmenue fuer Kopf-, Mobil- und Fusszeile, nur
 * mit go.-internen Zielen (Inhaber, 30.09.2026: "Beides zurueck, nur
 * go.-intern"; #184 hatte das Menue ganz entfernt).
 *
 * - Seite mit Standortkontext (Standort- und Standort-Behandlungsseiten):
 *   Kategorien und Behandlungen DIESES Standorts, nur was es dort im
 *   Ads-Baum gibt (/api/ads-location-nav).
 * - Sonst: die Kategorie-Seiten des Ads-Baums (/behandlungen/<kategorie>)
 *   plus Uebersichten (Standorte, Preise).
 *
 * Der Menue-Endpunkt liefert im Ads-Modus den Ads-Baum (x-site-mode), die
 * Kategorie heisst dort "Muskelrelaxans". Schoenheits-OPs fallen weg.
 */
export async function useAdsNav() {
  const { t } = useI18n();
  const { isAdsMode } = useSiteModeFlags();
  const { treatmentPages } = useMenu("treatment-pages");
  const route = useRoute();

  // Standortkontext haengt am Pfad (wie useSeitenStandort): nur Standort-
  // und Standort-Behandlungsseiten tragen beide Parameter.
  const locationKey = computed(() => {
    const city = route.params.citySlug;
    const loc = route.params.locationSlug;
    return isAdsMode.value && typeof city === "string" && typeof loc === "string"
      ? `${city}/${loc}`
      : null;
  });

  // Eigene kleine Abfrage statt der Seitendaten: Kopfzeile rendert beim
  // Server-Rendern vor der Seite und muss selbst wissen, was es gibt.
  const { data: locationNav } = await useAsyncData(
    () => `ads-location-nav:${locationKey.value ?? "-"}`,
    async () => {
      if (!locationKey.value) return null;
      try {
        const res = await $fetch<{ pathKeys: string[] }>(
          `/api/ads-location-nav/${locationKey.value}`,
        );
        return { basis: `/standorte/${locationKey.value}`, pathKeys: res.pathKeys ?? [] };
      } catch {
        return null;
      }
    },
    { watch: [locationKey] },
  );

  const standortBehandlungen = computed(() =>
    locationKey.value && locationNav.value?.pathKeys.length
      ? locationNav.value
      : null,
  );

  const categories = computed<AdsNavItem[]>(() => {
    if (!isAdsMode.value) return [];
    const ctx = standortBehandlungen.value;
    const available = ctx ? new Set(ctx.pathKeys) : null;
    const out: AdsNavItem[] = [];
    for (const category of treatmentPages.value) {
      const key = category.pathKey || category.slug;
      if (!key || isAdsSurgeryPathKey(key)) continue;
      if (!ctx || !available) {
        out.push({
          id: category.id,
          name: category.name,
          slug: category.slug,
          pathKey: key,
          href: `/behandlungen/${key}`,
          children: [],
        });
        continue;
      }
      const children = (category.children ?? [])
        .filter((child) => child.pathKey && available.has(child.pathKey))
        .map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          pathKey: child.pathKey,
          href: `${ctx.basis}/${child.pathKey}`,
          children: [],
        }));
      if (!available.has(key) && children.length === 0) continue;
      out.push({
        id: category.id,
        name: category.name,
        slug: category.slug,
        pathKey: key,
        href: `${ctx.basis}/${key}`,
        children,
      });
    }
    return out;
  });

  /**
   * Uebersichtsseiten, die es auf go. gibt. /preise bewusst nicht: Die Seite
   * zeigt dort noch "BTX" und verlinkt /produkte/botox/… (Stand 30.09.2026).
   */
  const overviewLinks = computed(() =>
    isAdsMode.value
      ? [{ name: t("navigation.secondary.locations"), slug: "standorte" }]
      : [],
  );

  return { categories, overviewLinks };
}
