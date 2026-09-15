# A/B-Split Calendly vs. App-Buchung (#100)

**Stand:** 15.09.2026 · **Code:** `app/lib/bookingAbTest.ts`, `app/composables/useBookingAbTest.ts`

Ein Standort kann beide Buchungswege haben: die Calendly-URL (`calendlyUrl`) und
die App-Buchungs-URL (`appBookingUrl`, Feld seit #97). Welchen ein Besucher
bekommt, wird **beim Klick auf den Buchungs-Button** entschieden, einmal je
Besucher, gemerkt für 30 Tage.

Beim Rendern geht das nicht: Die Seiten liegen 15 Minuten im ISR-Cache, eine dort
gezogene Variante wäre für alle Besucher dieselbe.

## Auslieferungszustand: alles Calendly

Ohne gesetzte Env-Variablen bekommt **jeder** Besucher Calendly. Das ist
Absicht, siehe „Warum der Default Calendly ist" weiter unten.

## Scharfschalten

Zwei Env-Variablen im Vercel-Projekt (beide gelten für das jeweilige
Deployment — SEO wie Ads):

| Variable | Bedeutung | Default |
| --- | --- | --- |
| `NUXT_PUBLIC_AB_BOOKING_SPLIT` | Anteil der Besucher in Prozent, die die App bekommen. `50` = 50/50. | `0` (aus) |
| `NUXT_PUBLIC_AB_BOOKING_LOCATIONS` | Standort-Slugs mit Komma getrennt, für die der Split gilt | leer (nirgends) |

Zusätzlich muss am Standort in Strapi `appBookingUrl` gefüllt sein. Ohne zweite
URL gibt es nichts zu splitten — dann bleibt es bei Calendly, egal was in den
Env-Variablen steht.

Beispiel Köln Arcaden:

```
NUXT_PUBLIC_AB_BOOKING_SPLIT=50
NUXT_PUBLIC_AB_BOOKING_LOCATIONS=koeln-arcaden
```

Strapi, Location „Köln Arcaden":

```
appBookingUrl = https://app.myhealthandbeauty.com/book-appointment?location=koeln-aracden
```

> Der Standort-Slug der **App** heißt wirklich `koeln-aracden` (Buchstabendreher
> in `venues.url_slug`). Der Slug in Strapi (`koeln-arcaden`) ist ein anderer
> Wert und gehört in `NUXT_PUBLIC_AB_BOOKING_LOCATIONS`.

## Testen ohne Rollout

`?ab=app` bzw. `?ab=calendly` an eine Seiten-URL hängen erzwingt die Variante —
auch dann, wenn der Standort noch nicht freigegeben ist. Voraussetzung ist nur,
dass der Standort beide URLs hat. Die erzwungene Variante landet im selben
Cookie, der Tester bleibt also dabei, bis er das Cookie löscht oder mit dem
anderen Wert neu aufruft.

Die Bucket-Logik selbst prüft `npm run check:ab-split` ohne Browser.

## Was in GA4 ankommt

`ab_variant` (`app` | `calendly`) hängt an allen Conversion-Events der Website,
sobald der Besucher einen Buchungsweg unter dem Split geöffnet hat:
`click_booking`, `booking_location_selected`, `booking_datetime_selected`,
`booking_confirmed`. Wer nicht im Test ist, sendet den Parameter nicht — in GA4
steht dort „(not set)".

Damit das sichtbar wird, braucht es zwei Dinge außerhalb dieses Repos:

1. **GTM** (Container GTM-5KCNWFWS): Datenschichtvariable `ab_variant` und den
   Parameter am GA4-Tag „Funnel Events".
2. **GA4** (G-PB2XDTTPKZ): benutzerdefinierte Dimension `ab_variant`
   (ereignisbezogen). Ohne sie ist der Parameter in Berichten unsichtbar — genau
   die Falle aus #120.

Die Buchung der App-Variante wird im iframe auf `app.myhealthandbeauty.com`
abgeschlossen; das abschließende `booking_confirmed` pusht die **App** in ihre
eigene Datenschicht. Die Website hängt deshalb `ab_variant` als Query-Parameter
an die App-URL. Damit die App-Conversions in der Auswertung auf der richtigen
Variante landen, muss die App diesen Parameter in ihr `booking_confirmed`
übernehmen (offen, elanagency/myhb-os).

## Warum der Default Calendly ist

Ein in der App gebuchter Termin blockiert den Calendly-Slot nur dort, wo der
Kalender-Write-back (#95) läuft: Die App schreibt ihre Termine in den
Google-Kalender des Standorts, den Calendly auf Konflikte prüft. Fehlt das,
nimmt ein Standort über beide Systeme Termine für denselben Slot an —
Doppelbuchungen sind dann sicher, nicht nur möglich (Kaiserslautern,
08.09.2026).

Stand 15.09.2026 schreibt der Write-back an **allen** Standorten; für Köln
Arcaden nachgewiesen für alle nicht aus Calendly gespiegelten Termine seit
11.09. (Termine mit `walk_in_source = 'calendly'` lässt er bewusst aus, die
haben in Calendly schon ein Event; abgesagte Termine verlieren den Eintrag
wieder).

Trotzdem bleibt der Default Calendly: Das Umlegen auf 50/50 ist eine
Freigabe-Entscheidung von Benjamin, keine Nebenwirkung eines Deployments. Und es
ist eine Env-Änderung — kein Code-Deploy, in Minuten zurückdrehbar.

## Was der Split *nicht* macht

Die Regel „SEO-Deployment → App, Ads-Deployment → Calendly" aus #97 ist hier
nicht enthalten. Sie ist eine eigene Entscheidung und würde einen Standort
dauerhaft in beiden Systemen betreiben.
