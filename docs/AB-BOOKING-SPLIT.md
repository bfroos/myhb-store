# A/B-Split Calendly vs. App-Buchung (#100)

**Stand:** 15.09.2026 · **Zuschnitt:** bfroos/myhb-store#100, Begründung elanagency/myhb-os#87
**Code:** `app/lib/bookingAbTest.ts`, `app/plugins/ab-split.client.ts`, `app/composables/useBookingAbTest.ts`

Ein Standort kann beide Buchungswege haben: die Calendly-URL (`calendlyUrl`) und die App-Buchungs-URL (`appBookingUrl`, Feld seit #97). Der Test entscheidet je Besucher, welchen er bekommt.

## Zwei Zeitpunkte

**Zuweisung** beim Seitenaufruf in jedem Deployment, in dem ein Anteil gesetzt ist: Bucket `app` oder `calendly`, Cookie 30 Tage, **nur mit Cookiebot-Marketing-Einwilligung**. Mitgeschrieben wird `ab_source` (`ads` bei go.myhealthandbeauty.com, `seo` bei www) — die Quelle bleibt am Besucher, auch wenn er später das Deployment wechselt.

**Anwendung** beim Öffnen des Buchungsdialogs, wenn der Standort feststeht: Der Bucket entscheidet zwischen `calendlyUrl` und `appBookingUrl` der Location.

Diese Trennung ist kein Umweg für die Meta-Landingpages (die keinen festen Standort haben, sondern die Standortsuche öffnen) — derselbe Mechanismus trägt ohne Änderung auch die Google-Seiten mit festem Standort (`go.myhealthandbeauty.com/standorte/koeln/koeln-arcaden/hyaluron/lippen-aufspritzen`). Weil die Zuweisung vor der Standortwahl liegt, ist sie von ihr unabhängig zufällig: Der Nenner bleibt sauber, auch wenn die Standortwahl selbst eine Funnel-Stufe ist.

Zugewiesen wird bewusst nicht beim Rendern — die Seiten liegen 15 Minuten im ISR-Cache, eine dort gezogene Variante wäre für alle Besucher dieselbe.

## Abgrenzung und Auslieferungszustand

| Regel | Wirkung |
| --- | --- |
| `NUXT_PUBLIC_AB_BOOKING_SPLIT` leer/0 | Kein Besucher wird zugewiesen, alle bekommen Calendly. **Auslieferungszustand.** |
| Ein Schalter je Deployment | Ads (`myhb-store-ads`) und SEO (`myhb-store`) haben getrennte Env-Werte; wo kein Anteil gesetzt ist, wird weder zugewiesen noch angewendet — auch nicht bei vorhandenem Cookie |
| Nur mit Marketing-Einwilligung | Ohne Einwilligung kein Bucket, Default Calendly, außerhalb des Tests |
| `?ab=app` / `?ab=calendly` | Erzwingt und merkt die Variante — auch ohne Anteil und ohne Banner-Antwort (bewusste Testhandlung) |

Scharfschalten ist eine Env-Änderung im Ads-Projekt, kein Code-Deploy:

```
NUXT_PUBLIC_AB_BOOKING_SPLIT=50
```

Dazu muss an den Standorten in Strapi `appBookingUrl` gefüllt sein, z. B. Köln Arcaden:

```
https://app.myhealthandbeauty.com/book-appointment?location=koeln-aracden
```

> Der Standort-Slug der **App** ist nicht aus dem Namen ableitbar und enthält teils Buchstabendreher:
> verkürzt oder anders geschnitten als der Strapi-Slug (`leipzig-hoefe`, `moenchen-minto`,
> `berlin-gesundbrunnen`, `aachen-aquis-plaza`). Nie raten, immer aus
> `select name, url_slug from public.venues` kopieren — oder `npm run check:booking-slugs` laufen lassen.
>
> Stand 21.09.2026 (9 von 10 buchbaren Standorten; die Dreher in Köln und Aachen sind am selben Tag
> korrigiert worden, siehe myhb-os `docs/venue-slug-umbenennung-2026-09-21.md`):
>
> | Strapi-Slug | App `url_slug` |
> | --- | --- |
> | `aquis-plaza` | `aachen-aquis-plaza` |
> | `gesundbrunnencenter` | `berlin-gesundbrunnen` |
> | `forum` | `duisburg-forum` |
> | `duesseldorf-arcaden` | `duesseldorf-arcaden` |
> | `k-in-lautern` | `k-in-lautern` |
> | `koeln-arcaden` | `koeln-arcaden` |
> | `hoefe-am-bruehl` | `leipzig-hoefe` |
> | `minto` | `moenchen-minto` |
> | `palais-vest` | `recklinghausen-palais-vest` |
>
> `mediapark-klinik` hat kein Venue in der App (Klinik, keine Lounge) und bleibt Calendly-only.

## Was in GA4 ankommt

| Ereignis | Wann | Rolle |
| --- | --- | --- |
| `ab_assigned` (+ `ab_variant`, `ab_source`) | Bucket wurde neu gezogen | **Nenner** — so viele Besucher je Arm und Quelle |
| `ab_variant` als Datenschicht-Variable | jeder Seitenaufruf im Test | hängt an den Ereignissen der Seite |
| `click_booking` (+ `ab_variant`, ggf. `ab_fallback`) | Buchungsdialog geht auf | Zwischenstufe |
| `booking_confirmed` (+ `ab_variant`) | Buchung bestätigt | **Zähler** |

`booking_type` bleibt die Gegenprobe: `ab_variant=app` muss `booking_type=app` ergeben. Jede Abweichung ist ein Bug, kein Messrauschen — die einzige erlaubte Ausnahme trägt `ab_fallback: true`.

**`ab_fallback: true`** heißt: Der Besucher ist im App-Arm, aber die gewählte Location hat keine `appBookingUrl`, also ging Calendly auf. Diese Sitzungen müssen aus der Auswertung fliegen, sonst verwässern sie den App-Arm mit Calendly-Buchungen.

Auf der Dankesseite kommt `ab_variant` aus der Übergabe in `lib/calendlyBookingHandoff.ts`, nicht aus dem Cookie: Das Cookie sagt nur, in welchem Arm der Besucher ist — die Übergabe sagt, dass **diese** Buchung aus einem Dialog unter dem Split stammt.

Die App-Buchung läuft im iframe auf `app.myhealthandbeauty.com` und pusht ihr `booking_confirmed` selbst; sie bekommt `ab_variant` deshalb als Query-Parameter mit. Damit die App-Conversions im richtigen Arm landen, muss die App diesen Parameter übernehmen (offen, elanagency/myhb-os).

## Vor dem Teststart

1. **GA4** (G-PB2XDTTPKZ): benutzerdefinierte Dimension `ab_variant` (ereignisbezogen) — sonst sammelt GA4 den Wert ein, zeigt ihn nirgends und füllt rückwirkend nichts nach. Sinnvoll zusätzlich: `ab_fallback`.
2. **GTM** (GTM-5KCNWFWS): Datenschichtvariable `ab_variant` und Parameter am GA4-Tag „Funnel Events". Der Stape-Loader sitzt vor GTM — ein Publish wirkt erst nach rund 40 Minuten.
3. **Beide Arme auf derselben Seitenvariante** laufen lassen. Düsseldorf lief im Juni parallel auf `/lippen-aufspritzen` (12,1 % CR) und `/lippen-aufspritzen-rabatt` (5,6 %) — wer die Arme auf verschiedene Seiten legt, misst Rabatt gegen Nicht-Rabatt statt Calendly gegen App.

## Warum `ab_source` und nicht der Hostname

Seit 16.09.2026 läuft der Test auf Entscheidung von Benjamin auch auf dem organischen Verkehr — mehr Fälle, schnellere Antwort. Bezahlt und organisch haben aber verschiedene Grundkonversionsraten: Wirft man beide Töpfe zusammen, kann eine echte Wirkung verschwinden oder eine erfundene entstehen. Jedes Ereignis trägt deshalb `ab_source`.

Der Hostname reicht dafür **nicht**: Die Dankesseite nach einer Calendly-Buchung liegt immer auf `www`, auch wenn der Besucher aus einer Anzeige kam. Eine Trennung über den Hostnamen würde jede Ads-Conversion als SEO zählen. `ab_source` kommt deshalb aus dem Cookie der Zuweisung und reist über die Übergabe in `calendlyBookingHandoff.ts` bis zur Dankesseite mit.

## Bekannte Einschränkungen

- Der Bucket hängt am Cookie; ein Gerätewechsel kann dieselbe Person in beide Arme bringen. Akzeptiert, gehört in die Auswertungs-Fußnote.
- **Standorte ohne `appBookingUrl` landen im App-Arm durchgehend im Fallback.** Seit 21.09.2026 betrifft das nur noch
  `mediapark-klinik` — die übrigen neun buchbaren Standorte haben eine App-URL. Davor hatte nur Köln Arcaden eine,
  der App-Arm fiel also vom 16. bis 21.09. fast vollständig auf Calendly zurück: **Auswertungen aus diesem Zeitraum
  sind ohne Filter auf `ab_fallback = false` wertlos.**
- Besucher ohne Marketing-Einwilligung stehen außerhalb des Tests. Sie sind mangels GA4-Ereignissen ohnehin unsichtbar, aber ohne diese Regel passten die Nenner nicht.

## Was der Split *nicht* macht

Die Regel „SEO-Deployment → App, Ads-Deployment → Calendly" aus #97 ist hier nicht enthalten. Sie ist eine eigene Entscheidung und betriebe einen Standort dauerhaft in beiden Systemen.

Der Kalender-Write-back (#95) ist keine Vorbedingung mehr: Alle neun Standorte schreiben seit 11.09.2026 in ihren Google-Kalender, Calendly blendet die Slots damit selbst aus.

## Prüfen

`npm run check:ab-split` — 23 Fälle ohne Browser: Auslieferungszustand, Einwilligungspflicht, `?ab=`, 50/50-Verteilung über 4000 Durchläufe, Beständigkeit des Buckets, `ab_assigned` nur beim ersten Mal, und der sichtbare Rückfall ohne `appBookingUrl`.
