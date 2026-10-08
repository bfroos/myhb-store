// Weiterleitungen nach Muster (shared/adsRedirects.ts, bfroos/myhb-store#199):
// entfernte Aachen-Lippenseite auf beiden Domains, auf go.* ausserdem Blog und
// jede Adresse mit "botox"/"btx" im Pfad.
import {
  adsRedirectTarget,
  legacyPageRedirect,
  locationTreatmentParts,
  needsAdsRedirect,
  normalizeRedirectPath,
} from '#shared/adsRedirects';
import { adsChooserRedirectTarget } from '#shared/adsChooser';
import { adsTreePathKeys, locationPathKeys } from './adsLocationData';

export async function resolvePatternRedirect(
  event: any,
  pathname: string,
  search: string,
): Promise<{ target: string; code: number } | null> {
  const config = useRuntimeConfig(event);
  const isAds = config.public.siteMode === 'ads';
  let target: string | null = null;
  if (!isAds) {
    target = legacyPageRedirect(pathname);
  } else if (needsAdsRedirect(pathname)) {
    const path = normalizeRedirectPath(pathname);
    const loc = path.startsWith('/standorte/') ? locationTreatmentParts(path) : null;
    const [adsPathKeys, locKeys] = await Promise.all([
      path.startsWith('/behandlungen/') ? adsTreePathKeys(event).catch(() => null) : null,
      loc ? locationPathKeys(event, loc[0], loc[1]).catch(() => null) : null,
    ]);
    target = adsRedirectTarget(path, {
      adsPathKeys,
      locationPathKeys: locKeys ? new Set(locKeys) : null,
    });
    // Ziel ist selbst eine alte Uebersicht (/blog -> /behandlungen): gleich
    // auf die Auswahl, ohne zweiten Sprung.
    if (target) target = adsChooserRedirectTarget(normalizeRedirectPath(target)) ?? target;
  } else {
    // Alte Uebersichtsseiten -> Auswahlseiten im neuen Look (08.10.2026).
    // 302: Die Seiten gibt es weiter, nur go. zeigt sie nicht mehr.
    const chooser = adsChooserRedirectTarget(normalizeRedirectPath(pathname));
    if (chooser) return { target: `${chooser}${search || ''}`, code: 302 };
  }
  if (!target || target === normalizeRedirectPath(pathname)) return null;
  return { target: `${target}${search || ''}`, code: 301 };
}
