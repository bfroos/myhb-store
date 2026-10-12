/**
 * E24 #318: Besuche aus KI-Assistenten (ChatGPT, Perplexity, Copilot,
 * Gemini, Claude) fuer GA4 kennzeichnen. Beim ersten Seitenaufruf mit
 * KI-Referrer oder utm_source=chatgpt.com ein dataLayer-Ereignis
 * `ai_referral` mit `ai_source`. Kein Cookie, keine Personendaten; die App
 * bekommt die Quelle ohnehin ueber myhb_journey (Referrer-Host).
 * Nur www.
 */
import { aiSource } from "#shared/aiReferrer";
import { externalReferrerHost } from "~/lib/journey";

export default defineNuxtPlugin(() => {
  const { public: pub } = useRuntimeConfig();
  if (pub.siteMode === "ads") return;
  try {
    const host = externalReferrerHost(document.referrer, window.location.hostname);
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    const source = aiSource(host, utm);
    if (!source) return;
    const dl = ((window as any).dataLayer = (window as any).dataLayer || []);
    dl.push({ event: "ai_referral", ai_source: source, ai_referrer: host ?? utm ?? "" });
  } catch {
    // nie die Seite stoeren
  }
});
