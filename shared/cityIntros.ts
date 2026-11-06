/**
 * E24 #421: eigene Einleitung je Stadtseite /standorte/<stadt>.
 *
 * Die Stadtseiten zeigten nur die Karten der Standorte, im Hauptteil rund
 * 30 Woerter (gemessen 06.11.2026 auf www). Hier steht je Stadt ein Text:
 * wo die Standorte sind, was man dort machen lassen kann (mit Links auf die
 * Seiten "Behandlung je Standort"), und ein Absatz fuer das Umland statt
 * eigener Seiten wie "Botox Leverkusen" (zu wenig Suchvolumen, Gefahr von
 * Brueckenseiten). Die Behandlungen werden nur genannt und verlinkt, damit
 * die Stadtseite nicht mit "Botox Koeln" konkurriert.
 *
 * Daten: server/assets/city-intros.json, ausgeliefert ueber /api/seo-city-intro.
 */
import { rich } from "./seoLocalTexts.ts";

export type CityIntro = {
  citySlug: string;
  headline: string;
  intro: string;
  paragraphs: string[];
  linksHeadline: string;
  links: string[];
  umlandHeadline: string;
  umland: string;
};

/** Bloecke fuer den BlockRenderer (blocks.text-content). */
export function cityIntroBlocks(intro: CityIntro | null | undefined) {
  if (!intro) return [];
  return [
    {
      __component: "blocks.text-content",
      id: "city-intro",
      headline: intro.headline,
      intro: intro.intro,
      content: rich(intro.paragraphs),
    },
    {
      __component: "blocks.text-content",
      id: "city-intro-links",
      headline: intro.linksHeadline,
      content: rich(intro.links),
    },
    {
      __component: "blocks.text-content",
      id: "city-intro-umland",
      headline: intro.umlandHeadline,
      content: rich([intro.umland]),
    },
  ];
}
