# Karriere-Landingpage Ärzte — Seitenstruktur und Texte

Ticket: bfroos/myhb-store#101 · Epic E6 (#103) · Stand: 11.09.2026

> **Status: Entwurf in Strapi, nicht veröffentlicht.** Die Seite ist als
> Draft-Eintrag `karriere-aerzte` (documentId `zsv06zditubao6x2mbrvfa9w`) mit
> allen 13 Blöcken befüllt und über die Strapi-Live-Preview ansehbar (siehe
> `STRAPI_PREVIEW_SETUP.md`). Sie geht erst live, wenn Hessam und Rihem die
> Texte freigegeben haben — und bis dahin ist `excludeFromSitemap` gesetzt.

## Quelle der Inhalte

`Ausbildungskonzept_Aerzte-2.pptx` von Rihem Mikhail (10 Folien, Mail „Fwd:
Präsentation" vom 12.08.2026). Folie 1 kennzeichnet das Deck als **interne
Präsentation für ein Management-Review** — die Zahlen daraus stehen in dieser
Seite jetzt öffentlich lesbar. Das ist eine bewusste Umsetzung des Tickets
(„Verdienst/Provision"), aber eine Entscheidung, die Hessam und Rihem explizit
bestätigen müssen (siehe „Offene Punkte", Punkt 1 und 2).

Ergänzend verwendet: die bestehende Stellenanzeige `arzt-aerztin-mwd`
(Approbation als Voraussetzung, Recruiting-Ziel, Recruiterin Jenniffer Bauer)
und die acht Lounge-Standorte aus deren Location-Relation.

## Zielgruppe und Kanal

Aus der Mail:

- **Ärztinnen und Ärzte in der Facharztweiterbildung**, vorzugsweise aus dem
  Krankenhaus.
- **Nicht** die Zielgruppe: fertige Fachärzt:innen, frisch Approbierte.
- **Hauptkanal: Social Media**, mit Link auf diese Seite. Die Seite ist eine
  Landingpage für kalten Social-Traffic, keine Unterseite, auf die man sich
  durchklickt: sie beantwortet in den ersten zwei Bildschirmhöhen, wer gesucht
  wird und was geboten wird.
- **Ansprache: Du-Form** (Kunden und Bewerber werden geduzt, Staff gesiezt).

Die Abgrenzung der Zielgruppe steht deshalb sichtbar als zweiter Abschnitt auf
der Seite und nicht nur im Targeting — sonst bewerben sich Fachärzt:innen und
frisch Approbierte.

## Aufbau der Seite (13 Blöcke, wie in Strapi gepflegt)

Die Reihenfolge folgt der Frage-Reihenfolge der Zielgruppe: *Bin ich gemeint? →
Was lerne ich? → Wohin führt das? → Was verdiene ich? → Wie bewerbe ich mich?*

| # | Block | Abschnitt | Inhalt aus |
|---|---|---|---|
| 1 | `blocks.landing-hero` | Hero: „In drei Jahren zum Aesthetic Medical Expert" + 4 Checks + CTA | Folie 1, 2, 8, 9 |
| 2 | `blocks.quick-info` | „Ist das der richtige Weg für dich?" — Zielgruppe ein- und ausgrenzen | Mail + Stellenanzeige |
| 3 | `blocks.process-steps` | „Drei Jahre, drei Entwicklungsstufen" | Folie 2 |
| 4 | `blocks.text-content` | „Jeder Kurs: Inhalt, Ziel, Zertifikat" | Folie 3 |
| 5 | `blocks.text-content` | „Vor jedem Praxiskurs bereitest du dich online vor" | Folie 4 |
| 6 | `blocks.benefit-grid` | Hersteller-Schulungen, Zertifikate, Masterclasses, Technik | Folie 5, 6 |
| 7 | `blocks.process-steps` | „Dein Weg nach der Ausbildung" (Expert → Facharzt → Oberarzt) | Folie 7 |
| 8 | `blocks.text-content` | „Was du verdienst" — Fixum und Provisionsstaffel | Folie 8 |
| 9 | `blocks.text-content` | „Weniger Stunden, mehr Urlaub — Jahr für Jahr" | Folie 9 |
| 10 | `blocks.benefit-grid` | Zusatzleistungen (6 Benefits) | Folie 10 |
| 11 | `blocks.text-content` | „Wo du arbeitest" — acht Lounges, zweispaltig | Stellenanzeige |
| 12 | `blocks.faq-accordion` | 7 Fragen (Facharzt, Kosten, Vorerfahrung, Ablauf, Gehalt, Arbeitszeit, Ansprechpartnerin) | abgeleitet |
| 13 | `blocks.final-cta` | „Bewirb dich jetzt" | — |

### Was bewusst noch fehlt

- **Bilder.** Hero (`imageMedia`) und die Schritt-Bilder der `process-steps`
  sind leer. Ohne Bild funktioniert der Hero, aber für Social-Traffic ist ein
  Bild Pflicht.
- **Icons.** `quick-info` und `benefit-grid` rendern die Icons nur, wenn sie
  gesetzt sind. Die Auswahl gehört in den Iconhub-Picker in Strapi und in die
  Hand der Redaktion, nicht in einen API-Call.
- **Videos** (aus der Mail gefordert): existieren noch nicht. Sobald produziert,
  kommen sie als `blocks.stories` (Hochformat, passend zur Social-Herkunft) oder
  `blocks.youtube-video` dazu.
- **Meinungen** (aus der Mail gefordert): Zitate und Freigaben von Ärzt:innen,
  die heute schon da sind. Block dafür: `blocks.employee-list` oder
  `blocks.reviews`.
- **Standorte als Karte:** `blocks.location-teasers` ist **nicht** in der
  Dynamic Zone der `pages`-Collection freigegeben. Die Standorte stehen deshalb
  als Liste in Block 11. Wenn eine Karte gewünscht ist, geht das über
  `blocks.location-map` — oder der Block muss in Strapi für `pages` freigegeben
  werden.
- **Lokalisierungen.** Nur `de` ist gepflegt. Die Sprachpfade stehen in
  `nuxt.config.ts`, die Übersetzungen fehlen.

### Zum CTA

Primär- und Final-CTA zeigen beide auf
`https://recruiting.myhealthandbeauty.com/docs1/`, das bestehende Ziel der
Arzt-Stellenanzeige. Das ist eine **Übergangslösung**: Das Bewerbungsformular
mit HubSpot-Pipeline und Benachrichtigung an Jenny ist **#102** und ersetzt
dieses Ziel dort.

## Technische Umsetzung

- Route: `app/pages/karriere/aerzte.vue` → `/karriere/aerzte`
- Inhalte: Strapi-Collection `pages`, Eintrag mit Slug `karriere-aerzte`.
  Redaktion pflegt Blöcke, Texte, Bilder und SEO ohne Deploy.
- SEO: `metaTitle` und `metaDescription` sind gesetzt. `excludeFromSitemap` ist
  **bewusst auf `true`**, solange die Texte nicht freigegeben sind.
- Sprachpfade in `nuxt.config.ts`: `/en/careers/doctors`,
  `/tr/kariyer/doktorlar`, `/ar/masar-mihani/atibba`, `/fr/carrieres/medecins`,
  `/nl/carriere/artsen`.
- ISR: von der bestehenden Regel `/karriere/**` (12 h) abgedeckt.
- Solange der Eintrag unveröffentlicht ist, liefert die Route sauber 404.

**Noch offen:** Eintrag in `server/routes/sitemap.xml.ts` (`ROUTE_MAP` und
`staticRoutes`). Kommt erst mit der Veröffentlichung, zusammen mit
`excludeFromSitemap: false` — sonst steht eine 404-URL in der Sitemap.

## Offene Punkte — vor der Veröffentlichung zu klären

1. **Dürfen die Gehaltszahlen öffentlich stehen?** Fixum (4.000 € / 5.000 €
   netto), die Provisionsstaffel (4/8/12/15 %) und „8.000–10.000 € brutto"
   stammen aus einem als intern gekennzeichneten Management-Deck. Das Ticket
   fordert „Verdienst/Provision" auf der Seite, deshalb stehen sie drin — die
   Entscheidung, sie öffentlich zu machen, liegt aber bei Hessam und Rihem.

2. **Netto-Fixum als öffentliche Zusage.** Folie 8 nennt das Fixum netto, die
   Gesamtsumme brutto. Öffentlich nebeneinander gestellt ist das
   erklärungsbedürftig, und eine Nettolohnzusage in einer Stellenausschreibung
   ist arbeitsrechtlich heikel. Bitte gegenprüfen lassen, ob die Angabe so
   stehen bleiben soll oder in brutto umgerechnet wird.

3. **Widerspruch zwischen Mail und Präsentation bei der Zielgruppe.** Die Mail
   sucht Ärzt:innen, die **bereits in der Facharztweiterbildung** stehen. Folie
   7 beschreibt den Weg dagegen als: erst drei Jahre Ausbildung, **danach**
   Start der Facharztausbildung. Folie 8 wiederum nennt ein „Start-Fixum zu
   Beginn der Facharztausbildung" und eine Erhöhung „nach Abschluss der
   dreijährigen Ausbildung" — was nur aufgeht, wenn beides parallel läuft. Die
   Seite ist so geschrieben, dass sie keine der Lesarten ausschließt. Für die
   Freigabe muss geklärt werden, was tatsächlich gilt: **Ausbildung vor oder
   parallel zur Facharztweiterbildung?**

4. **„Nicht gesucht: fertige Fachärzt:innen"** steht so auf der Seite, weil die
   Mail es so vorgibt. Wenn Fachärzt:innen trotzdem willkommen sind, muss
   Block 2 angepasst werden.

5. **Freigabe der Texte durch Hessam und Rihem** — das Akzeptanzkriterium des
   Tickets.
