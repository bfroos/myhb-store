import { isAdsTemplateV2LivePage } from "#shared/adsTemplateV2";
import {
  ADS_OFFER_AB_ENABLED,
  adsOfferBPath,
  wantsAdsOfferB,
} from "#shared/adsOfferVariant";

/**
 * go.* Angebots-Test (shared/adsOfferVariant.ts): `?angebot=beratung` an
 * einer echten v2-Seite -> /ab-beratung/standorte/... (Variante B).
 * Beim ersten Aufruf erledigt das schon das Skript im <head> der Seite; diese
 * Middleware deckt Navigationen innerhalb der App ab. Nur im Browser, damit
 * der gecachte Server-Stand der echten Seite unberuehrt bleibt.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server || !ADS_OFFER_AB_ENABLED) return;
  if (!wantsAdsOfferB(to.query)) return;
  const { isAdsMode } = useSiteModeFlags();
  if (!isAdsMode.value) return;
  const m = /^\/standorte\/([^/]+)\/([^/]+)\/(.+?)\/?$/.exec(to.path);
  if (!m || !isAdsTemplateV2LivePage(m[1], m[2], m[3])) return;
  return navigateTo({ path: adsOfferBPath(to.path), query: to.query, hash: to.hash }, { replace: true });
});
