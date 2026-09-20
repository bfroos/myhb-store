# Bewerbungsformular Ärzte → HubSpot

Ticket: [bfroos/myhb-store#102](https://github.com/bfroos/myhb-store/issues/102) ·
Epic E6 ([#103](https://github.com/bfroos/myhb-store/issues/103)) · Stand: 19.09.2026

Das Formular steht am Ende von `/karriere/aerzte` (Anker `#bewerbung`). Der
Code ist fertig und deployt — **ohne die Handarbeit im HubSpot-Portal unten
läuft er aber ins Leere**: Ohne Private-App-Token antwortet die Route mit 500,
ohne die Properties mit 502.

## Was der Code tut

| Schritt | Wohin in HubSpot |
| --- | --- |
| 1. Lebenslauf hochladen | File Manager, Ordner `/bewerbungen/aerzte`, Zugriff **PRIVATE** |
| 2. Kontakt anlegen oder aktualisieren | Upsert über die E-Mail-Adresse |
| 3. Deal anlegen | Pipeline **Recruiting**, Stage **Bewerbung eingegangen** |
| 4. Notiz anlegen | An Kontakt und Deal, Lebenslauf als Anhang |

Dateien:

- `app/components/career/DoctorApplicationForm.vue` — Formular
- `server/api/karriere/bewerbung.post.ts` — Validierung, Ablauf
- `server/utils/hubspot.ts` — HubSpot-Aufrufe, Property-Namen, IDs
- `shared/karriere.ts` — Auswahlwerte, die Formular und Route teilen

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
- `crm.objects.deals.write`
- `crm.objects.notes.write` (in der UI: *CRM → Notes*)
- `files` (Lese- und Schreibrecht)

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
```

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

## 3. Benachrichtigung an Jenny

Laut FAQ der Karriereseite ist das **Jenniffer Bauer aus dem Recruiting**. Sie
ist im Portal 148248537 aktuell **kein Owner** — erster Schritt ist also,
sie als HubSpot-Nutzerin anzulegen.

Workflow: Einstellungen → Automatisierung → Workflows → *Deal-based*.

- **Trigger:** Deal wurde erstellt **und** Pipeline = Recruiting **und**
  Deal-Stage = Bewerbung eingegangen
- **Aktion 1:** *Send internal email notification* an Jenniffer Bauer.
  Im Text den Deal-Namen und die Kontakt-Properties `bewerbung_ausbildungsstand`,
  `bewerbung_wunschstandort` und `bewerbung_cv_url` verlinken.
- **Aktion 2 (empfohlen):** Deal-Owner auf Jenniffer Bauer setzen, damit die
  Bewerbung auch im Board eine zuständige Person hat.

Die Benachrichtigung gehört bewusst nach HubSpot und nicht in den Code: Wer
benachrichtigt wird, ändert sich mit dem Team, nicht mit dem Deploy.

> Deal-basierte Workflows brauchen mindestens Sales Hub Professional. Falls das
> Portal das nicht hat: kontaktbasierter Workflow auf
> `bewerbung_eingegangen_am ist bekannt` als Ersatz.

## 4. Löschfrist: 6 Monate

Der Code schreibt bei jeder Bewerbung `bewerbung_loeschdatum` = Eingang +
6 Monate. Gelöscht wird dadurch noch nichts — das braucht einen zweiten
Workflow:

- **Trigger:** `bewerbung_loeschdatum` ist heute (kontaktbasiert, täglich)
- **Aktion:** Kontakt löschen (DSGVO-Löschung), damit auch die zugehörige
  Notiz mit dem Lebenslauf verschwindet

Was der Workflow **nicht** mitnimmt: die Datei im File Manager. Die muss bis
auf Weiteres manuell aus `/bewerbungen/aerzte` gelöscht werden — am besten als
wiederkehrende Aufgabe, halbjährlich.

Bewerbungen, die im Prozess weiterlaufen, dürfen nicht nach sechs Monaten
verschwinden. Beim Wechsel der Deal-Stage weg von „Bewerbung eingegangen“
gehört das Löschdatum entweder verlängert oder der Kontakt aus dem
Lösch-Workflow ausgenommen. Das ist eine Entscheidung fürs Recruiting, keine
technische.

## 5. Abnahme

1. Auf `/karriere/aerzte` bis zum Formular scrollen, alle Felder ausfüllen,
   eine PDF hochladen, absenden.
2. HubSpot → Kontakte: Kontakt existiert, alle acht Properties gefüllt.
3. HubSpot → Deals → Recruiting: Deal „Bewerbung Arzt — …“ in der Stage
   „Bewerbung eingegangen“, mit dem Kontakt verknüpft.
4. Im Deal: Notiz mit allen Feldern, Lebenslauf als Anhang, öffnet sich.
5. Jenny hat die Mail.
6. GA4 → Echtzeit: Event `career_apply` mit `event_category = conversion` und
   `job_type = arzt`. Der Test-Kontakt wird danach in HubSpot gelöscht.

## Bekannte Grenzen

- **4 MB** Obergrenze für den Lebenslauf. Vercel deckelt Request-Bodies bei
  4,5 MB — größer geht ohne direkten Upload zu HubSpot nicht.
- Der Lebenslauf ist **Pflichtfeld**. Umstellbar über `CV_PFLICHT` in
  `server/api/karriere/bewerbung.post.ts`.
- Gegen Bots steht nur ein Honeypot. Kommt Spam durch, wäre ein Rate-Limit
  pro IP der nächste Schritt.
- Die CTA-Buttons auf der Seite zeigen weiterhin auf
  `recruiting.myhealthandbeauty.com/docs1/`. Sie sind Strapi-Inhalt und
  gehören auf `#bewerbung` umgestellt — Strapi → `pages` → Slug
  `karriere-aerzte`, Blöcke „landing-hero“, „process-steps“ und „final-cta“.
