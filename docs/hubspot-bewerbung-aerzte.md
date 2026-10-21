# Bewerbungsformular Ärzte → HubSpot

Ticket: [bfroos/myhb-store#102](https://github.com/bfroos/myhb-store/issues/102) ·
Epic E6 ([#103](https://github.com/bfroos/myhb-store/issues/103)) · Stand: 19.10.2026

Das Formular steht am Ende von `/karriere/aerzte` (Anker `#bewerbung`). Der
Code ist fertig und deployt — **ohne die Handarbeit im HubSpot-Portal unten
läuft er aber ins Leere**: Ohne Private-App-Token antwortet die Route mit 500,
ohne die Properties mit 502.

## Was der Code tut

| Schritt | Wohin in HubSpot |
| --- | --- |
| 1. Lebenslauf hochladen | File Manager, Ordner `/bewerbungen/aerzte`, Zugriff **PRIVATE** |
| 2. Kontakt anlegen oder aktualisieren | Upsert über die E-Mail-Adresse |
| 3. Deal anlegen | Pipeline **Recruiting**, Stage **Bewerbung eingegangen**, Owner **Jenniffer Bauer** |
| 4. Notiz anlegen | An Kontakt und Deal, Lebenslauf als Anhang |

Dateien:

- `app/components/career/DoctorApplicationForm.vue` — Formular
- `server/api/karriere/bewerbung.post.ts` — Validierung, Ablauf
- `server/utils/hubspot.ts` — HubSpot-Aufrufe, Property-Namen, IDs
- `shared/karriere.ts` — Auswahlwerte, die Formular und Route teilen
- `server/api/cron/bewerber-loeschen.get.ts` — täglicher Lösch-Cron (Abschnitt 4)
- `shared/bewerberLoeschung.ts` — welcher Kontakt wie gelöscht wird

### Warum kein HubSpot-Embed-Formular

Das Ticket ließ „einbetten oder per API senden“ offen. Gegen das Embed sprach:
Es bringt eigenes Styling mitten in die Seite, lädt ein Drittanbieter-Script
vor dem Consent-Banner, und `career_apply` müsste über den HubSpot-Callback
laufen statt aus unserem Code. Mit der API liegt alles davon bei uns.

### Warum keine eigene Pipeline „Bewerber Arzt“

Das Ticket fordert eine eigene Pipeline. Die **Recruiting**-Pipeline gibt es
aber schon, mit genau den passenden Stages (Bewerbung eingegangen → Kontaktiert
→ Erstgespräch → Hospitation → Angebot → Eingestellt / Absage). Eine zweite
Pipeline daneben wäre Doppelpflege und würde Bewerbungen auf zwei Boards
verteilen. Dass es eine **Arzt**-Bewerbung ist, steht am Deal-Namen
(`Bewerbung Arzt — Vorname Nachname`) und am Kontakt in `bewerbung_quelle`.

Wenn eine eigene Pipeline doch gewünscht ist: `HUBSPOT_RECRUITING_PIPELINE_ID`
und `HUBSPOT_RECRUITING_STAGE_ID` setzen, mehr braucht es im Code nicht.

## 1. Private App anlegen

HubSpot → Einstellungen → Integrationen → Private Apps → *Create a private app*.

Scopes:

- `crm.objects.contacts.read`, `crm.objects.contacts.write`
- `crm.objects.deals.read`, `crm.objects.deals.write`
- `crm.objects.notes.read`, `crm.objects.notes.write` (in der UI: *CRM → Notes*)
- `files` (Lese- und Schreibrecht)

Die Lese-Scopes für Deals und Notizen braucht der Lösch-Cron.

Das Token danach in Vercel hinterlegen (Production **und** Preview) — mit
`NUXT_`-Präfix, damit es zur Laufzeit gelesen wird und nicht beim Build ins
Bundle wandert:

```
NUXT_HUBSPOT_PRIVATE_APP_TOKEN=pat-eu1-…
```

Optional, nur wenn nicht ins Produktiv-Portal geschrieben werden soll:

```
NUXT_HUBSPOT_RECRUITING_PIPELINE_ID=…   # Default 3858382020 (Recruiting)
NUXT_HUBSPOT_RECRUITING_STAGE_ID=…      # Default 5463910623 (Bewerbung eingegangen)
NUXT_HUBSPOT_PORTAL_ID=…                # Default 148248537
NUXT_HUBSPOT_UI_DOMAIN=…                # Default app-eu1.hubspot.com
NUXT_HUBSPOT_RECRUITING_OWNER_ID=…      # Default 39148340 (Jenniffer Bauer)
```

Für den Lösch-Cron zusätzlich in Vercel (nur Production reicht, Crons laufen
nur dort):

```
CRON_SECRET=<zufälliger String, mind. 16 Zeichen>
```

Vercel schickt ihn als `Authorization: Bearer …` mit. Ohne `CRON_SECRET`
antwortet die Route mit 500 und löscht nichts.

## 2. Kontakt-Properties anlegen

Einstellungen → Objekte → Kontakte → Eigenschaften verwalten. Gruppe frei
wählbar (Vorschlag: „Bewerbung“). **Die internen Namen müssen exakt so
lauten** — sonst antwortet HubSpot mit „Property … does not exist“. Wer sie
anders benennen will, ändert `HUBSPOT_APPLICANT_PROPERTIES` in
`server/utils/hubspot.ts` mit.

| Interner Name | Label | Feldtyp |
| --- | --- | --- |
| `bewerbung_ausbildungsstand` | Ausbildungsstand | Dropdown (Optionen unten) |
| `bewerbung_wunschstandort` | Wunschstandort | Einzeiliger Text |
| `bewerbung_cv_url` | Lebenslauf (Link) | Einzeiliger Text |
| `bewerbung_cv_dateiname` | Lebenslauf (Dateiname) | Einzeiliger Text |
| `bewerbung_eingegangen_am` | Bewerbung eingegangen am | Datum |
| `bewerbung_loeschdatum` | Bewerberdaten löschen am | Datum |
| `bewerbung_datenschutz_zugestimmt_am` | Datenschutz zugestimmt am | Datum |
| `bewerbung_quelle` | Bewerbungsquelle | Einzeiliger Text |

Optionen für `bewerbung_ausbildungsstand` — **interner Wert** links, Label
rechts, beides aus `shared/karriere.ts`:

| Wert | Label |
| --- | --- |
| `in_weiterbildung` | In Facharztweiterbildung |
| `facharzt` | Facharzt / Fachärztin |
| `approbiert_ohne_weiterbildung` | Approbiert, noch keine Weiterbildung begonnen |
| `im_studium` | Noch im Studium / Praktisches Jahr |
| `sonstiges` | Sonstiges |

Der Wunschstandort ist bewusst ein Textfeld: Die Auswahl im Formular kommt aus
Strapi, damit eine neue Lounge nicht in zwei Systemen nachgepflegt werden muss.
Ein Dropdown in HubSpot würde bei jeder Eröffnung brechen.

`lifecyclestage` wird absichtlich **nicht** gesetzt. Eine bestehende Kundin,
die sich bewirbt, soll im CRM nicht vom Kunden zum Lead zurückgestuft werden —
dass es eine Bewerbung ist, trägt der Deal.

Stand 19.10.2026: Alle acht Properties sind angelegt und gegen den Code
geprüft.

## 3. Benachrichtigung an Jenny

Laut FAQ der Karriereseite ist das **Jenniffer Bauer aus dem Recruiting**,
Owner-ID `39148340`.

Das Portal hat **kein HubSpot Professional**, unter *Automatisierung →
Workflows* steht nur die Upgrade-Seite. Ein Workflow, auch ein
kontaktbasierter, geht also nicht. Stattdessen setzt der Code beim Anlegen des
Deals `hubspot_owner_id` auf Jenniffer. HubSpot benachrichtigt Owner bei einer
Zuweisung von sich aus. Ob das als Mail ankommt, hängt an ihren
Benachrichtigungs-Einstellungen (*Einstellungen → Benachrichtigungen →
CRM → Zuweisungen*), das prüft die Abnahme.

Wechselt das Recruiting, ändert man `NUXT_HUBSPOT_RECRUITING_OWNER_ID` in
Vercel, nicht den Code.

## 4. Löschfrist: 6 Monate

Der Code schreibt bei jeder Bewerbung `bewerbung_loeschdatum` = Eingang +
6 Monate. Gelöscht wird von `GET /api/cron/bewerber-loeschen`. Vercel ruft die
Route täglich um 04:00 UTC auf (`vercel.json` → `crons`).

Für jeden Kontakt mit erreichtem Löschdatum (max. 50 pro Lauf):

| Lage | Was passiert |
| --- | --- |
| Alle Recruiting-Deals in **Bewerbung eingegangen** oder **Absage** (oder keiner) | Lebenslauf im File Manager, Bewerbungsnotizen, Recruiting-Deals **und der Kontakt** werden gelöscht |
| Wie oben, aber der Kontakt ist Kundin (`lifecyclestage` customer/evangelist) oder hat Deals in anderen Pipelines | Lebenslauf, Notizen und Recruiting-Deals werden gelöscht, die `bewerbung_*`-Felder geleert, **der Kontakt bleibt** |
| Ein Recruiting-Deal in einer anderen Stage (Erstgespräch, Bewerberpool, Eingestellt, …) | **Nichts**. Der Prozess läuft noch, der Kontakt wird morgen wieder geprüft |

Der Lebenslauf wird gezielt gelöscht. Er hängt an keinem CRM-Objekt und würde
beim Löschen des Kontakts sonst im File Manager liegen bleiben.

Gelöscht wird über die normale CRM-API. Kontakte und Deals liegen danach
90 Tage im HubSpot-Papierkorb. Die GDPR-Löschung von HubSpot nimmt der Cron
bewusst nicht: Sie setzt die E-Mail-Adresse auf eine Sperrliste, und eine
erneute Bewerbung würde dann scheitern.

Wer im Bewerberpool bleiben soll, muss in die Stage *Derzeit kein Bedarf –
Bewerberpool*. Ob das über sechs Monate hinaus eine eigene Einwilligung
braucht, entscheidet das Recruiting.

Prüfen ohne zu löschen:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "https://www.myhealthandbeauty.com/api/cron/bewerber-loeschen?dryRun=1"
```

Die Antwort enthält nur Kontakt-IDs und Entscheidungen, keine Namen.

## 5. Abnahme

1. Auf `/karriere/aerzte` bis zum Formular scrollen, alle Felder ausfüllen,
   eine PDF hochladen, absenden.
2. HubSpot → Kontakte: Kontakt existiert, alle acht Properties gefüllt.
3. HubSpot → Deals → Recruiting: Deal „Bewerbung Arzt — …“ in der Stage
   „Bewerbung eingegangen“, mit dem Kontakt verknüpft.
4. Im Deal: Notiz mit allen Feldern, Lebenslauf als Anhang, öffnet sich.
5. Der Deal hat Jenniffer Bauer als Owner, und sie hat die Zuweisung bekommen.
6. GA4 → Echtzeit: Event `career_apply` mit `event_category = conversion` und
   `job_type = arzt`. Der Test-Kontakt wird danach in HubSpot gelöscht.

## Bekannte Grenzen

- **4 MB** Obergrenze für den Lebenslauf. Vercel deckelt Request-Bodies bei
  4,5 MB — größer geht ohne direkten Upload zu HubSpot nicht.
- Der Lebenslauf ist **Pflichtfeld**. Umstellbar über `CV_PFLICHT` in
  `server/api/karriere/bewerbung.post.ts`.
- Gegen Bots steht nur ein Honeypot. Kommt Spam durch, wäre ein Rate-Limit
  pro IP der nächste Schritt.
- Kein Workflow: Das Portal hat kein Professional (Stand 19.10.2026). Mit
  einem Upgrade könnten Benachrichtigung und Löschfrist zurück nach HubSpot.
- Die CTA-Buttons auf der Seite zeigen weiterhin auf
  `recruiting.myhealthandbeauty.com/docs1/`. Sie sind Strapi-Inhalt und
  gehören auf `#bewerbung` umgestellt — Strapi → `pages` → Slug
  `karriere-aerzte`, Blöcke „landing-hero“, „process-steps“ und „final-cta“.
