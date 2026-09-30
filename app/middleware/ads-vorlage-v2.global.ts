import {
  ADS_TEMPLATE_V2_PREVIEW_PREFIX,
  isAdsTemplateV2Page,
} from "#shared/adsTemplateV2";

/**
 * go.* Seitenvorlage v2: `?vorlage=v2` an einer echten Standort-
 * Behandlungsseite fuehrt in die Vorschau /vorschau-v2/standorte/...
 * (nur Seiten aus ADS_TEMPLATE_V2_PAGES). Ohne den Parameter passiert nichts.
 *
 * Die Vorschau hat einen eigenen Pfad, weil Vercel-ISR die Query nicht an das
 * Server-Rendern weitergibt: Die echte Seite kaeme aus dem Cache und saehe
 * den Parameter nie. Nur im Browser, damit der gecachte Server-Stand der
 * echten Seite unberuehrt bleibt.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;
  if (to.query.vorlage !== "v2") return;
  const { isAdsMode } = useSiteModeFlags();
  if (!isAdsMode.value) return;
  const m = /^((?:\/[a-z]{2})?)\/standorte\/([^/]+)\/([^/]+)\/(.+?)\/?$/.exec(to.path);
  if (!m) return;
  if (!isAdsTemplateV2Page(m[2], m[3], m[4])) return;
  const { vorlage: _drop, ...query } = to.query;
  return navigateTo(
    { path: `${m[1]}${ADS_TEMPLATE_V2_PREVIEW_PREFIX}${to.path.slice(m[1]!.length)}`, query, hash: to.hash },
    { replace: true },
  );
});
