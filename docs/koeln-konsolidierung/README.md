# Standortarchitektur Köln – Konsolidierung

Ticket: „Standortarchitektur Köln konsolidieren – alle nichtoperativen Behandlungen in den Köln Arcaden, Schönheitsoperationen im MediaPark“.
Gegenstück im CMS: `bfroos/myhb-cms`, Branch `feature/koeln-standort-konsolidierung`.

## Ausgangslage (Live-Crawl 06.10.2026; Rohdaten in der Excel-Lieferung, Blatt „Crawl vorher“)

- `/treatment-pages/:city/:location/:pathKey` (myhb-cms) lieferte **jede** Behandlung an **jedem** Standort mit 200. Die Standortzuordnung existierte nur in den Kacheln (`locationTypeToTreatmentTypes`), nicht im Routing.
- Duplikate wurden bisher einzeln über Strapi-Redirects abgefangen – lückenhaft:
  - **13 MediaPark-Seiten für nichtoperative Behandlungen mit 200** (u. a. `botox/stirnfalte`, `hyaluron/hylase`, `hyaluron/kinnkorrektur`, `skinbooster`), davon 5 trotz Strapi-Redirect, weil der Redirect auf sich selbst zeigt.
  - **6 Arcaden-Seiten für OPs mit 200** (`schoenheitsoperationen`, `brustvergroesserung`, `facelift`, `fettabsaugung`, `oberarmstraffung`, `oberschenkelstraffung`).
  - 6 Weiterleitungen auf nationale `/behandlungen/...`-Seiten, 43 Alt-URLs auf die Startseite, 16 `btx`-Alt-Pfade pauschal auf den Botox-Hub, 3 inhaltlich falsche Ziele, 3 Redirect-Ketten.
- Sitemap: 135 Köln-URLs, davon 62 nicht final (47 Weiterleitungen, 15 Duplikate mit 200). Nachher: 73 (Stadt-Hub, 2 Standort-Hubs, 60 Arcaden, 10 MediaPark-OP).
- Schema: MediaPark als `HealthAndBeautyBusiness` mit Katalog „Botox/Hyaluron/PRP/Fettwegspritze“ (die Klinik-Erkennung hing an einer falschen Place-ID), kein `@id`, `url` der Einrichtung = jeweilige Behandlungs-URL.
- Strapi-Daten: „Facelift“ und der Kategorie-Hub „Schönheits-OPs“ sind als `minimally-invasive` gepflegt → erscheinen in den Arcaden-Kacheln.
- **Keine einzigartigen MediaPark-Inhalte:** Alle 13 MediaPark-Duplikate und alle 6 Arcaden-OP-Duplikate liefern exakt die nationale Basisseite (kein Location-Override). Lokale Overrides existieren nur für die Arcaden. Vor dem Redirect muss deshalb nichts übernommen werden (Nachweis: Vergleich aller Blöcke `hero … faq` gegen `/treatment-pages/by-path`).

## Zentrale Regel (myhb-cms `src/utils/locationTreatmentRouting.ts`)

> Innerhalb einer Stadt bedient eine Behandlungsart genau der Standort mit dem kleinsten Standorttyp, der sie anbieten darf (lounge < center < clinic).

| Behandlungsart | Köln |
|---|---|
| minimally-invasive | Köln Arcaden (lounge) |
| abulatory (Haartransplantation, Lidstraffung, Bruststraffung) | MediaPark Klinik (clinic) |
| operational | MediaPark Klinik (clinic) |

- Effektiver Typ = Typ der Behandlung; eine als minimalinvasiv gepflegte Seite in einer Kategorie mit (ambulant-)operativen Behandlungen gilt mindestens als deren kleinster OP-Typ (fängt Facelift/Kategorie-Hub ab).
- Umleitung nur bei **genau einem** bedienenden Standort in derselben Stadt; Standorte „coming soon“ sind nie Ziel.
- Ohne Alternative in der Stadt: **unverändert** → heute ändert sich nur Köln (einzige Stadt mit Lounge + Klinik). Neue Behandlungen werden automatisch richtig zugeordnet.

## Änderungen

### myhb-cms
- `findByLocationAndPath`: liefert bei fremdem Standort `data.redirect` statt der Seite; `availableTreatmentPathKeys` nur noch für den bedienenden Standort; neu `cityTreatmentLocations` (pathKey → Geschwister-Standort).
- `with-treatments`: Kacheln/Sitemap nur bediente Behandlungen; neu `siblingLocations` für den Hinweis.
- `locations/bookable`: blendet abgebende Standorte je Behandlungsart aus (Standort-Kacheln auf `/behandlungen`, Buchungsdialog); optional `pathKey` für den effektiven Typ.
- Unit-Tests (`npm run test:unit`, in CI).

### myhb-store
- Standort-Behandlungsseite: `data.redirect` → serverseitiger **301** direkt auf die finale URL (`navigateTo(…, { redirectCode: 301 })`, lokalisiert).
- `relatedTreatments`/Kacheln: lokal → Geschwister-Standort → national (`shared/locationTreatmentLinks.ts`, Tests).
- Standortseite: Hinweisblock (Arcaden → „Operative Schönheitsbehandlungen und Haartransplantationen werden an unserem Kölner OP-Standort in der MediaPark Klinik angeboten.“ mit Link auf den MediaPark-OP-Hub; MediaPark → Verweis auf die Arcaden).
- Behandlungskachel: Link-Text nur noch der Behandlungsname (Stretched Link), Preis und Pfeil außerhalb des `<a>`; behebt verschachtelte Links.
- Schema: `@id` je Einrichtung (`/standorte/{stadt}/{standort}#clinic`), `url` = Standort-URL, `parentOrganization` mit `#organization`, Klinik-Erkennung über `location.type`, Klinik-Katalog nur mit tatsächlichen Leistungen, `MedicalProcedure` mit `@id` und `availableService`-Verknüpfung.
- Sitemap: keine Code-Änderung nötig – sie liest die Standort-Behandlungen aus `with-treatments`, das jetzt konsolidiert liefert.
- `server/assets/redirects-koeln.json` (neu, Vorrang vor `redirects.json`): 65 korrigierte Köln-Ziele (Startseite/Botox-Hub/falsche Behandlung/Kette → finale lokale URL). `redirects.json` selbst bleibt unverändert; die überschriebenen Alt-Einträge können in einem Folge-PR dort direkt ersetzt werden.
- `scripts/koeln-konsolidierung-strapi.mts`: Korrektur von 16 Strapi-Redirects (+ optional Behandlungstypen), Trockenlauf als Standard, `--rollback`.
- `scripts/check-koeln-konsolidierung.mts`: Abnahme-Crawl (Kriterien 1–12) gegen Preview/Prod.

## Einspiel-Reihenfolge

1. **myhb-store** mergen und deployen (abwärtskompatibel: neue Felder sind optional).
2. Preview prüfen: `BASE_URL=<preview> npx tsx scripts/check-koeln-konsolidierung.mts` (Preview muss auf ein CMS mit Schritt 3 zeigen, sonst nur Teilprüfung).
3. **myhb-cms** mergen → Strapi Cloud deployt.
4. Strapi-Daten: `npx tsx scripts/koeln-konsolidierung-strapi.mts` (Trockenlauf), dann `--apply`. `--typen` nur nach Freigabe (Nebenwirkung: Facelift/Schönheits-OPs verschwinden auch aus den Kacheln anderer Lounges).
5. Blog „was-hilft-gegen-haarausfall“: 2 Links von MediaPark auf Arcaden umstellen (siehe Skriptausgabe).
6. Neues Vercel-Deployment oder ≤ 15 Min warten (ISR), dann Abnahme-Crawl gegen Produktion.
7. Sitemap in der Search Console neu einreichen (`https://www.myhealthandbeauty.com/sitemap.xml`).
8. Externe Links laut Excel-Blatt „Externe Updates“ (nicht automatisch geändert).

**Achtung:** Nicht zuerst das CMS deployen – ein altes Frontend würde `data.redirect` nicht kennen und eine leere Seite mit 200 ausliefern.

## Rollback

| Ebene | Maßnahme | Wirkung |
|---|---|---|
| CMS | Revert-PR in myhb-cms, Strapi Cloud deployt | Duplikate liefern wieder 200 (Ausgangszustand), keine kaputten Seiten |
| Strapi-Daten | `npx tsx scripts/koeln-konsolidierung-strapi.mts --rollback --apply [--typen]` | schreibt die vorherigen Ziele/Typen zurück (mit Ist-Wert-Prüfung) |
| Frontend | Revert-PR in myhb-store (oder nur `redirects-koeln.json` leeren) | Redirect-Korrekturen, Kachel-Markup, Schema wie vorher |

Redirects sollen mindestens 12 Monate, möglichst dauerhaft bestehen. Die Standortregel ist dauerhaft; die einzelnen Strapi-/JSON-Einträge bleiben als Absicherung.

## Offene Punkte / Freigaben

- Entschieden (Benjamin, 06.10.2026): `/pages/ohh-de-cologne` und `/en|tr/pages/ohh-de-cologne` → Arcaden-Standortseite; Strapi #254 `mediapark-klinik/botox-rabatt` → `koeln-arcaden/botox`; Behandlungstypen Facelift → `operational`, Kategorie „Schönheits-OPs“ → `abulatory` (`--typen`).
- **Die Regel gilt in jeder Stadt automatisch.** Sobald eine Stadt einen zweiten, geöffneten Standort anderen Typs bekommt (z. B. ein Center neben einer Lounge), übernimmt der kleinste passende Standorttyp die Behandlungsart, die anderen Standorte leiten per 301 dorthin um und verlieren die Kacheln. Beim Anlegen eines neuen Standorts in einer Stadt mit bestehendem Standort deshalb vorher `check-koeln-konsolidierung.mts` sinngemäß für die Stadt laufen lassen und Redirects/Ads-Ziele prüfen.
- Sprachversionen `/en|tr|ar|fr|nl/…/koeln/...` werden über dieselbe Regel lokalisiert umgeleitet; hreflang-Alternates der finalen Seiten zeigen auf finale Seiten.
- Schema- und Kachel-Änderungen sind Code-Logik und wirken technisch für alle Städte; inhaltlich ändern sie außerhalb Kölns nur Auszeichnung/Markup, keine URLs.
- Navigation/Header/Footer verlinken bewusst national (`/behandlungen/...`) – das ist keine Köln-Verlinkung und nicht Teil der Abnahme Kriterium 11.
