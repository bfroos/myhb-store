/**
 * GEO / AI-readiness: /llms.txt (SEO audit 2026-07)
 *
 * Machine-readable site summary for AI assistants and crawlers
 * (ChatGPT, Claude, Perplexity, Google AI Overviews).
 * Cached for 24h; disabled in ads mode like the sitemap.
 */
export default defineCachedEventHandler(
  (event) => {
    const config = useRuntimeConfig();
    if (config.public.siteMode === "ads") {
      throw createError({ statusCode: 404, statusMessage: "Not found" });
    }

    const requestUrl = getRequestURL(event);
    const siteUrl = (
      (config.public.publicUrl as string) ||
      `${requestUrl.protocol}//${requestUrl.host}`
    ).replace(/\/+$/, "");

    const body = `# MY Health & Beauty

> Ärztlich geführte Beauty Lounges in Deutschland für minimalinvasive ästhetische
> Behandlungen: Botox®, Hyaluron-Filler, Skinbooster, Infusionen, Fettwegspritze,
> Anti-Haarausfall-Therapien und Schönheitsoperationen. Standorte in Einkaufszentren
> u. a. in Köln, Düsseldorf, Essen, Aachen und Kaiserslautern —
> Behandlungen vom Arzt, transparente Preise (Botox & Hyaluron ab 149,99 €).

## Behandlungen
- [Botox](${siteUrl}/behandlungen/botox): Faltenbehandlung ab 149,99 €
- [Hyaluron](${siteUrl}/behandlungen/hyaluron): Filler für Lippen, Wangen, Jawline
- [Skinbooster](${siteUrl}/behandlungen/skinbooster): Hydration & Kollagenaufbau
- [Infusionen](${siteUrl}/behandlungen/infusionen): Vitamin C ab 69 €
- [Haartransplantation](${siteUrl}/behandlungen/schoenheitsoperationen/haartransplantation): ab 2.499 €

## Standorte
- [Alle Standorte](${siteUrl}/standorte)

## Preise
- [Preisliste](${siteUrl}/preise)

## Ratgeber
- [Blog](${siteUrl}/blog): Ärztlich geprüfte Ratgeber zu ästhetischen Behandlungen
`;

    setHeader(event, "Content-Type", "text/plain; charset=utf-8");
    return body;
  },
  {
    name: "llms.txt",
    maxAge: 60 * 60 * 24,
    staleMaxAge: 60 * 60 * 24,
  },
);
