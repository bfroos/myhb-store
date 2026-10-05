# Strapi-Schema: Ads Overrides (Entwurf, nicht angewendet)

Gehört zu `shared/adsPremium.ts` (Premium-Ebene der go.-Vorlage v2). Laut Entscheidung
vom 05.10.2026 liegt das Schema vorerst nur hier im PR – es ist in **keiner** Strapi-
Instanz angelegt. Anwenden im Strapi-Quell-Repo (Dateien unter
`src/components/ads/*.json`, Attribut-Patch am Content-Type), dann deployen.

| Datei | Strapi-UID |
| --- | --- |
| `components/overrides.json` | `ads.overrides` |
| `components/headline-override.json` | `ads.headline-override` |
| `components/section-ref.json` | `ads.section-ref` |
| `treatment-ads-page.attribute-patch.json` | neues Feld `adsOverrides` an `api::treatment-ads-page.treatment-ads-page` |

Bewusst **nicht** im Schema: Preise, Rabatt, Garantie, CTA-Text/-Ziel, Farben, Abstände,
CSS-Klassen, Skripte. Die Enums entsprechen `ADS_OVERRIDABLE_HEADLINES` und den beweglichen
Abschnitten aus `ADS_SECTIONS`; der Frontend-Resolver (`resolveAdsOverrides`) prüft trotzdem
alles noch einmal (Länge, HTML/Links, Markenname auf go., Heil-/Garantieversprechen).

Offen: `treatment-ads-page` ist je Behandlung, nicht je Standort. Für standortgenaue Texte
müsste das Feld (zusätzlich) an den Standort-Behandlungs-Datensatz – dessen Content-Type
im Strapi-Repo prüfen.
