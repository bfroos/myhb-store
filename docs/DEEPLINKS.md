> Kopie aus elanagency/myhb-os (`docs/DEEPLINKS.md`, Branch `feat/funnel-p0-conversion-audit`). Die App-Datei ist führend; Änderungen dort nachziehen.

# Deeplinks in die Buchungs-App

Stand: 08.09.2026 · Gilt für `https://app.myhealthandbeauty.com/book-appointment` · Gegenstück im Store-Repo: `app/composables/useAppBookingDialog.ts` (bfroos/myhb-store) · Issue: bfroos/myhb-store#66

Die Website öffnet die App in einem Dialog-iFrame (600 px breit, 98 svh hoch) oder – z. B. aus Anzeigen – direkt. Alle Parameter werden beim ersten Laden gelesen; die Auswahl liegt danach in `sessionStorage` und überlebt die Navigation durch den Flow.

## 1. Vorauswahl

| Parameter | Wert | Quelle in der App | Verhalten |
|---|---|---|---|
| `location` | `venues.url_slug` | Tabelle `venues` (`status=active`, `is_available=true`) | Standort wird vorgewählt, Standortliste eingeklappt. Unbekannt → dezenter Hinweis unter dem Titel, Liste offen. |
| `category` | `categories.url_slug` (oder Website-Alias) | Tabelle `categories` | Kategorie wird vorgewählt, Behandlungsliste geöffnet. Erfordert einen gewählten Standort. |
| `treatment` | `treatments.url_slug` **oder** Website-Slug aus der Alias-Tabelle | Tabelle `treatments` (`status=active`, `is_bookable=true`), dann `src/lib/treatmentSlugAliases.json` | Behandlung wird in den Warenkorb gelegt, Kategorie automatisch gesetzt. Unbekannt → Standort bleibt vorgewählt, passende Kategorie wird geöffnet (falls über Alias bestimmbar), Hinweis unter dem Titel. **Kein rotes Fehlerbanner.** |
| `lead` | Token aus dem Perspective-Funnel | `src/lib/leadPrefill.ts` | Name/E-Mail/Telefon werden im Registrierungsformular vorbelegt (#38). |

Reihenfolge: `location` → `category`/`treatment`. Ohne gültigen Standort wird keine Kategorie/Behandlung vorgewählt (die Behandlungsliste hängt am Standort).

### Gültige Werte (08.09.2026)

Standorte (`location=`):

| Slug | Standort |
|---|---|
| `aachen-aquiz-plaza` | Aachen Aquis Plaza |
| `berlin-gesundbrunnen` | Berlin Gesundbrunnen-Center |
| `duisburg-forum` | Duisburg Forum |
| `duesseldorf-arcaden` | Düsseldorf Arcaden |
| `k-in-lautern` | Kaiserslautern K in Lautern |
| `koeln-aracden` | Köln Arcaden (Tippfehler im Slug ist produktiv – nicht ändern, ohne die Website anzupassen) |
| `leipzig-hoefe` | Leipzig Höfe am Brühl |
| `moenchen-minto` | Mönchengladbach Minto |
| `recklinghausen-palais-vest` | Recklinghausen Palais Vest |

Kategorien (`category=`): `kostenlose-beratung`, `botox`, `hyaluron`, `fett-weg-spritze`, `anti-haarausfall`, `infusionen`, `skinbooster`.

Behandlungen (`treatment=`, App-Slugs): `kostenlose-beratung`, `1-zone-botox`, `2-zonen-botox`, `3-zonen-botox`, `botox-behandlung`, `kostenlose-nachbehandlung`, `masseter-bruxismus-behandlung`, `fett-weg-spritze`, `prp-haartherapie`, `filler-hyaluron-behandlung`, `hylase`, `lipfiller`, `vitamin-infusion`, `mesotherapie`, `profhilo`, `vampirlifting`. („Lumi Eyes (Polynukleotide)“ hat noch keinen `url_slug` und ist per Deeplink nicht erreichbar.)

Aktuelle Werte jederzeit prüfen mit `node scripts/check-deeplink-slugs.mjs --soft` (liest die Sitemap der Website und die App-Slugs über die anonyme Supabase-REST-API).

## 2. Attribution und Rabattcode (bfroos/myhb-store#67, #74)

Der Store hängt beim Öffnen des Dialogs seinen Attributionsspeicher an (`collectAttributionParams()`), die App liest ihn in `src/lib/attributionCapture.ts`:

| Parameter | Bedeutung | Landet in |
|---|---|---|
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` | Last Touch (Fallback First) | `appointment_attribution.last_*`, GA4-Events |
| `gclid` \| `fbclid` \| `ttclid` | Klick-ID des Last Touch | `appointment_attribution.last_click_id` als `gclid:…` / `fbclid:…` / `ttclid:…` |
| `ft_source`, `ft_medium`, `ft_campaign`, `ft_click_id` | First Touch (nur wenn abweichend) | `appointment_attribution.first_*`, Kundenprofil (`patient_channel_assignments.utm_*`), GA4-Events als `ft_*` |
| `ref_path` | Pfad der Website-Seite, von der gebucht wurde (`/behandlungen/hyaluron/lippen-aufspritzen`) | Referrer-Ersatz im iFrame, GA4-Events; Spalte `ref_path` vorgeschlagen |
| `promo` | Rabattcode aus dem Newsletter-Dialog (`NEU20`), `[A-Za-z0-9_-]{2,40}` | `sessionStorage.mhb_promo`, GA4-Events; Anzeige in der Zusammenfassung und Spalte `promo_code` sind Teil von #74 |

Alle Werte sind auf 500 Zeichen begrenzt, `ref_path` muss mit `/` beginnen. Zusätzlich liest die App weiterhin das domainweite Cookie `myhb_attribution` der Website, wenn der Browser es im iFrame freigibt.

Beispiel-URL, wie sie der Store erzeugt:

```
https://app.myhealthandbeauty.com/book-appointment
  ?location=aachen-aquiz-plaza&treatment=lippen-aufspritzen
  &utm_source=meta&utm_medium=paid_social&utm_campaign=lips_sept&fbclid=…
  &ft_source=google&ft_medium=cpc&ft_click_id=gclid%3A…
  &ref_path=%2Fbehandlungen%2Fhyaluron%2Flippen-aufspritzen&promo=NEU20
```

## 3. Verhalten im iFrame

- Rechtslinks (Impressum/Datenschutz) und die Wortmarke öffnen die Website mit `target="_blank"` bzw. `target="_top"`.
- „Abbrechen“ (nach Rückfrage) sendet `window.parent.postMessage({ type: "myhb:booking-cancelled" }, "https://www.myhealthandbeauty.com")` und navigiert anschließend das Top-Fenster zur Website. Der Store kann auf die Nachricht hören und den Dialog schließen, dann entfällt die Navigation aus Nutzersicht.
- GA4: Die App setzt `gtag('set','linker', { domains: [myhealthandbeauty.com, www., app.], accept_incoming: true })` vor GTM. Im GTM-Google-Tag der Property müssen dieselben Domains unter „Cross-Domain-Messung“ stehen, damit `_gl` aus dem Website-Link akzeptiert wird.

## 4. Slug-Mapping Website ↔ App

Der Store übergibt heute `?treatment=<Strapi-Slug>` der Behandlungsseite. Von 63 Behandlungs-Unterseiten der Website haben nur `hylase`, `profhilo` und `prp-haartherapie` denselben Slug wie die App; alles andere lief bis jetzt ins Leere (rotes Banner, keine Vorauswahl). Die 8 Unterseiten unter `schoenheitsoperationen/` sind in der App nicht buchbar und bleiben ohne Zuordnung (die Website sollte dort keinen App-Link setzen).

Übergangslösung in der App: `src/lib/treatmentSlugAliases.json` bildet Website-Slugs auf App-Slugs ab (`lippen-aufspritzen` → `lipfiller`, `3-zonen-botox-preise` → `3-zonen-botox`, `lemon-bottle-*` → `fett-weg-spritze`, …) und Unterseiten ohne eigene App-Behandlung auf eine Kategorie (`hair-boost-infusion4` → `anti-haarausfall`). Die Zuordnung der Unterseiten (z. B. Baby-Botox → „Botox® Behandlung“) ist ein Vorschlag und fachlich zu bestätigen.

Dauerhafte Lösung (Vorschlag, zwei Optionen, die sich ergänzen):

1. **Strapi-Feld am Treatment**: `appTreatmentSlug` (Text, optional). `withAppTreatmentSlug()` im Store nutzt es, wenn gesetzt, sonst den Seiten-Slug. Content-Team pflegt die Zuordnung dort, wo auch der Calendly-/App-Link je Standort gepflegt wird.
2. **DB-Spalte in der App**: `treatments.website_slugs text[]` (siehe `docs/sql/2026-09-08-funnel-attribution-proposal.sql`). Dann ersetzt eine Abfrage `website_slugs @> {slug}` die Alias-Datei, und der Check-Skript-Lauf kann in CI laufen.

Automatisierter Check: `node scripts/check-deeplink-slugs.mjs` bricht mit Exit-Code 1 ab, sobald ein Website-Slug weder direkt noch per Alias noch über eine Kategorie auflösbar ist.
