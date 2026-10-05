# Premium Ads Landing Page – Phase 1 (go.-Vorlage v2 + Premium-Ebene)

Stand: 05.10.2026 · Branch `feat/ads-premium-layer` · **nicht deployt, nichts in Strapi angelegt**

Entscheidungen (Parya, 05.10.2026): **Hybrid** (v2-Logik + Strapi-Overrides) · **Strapi-Schema nur als JSON
im PR** · **dezente Tiefe auf „ci-preis“** (Benjamin, 02.10.2026: v2 wirkte „zu AI-mäßig“).

## 1. Architektur

Kein zweites System. Die live laufende go.-Vorlage v2 (351 Seiten, `shared/adsTemplateV2*.ts`,
`app/components/pages/treatment/adsV2/Page.vue`) bleibt die einzige Ads-Seite. Neu ist eine
**Premium-Ebene**, die nur Klassen und CSS-Variablen setzt, plus ein **Override-Resolver** für Strapi:

```
Strapi (treatment-ads-page.adsOverrides, optional)
        │  resolveAdsOverrides()  – prüft Länge, HTML/Links, Markenname auf go., Heil-/Garantieversprechen
        ▼
v2-Logik (Preise, Garantie, Ablauf, FAQ, Bewertungs-/Ärzteauswahl, A/B-Angebot)  ← unverändert
        ▼
<div class="ads-premium">  ← Hülle in der Vorschau-Route
  Page.vue (unverändert)
        ▼
ads-premium.css (Tiefe, Selektor .ads-premium .v2.v2--ci) + useAdsDepth (Hero-Parallaxe, nur Desktop/Maus)
```

Phase 1 läuft **nur** in der Vorschau `/vorschau-premium/standorte/...` (auch über `?vorlage=premium`
an einer echten Seite). `Page.vue` ist bewusst unverändert. `ADS_PREMIUM_PAGES` (leer) ist die künftige
Live-Umschaltung; dafür muss die echte Route die Hülle ebenfalls setzen (Phase 2).

## 2. Strapi-Komponenten (Entwurf, `docs/strapi-schema/ads/`)

| UID | Felder |
| --- | --- |
| `ads.overrides` | `heroHeadline` (≤70), `heroSubline` (≤140), `headlines[]`, `sectionOrder[]`, `hiddenSections[]` |
| `ads.headline-override` | `key` (12 Abschnitte), `text` (≤70) |
| `ads.section-ref` | `section` (13 bewegliche Abschnitte) |
| Patch `treatment-ads-page` | neues Feld `adsOverrides` (`ads.overrides`, lokalisiert) |

Nicht im Schema: Preise, Rabatt, Garantie, CTA-Text/-Ziel, Farben, Abstände, CSS, Skripte.

## 3. Frontend-Dateien

Neu: `shared/adsPremium.ts`, `shared/adsPremium.test.ts`, `app/composables/useAdsDepth.ts`,
`app/assets/css/components/ads-premium.css`,
`app/pages/vorschau-premium/standorte/[citySlug]/[locationSlug]/[...treatmentSlug].vue`, `docs/strapi-schema/ads/*`, dieses Dokument.

Geändert (klein): `app/composables/useAdsTemplateV2.ts` (Premium-Vorschau = v2-Vorschau),
`app/composables/useLocationTreatmentPage.ts` (Vorschau-Check über `isAdsAnyPreviewPath`),
`app/utils/seo.ts` (Canonical über `stripAdsAnyPreview`), `app/middleware/ads-vorlage-v2.global.ts`
(`?vorlage=premium`), `package.json` (Test in `test:unit`). **Nicht** geändert: `adsV2/Page.vue`,
`shared/adsTemplateV2.ts`.

## 4. Design-Tokens (wiederverwendet)

Inter 400/500, Typo-Skala `--font-*`, Abstände `--space-100…1200`, Radien bis `--border-radius-card` (24 px),
Themes light/soft/neutral/strong, Schatten `--shadow-1…5`. Neu sind nur Aliase:
`--ads-depth-1 = --shadow-2`, `--ads-depth-2 = --shadow-4`, `--ads-depth-3 = --shadow-5` + weicher Fernschatten.
Keine neuen Farben; Rot bleibt auf Knopf und Neukundenpreis (ci-preis).

## 5. 3D / Bewegung

| Ebene | Wo | Mobil | Desktop |
| --- | --- | --- | --- |
| 1 | Abschnittskarten, Bewertungen, Einwände, Preiskarten | Schatten | Schatten |
| 2 | Einstiegspreis, Ärzt:innen-, Ablauf-, Beratungsfoto | Schatten | + Einstiegspreis 4 px angehoben |
| 3 | Hero-Foto, mitlaufende Leiste | Schatten | + Rückplatte, Parallaxe ≤ 6 px |
| – | Schwarze Aufrufe (Mitte, Schluss) | statische Kreisflächen (Verläufe) | dito |

Techniken: Schatten-Ebenen, geschichtetes Foto, `transform`/`translate3d` (GPU), keine Layout-Animation.
Fallbacks: `prefers-reduced-motion`, Touch, Save-Data, `deviceMemory < 4`, < 1024 px → nur statische Tiefe;
ohne JS ebenfalls statisch. Kein WebGL/Three.js, keine 3D-Assets.

## 6. Reihenfolge

Unverändert v2: Hero → Clips → Vertrauen → Steckbrief → Wirkweise → Aufruf → Ablauf → Preise → Zonen →
Ärzt:innen → Lounge → Beratung → Bewertungen → Einwände → Standort → FAQ → Schlussaufruf.
`resolveSectionOrder`/`resolveHiddenSections` sowie Unterzeilen- und Abschnitts-Überschriften-Overrides
sind fertig und getestet, **aber noch nicht angewendet** – Page.vue setzt diese Texte selbst (v2 hat
Vorrang). Phase 1 wendet nur die Hero-Überschrift an (über die `hero`-Prop). Rest: Phase 2.

## 7. Referenzseite

Profhilo Düsseldorf Arcaden – Vergleich:
`/vorschau-v2/standorte/duesseldorf/duesseldorf-arcaden/skinbooster/profhilo` ↔
`/vorschau-premium/standorte/duesseldorf/duesseldorf-arcaden/skinbooster/profhilo`.
Hinweis: Die Vorschau zeigt v2-Inhalte, nicht Parya's Strapi-Blöcke der echten Seite
(`ADS_TEMPLATE_V2_EXCLUDE`); die echte Seite bleibt unberührt.

## 8. CTA

Bereits zentral in v2: alle Knöpfe (Hero, Mitte, Preise, Ärzt:innen, Einwände, Standort-Bereich, Schluss,
Leiste) nutzen `heroCta`/`bookingButton` + `bookingData` → derselbe Buchungsdialog, Text aus `ADS_V2_CTA`
bzw. Angebots-Test A/B (`shared/adsOfferVariant.ts`). Kein Redaktions-Override (würde den A/B-Test verfälschen).

## 9. Tracking

Unverändert v2 (`data-track-placement="v2_*"`, GA4/Ads/Meta über `useGoogleAnalytics`, `offer_variant`).
Vorschau-Ereignisse tragen `template: "v2-premium-preview"`. `adsTrackPlacement()` liefert neue Kennungen
nach derselben Konvention.

## 10. Performance

Build-Vergleich (`nuxt build`, ads-Modus): globale CSS 225 903 → 229 052 Byte (+3,1 kB roh, **ca. +0,8 kB
gzip**; Regeln wirken nur unter `.ads-premium`, die v2-CSS liegt schon heute in derselben Datei).
JS: `useAdsDepth` im Chunk der Ads-Seite (ca. 1 kB minifiziert); Start erst per `requestIdleCallback`.
Lighthouse/LCP/INP/CLS: **noch nicht gemessen** – auf der Vercel-Vorschau des Branches messen.

## 11. Responsive-QA

**Offen** (320/375/390/430 px, Tablet, Desktop) – auf der Vercel-Vorschau. Mobil ändert die Ebene nur
Schatten; die Rückplatte ist auf ≥ 1024 px beschränkt und ragt nicht seitlich heraus.

## 12. Tests

`npm run test:unit`: 125/125 grün (davon 9 neu). `vue-tsc`: 71 Fehler vs. 70 auf `main`; der zusätzliche ist
TS5097 (`.ts`-Import in `shared/adsPremium.ts`) – dasselbe Muster wie `shared/adsTemplateV2.ts`, nötig für den
Node-Testlauf.
`nuxt build`: grün. Lint: kein Lint-Skript im Repo.

## 13. Nächste Schritte

1. Vercel-Vorschau: Lighthouse mobil/desktop, Viewports, Sichtvergleich mit Benjamin.
2. Strapi-Repo: Schema anwenden, Custom-Controller `/treatment-pages/:city/:loc/:pathKey` liefert `adsOverrides`.
3. Phase 2: Page.vue in Abschnitts-Komponenten zerlegen (verhaltensgleich, durch Tests abgesichert),
   dann Reihenfolge/Ausblenden anwenden.
4. Standortgenaue Overrides (Feld am Standort-Behandlungs-Datensatz).
5. Altlast: `app/components/block/LandingPageAds.vue` enthält erfundene Bewertungen/Zahlen – entfernen oder
   klar als ungenutzt markieren.
