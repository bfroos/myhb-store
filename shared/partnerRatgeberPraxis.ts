/**
 * Ratgeber zweiter Teil: die eigene Praxis fuehren (E32, bfroos/myhb-store#435).
 *
 * Warum diese Themen (Sistrix, Suchen pro Monat in DE, 12.11.2026):
 * ki telefonassistent 1.250 (… arztpraxis 100, telefonassistent arztpraxis 70),
 * praxisbedarf 1.150 (… bestellen 60), praxismarketing 1.050 (marketing
 * arztpraxis 80, patientengewinnung 30), praxissoftware 900, online
 * terminbuchung 350 (online terminvergabe 150), praxisorganisation 150,
 * lagerverwaltung arztpraxis 100, mfa finden 100, ki in der arztpraxis 90
 * (ki arztpraxis 80, digitale arztpraxis 50).
 *
 * Jede Seite erklaert das Thema allgemein und ehrlich und zeigt am Ende, wie es
 * bei MYHB laeuft. Nichts versprechen, was noch nicht laeuft: Die Stueckware im
 * Lager startet erst am 01.12.2026, automatische Nachbestellung ist ein Ticket
 * (myhb-os#2213), Einkauf von Arzneimitteln ist rechtlich offen (myhb-os#2211).
 */
import type { RatgeberArtikel } from "./partnerRatgeber.ts";

export const RATGEBER_PRAXIS: RatgeberArtikel[] = [
  {
    slug: "ki-telefonassistent-arztpraxis",
    gruppe: "fuehren",
    geaendert: "2026-11-12",
    kurz: "KI-Telefonassistent",
    h1: "KI-Telefonassistent für die Arztpraxis: Was er kann und worauf du achten musst",
    seoTitel: "KI-Telefonassistent für die Arztpraxis | MY",
    beschreibung:
      "Ein KI-Telefonassistent nimmt jeden Anruf an, beantwortet Fragen und bucht Termine. Was er in der Praxis leistet, was er kostet und was der Datenschutz fordert.",
    einleitung:
      "Das Telefon ist in vielen Praxen der größte Engpass: Am Empfang steht ein Kunde, gleichzeitig klingelt es, und wer nicht durchkommt, ruft beim Nächsten an. Ein KI-Telefonassistent nimmt diese Anrufe an. Hier steht, was er heute wirklich kann.",
    kurzGesagt:
      "Ein KI-Telefonassistent ist eine Software, die Anrufe in natürlicher Sprache annimmt. Er beantwortet Standardfragen zu Öffnungszeiten, Preisen und Behandlungen, bucht, verschiebt und storniert Termine im Kalender und leitet alles andere an dein Team weiter. Abgerechnet wird meist eine feste Monatspauschale plus Minuten. Wichtig sind ein Auftragsverarbeitungsvertrag, Server in der EU und der Hinweis am Anfang des Gesprächs, dass eine KI spricht.",
    abschnitte: [
      {
        titel: "Was ein KI-Telefonassistent in der Praxis übernimmt",
        liste: [
          "Jeden Anruf annehmen, auch wenn drei gleichzeitig kommen, abends und am Wochenende.",
          "Fragen beantworten: Öffnungszeiten, Anfahrt, Preise, Ablauf einer Behandlung, Vorbereitung.",
          "Termine buchen, verschieben und absagen, direkt im Praxiskalender.",
          "Rückrufwünsche aufnehmen und mit Zusammenfassung an den Empfang geben.",
          "Bei medizinischen Fragen und Beschwerden an einen Menschen übergeben. Diagnosen stellt die KI nicht.",
        ],
      },
      {
        titel: "Was er nicht kann",
        absaetze: [
          "Ein KI-Telefonassistent ersetzt keine ärztliche Beratung. Fragen zu Nebenwirkungen, Vorerkrankungen oder Komplikationen gehören zum Arzt. Ein guter Assistent erkennt solche Gespräche und gibt sie weiter, statt zu raten.",
          "Er ist auch nur so gut wie sein Wissen. Ändern sich Preise oder Öffnungszeiten, musst du sie dort genauso pflegen wie auf der Website. Sonst nennt die KI am Telefon alte Zahlen.",
        ],
      },
      {
        titel: "Datenschutz und Recht: die Pflichtpunkte",
        tabelle: [
          ["Punkt", "Was du brauchst"],
          ["Auftragsverarbeitung", "Einen Vertrag nach Art. 28 DSGVO mit dem Anbieter. Er verarbeitet Gesundheitsdaten in deinem Auftrag."],
          ["Serverstandort", "Am besten in der EU. Bei Übermittlung in Drittländer brauchst du zusätzliche Garantien."],
          ["KI-Hinweis", "Wer mit einer KI spricht, muss das wissen (Art. 50 KI-Verordnung). Ein Satz in der Begrüßung reicht."],
          ["Aufzeichnung", "Werden Gespräche aufgezeichnet, gehört auch das in die Begrüßung. Lege fest, wie lange Aufnahmen gespeichert bleiben."],
          ["Schweigepflicht", "Der Anbieter muss zur Verschwiegenheit verpflichtet sein (§ 203 StGB erlaubt mitwirkende Dienstleister nur unter dieser Bedingung)."],
        ],
      },
      {
        titel: "Worauf du bei der Auswahl achten solltest",
        liste: [
          "Anbindung an deinen Kalender: Bucht der Assistent echte Termine oder schreibt er nur eine Notiz?",
          "Mehrere Terminarten: Erkennt er, ob jemand eine Beratung oder eine Behandlung will, und bucht die passende Dauer?",
          "Übergabe an Menschen: Wie schnell kommt ein Anrufer zu deinem Team, wenn er das möchte?",
          "Abrechnung: Monatspauschale, Minutenpreis, Mindestlaufzeit. Lass dir eine Rechnung für deine geschätzte Anrufzahl geben.",
          "Auswertung: Siehst du, wie viele Anrufe kamen, wie viele Termine gebucht wurden und wo die KI abgegeben hat?",
        ],
      },
      {
        titel: "So läuft es bei MY HEALTH & BEAUTY",
        absaetze: [
          "An unseren Standorten nimmt die MY-Telefonassistenz die Anrufe an, zusammen rund 2.000 Gespräche im Monat (Stand September 2026). Sie kennt Behandlungen, Preise und Öffnungszeiten des Standorts, bucht Termine direkt in unserer Software und gibt medizinische Fragen an das Team weiter.",
          "Als Partnerpraxis bekommst du die Telefonassistenz fertig eingerichtet mit deinem Standort. Die Minuten siehst du einzeln auf deiner Abrechnung.",
        ],
      },
    ],
    fragen: [
      {
        frage: "Was kostet ein KI-Telefonassistent für die Arztpraxis?",
        antwort:
          "Die meisten Anbieter verlangen eine feste Monatspauschale und dazu einen Preis pro Gesprächsminute. Was es dich kostet, hängt also von der Zahl der Anrufe ab. Vergleiche die Angebote mit deiner echten Anrufzahl, nicht mit dem Einstiegspreis.",
      },
      {
        frage: "Merken die Anrufer, dass sie mit einer KI sprechen?",
        antwort:
          "Sie müssen es sogar erfahren: Nach Art. 50 der KI-Verordnung ist ein Hinweis am Anfang des Gesprächs Pflicht. Die meisten Anrufer stört das nicht, solange sie schnell einen Termin bekommen.",
      },
      {
        frage: "Darf eine KI am Telefon Gesundheitsdaten aufnehmen?",
        antwort:
          "Ja, wenn du mit dem Anbieter einen Auftragsverarbeitungsvertrag hast, er zur Verschwiegenheit verpflichtet ist und die Daten sicher verarbeitet. Medizinische Beratung bleibt beim Arzt.",
      },
      {
        frage: "Ersetzt der KI-Telefonassistent meinen Empfang?",
        antwort:
          "Nein. Er nimmt dem Empfang die Standardanrufe ab. Dein Team hat dadurch mehr Zeit für die Kunden, die gerade in der Praxis sind.",
      },
    ],
    quellen: [
      { titel: "KI-Verordnung (EU) 2024/1689, Art. 50: Transparenzpflichten", url: "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32024R1689" },
      { titel: "§ 203 StGB: Verletzung von Privatgeheimnissen", url: "https://www.gesetze-im-internet.de/stgb/__203.html" },
      { titel: "Art. 28 DSGVO: Auftragsverarbeiter", url: "https://dsgvo-gesetz.de/art-28-dsgvo/" },
    ],
  },
  {
    slug: "online-terminbuchung-praxis",
    gruppe: "fuehren",
    geaendert: "2026-11-12",
    kurz: "Online-Terminbuchung",
    h1: "Online-Terminbuchung für die Praxis: So buchen Kunden selbst und kommen auch",
    seoTitel: "Online-Terminbuchung für die Arztpraxis | MY",
    beschreibung:
      "Mit Online-Terminbuchung buchen Kunden rund um die Uhr selbst. Was ein gutes System können muss und wie Erinnerungen Terminausfälle senken.",
    einleitung:
      "Viele Kunden buchen abends auf dem Sofa, nicht während deiner Öffnungszeiten. Wer dann nur eine Telefonnummer findet, bucht woanders. Eine Online-Terminbuchung holt diese Kunden ab. Hier steht, worauf es ankommt.",
    kurzGesagt:
      "Bei der Online-Terminbuchung wählen Kunden Behandlung, Standort und freie Zeit selbst, auf deiner Website oder in einer App. Das entlastet das Telefon und bringt Buchungen außerhalb der Öffnungszeiten. Damit gebuchte Termine auch stattfinden, braucht das System automatische Bestätigungen und Erinnerungen. Für die ästhetische Medizin sollte es Behandlungen mit unterschiedlicher Dauer und einen Fragebogen vor dem Termin können.",
    abschnitte: [
      {
        titel: "Was eine gute Online-Terminbuchung können muss",
        liste: [
          "Echte freie Zeiten aus deinem Kalender zeigen, nicht nur eine Terminanfrage.",
          "Unterschiedliche Dauer je Behandlung: Eine Botox-Behandlung braucht weniger Zeit als eine Erstberatung mit Filler.",
          "Mehrere Behandler und Räume berücksichtigen, damit nichts doppelt belegt wird.",
          "Bestätigung sofort und Erinnerung vor dem Termin, per SMS, WhatsApp oder Mail.",
          "Verschieben und Absagen durch den Kunden selbst, damit frei werdende Zeiten wieder buchbar sind.",
          "Fragebogen vor dem Termin: Vorerkrankungen, Medikamente und Einwilligung schon zu Hause ausfüllen.",
        ],
      },
      {
        titel: "Warum Termine ausfallen und was hilft",
        absaetze: [
          "Je nach Praxis erscheinen etwa 5 bis 15 Prozent der Kunden nicht zum Termin. Der häufigste Grund ist schlicht Vergessen. Eine automatische Erinnerung 24 bis 48 Stunden vorher senkt die Ausfälle deutlich, weil Kunden dann rechtzeitig absagen oder verschieben.",
          "Hilfreich ist auch, die Absage einfach zu machen. Wer mit einem Klick absagen kann, tut das eher, als einfach nicht zu kommen. Der frei gewordene Platz lässt sich dann noch vergeben.",
        ],
      },
      {
        titel: "Portal oder eigenes System?",
        tabelle: [
          ["", "Terminportal", "Eigene Buchung auf deiner Website"],
          ["Sichtbarkeit", "Neue Kunden über das Portal", "Kunden kommen über deine Website und Google"],
          ["Kundenbeziehung", "Das Portal steht zwischen dir und dem Kunden", "Kontakt und Daten bleiben bei dir"],
          ["Kosten", "Monatsgebühr, teils pro Buchung", "Software und Pflege der Website"],
          ["Ästhetik-tauglich", "Oft auf Kassenpraxen ausgelegt", "Behandlungen, Preise und Fragebogen nach deinem Angebot"],
        ],
      },
      {
        titel: "So läuft es bei MY HEALTH & BEAUTY",
        absaetze: [
          "Kunden buchen auf myhealthandbeauty.com oder in der Kunden-App: Behandlung wählen, Standort, freie Zeit, fertig. Bestätigung und Erinnerung kommen automatisch, der Fragebogen vor dem Termin auch. Nach der Behandlung erinnert der Behandlungsplan an den nächsten Termin.",
          "Als Partnerpraxis steht dein Standort mit allen Behandlungen und Online-Termin auf unserer Website. Du musst dafür nichts einrichten.",
        ],
      },
    ],
    fragen: [
      {
        frage: "Lohnt sich Online-Terminbuchung für eine kleine Praxis?",
        antwort:
          "Ja, gerade dort. In einer kleinen Praxis gibt es oft niemanden, der nur telefoniert. Jede Buchung, die online passiert, ist ein Anruf weniger während einer Behandlung.",
      },
      {
        frage: "Wie verhindere ich, dass Kunden online buchen und nicht kommen?",
        antwort:
          "Mit automatischer Erinnerung 24 bis 48 Stunden vorher und einer einfachen Möglichkeit, abzusagen. Bei wiederholtem Nichterscheinen kannst du eine Ausfallgebühr vereinbaren, wenn sie vorher klar kommuniziert wurde.",
      },
      {
        frage: "Darf ich eine Ausfallgebühr verlangen?",
        antwort:
          "Grundsätzlich ja, wenn sie vorher vereinbart und angemessen ist und der Kunde rechtzeitig absagen konnte. Lass die Formulierung juristisch prüfen.",
      },
    ],
    quellen: [
      { titel: "ZWP: Terminausfälle und deren wirtschaftliche Auswirkungen", url: "https://www.zwp-online.info/zwpnews/wirtschaft-und-recht/praxismanagement/terminausfaelle-und-deren-wirtschaftliche-auswirkungen" },
      { titel: "zm: So reduzieren Sie Terminausfälle (2026)", url: "https://www.zm-online.de/artikel/2026/zm-2026-08/so-reduzieren-sie-terminausfaelle" },
    ],
  },
  {
    slug: "lagerverwaltung-arztpraxis",
    gruppe: "fuehren",
    geaendert: "2026-11-12",
    kurz: "Lagerverwaltung",
    h1: "Lagerverwaltung in der Arztpraxis: Materialwirtschaft für die ästhetische Praxis",
    seoTitel: "Lagerverwaltung in der Arztpraxis: so geht's | MY",
    beschreibung:
      "Botox, Filler und Verbrauchsmaterial sind teuer und haben ein Verfallsdatum. So behältst du das Lager deiner Praxis im Griff: Wareneingang, Verbrauch, Inventur.",
    einleitung:
      "In der ästhetischen Medizin steckt viel Geld im Kühlschrank. Eine Flasche Botulinumtoxin oder eine Spritze Filler kostet schnell dreistellig. Wer nicht weiß, was da ist, was verbraucht wurde und was bald abläuft, verliert Geld. So baust du eine einfache Materialwirtschaft auf.",
    kurzGesagt:
      "Gute Lagerverwaltung in der Praxis heißt: Jede Lieferung wird beim Eingang erfasst, jeder Verbrauch der Behandlung zugeordnet und regelmäßig gezählt. Was zuerst abläuft, wird zuerst verbraucht. Bei Arzneimitteln und Fillern solltest du die Charge in der Kundenakte festhalten, damit du bei einem Rückruf weißt, wer betroffen ist. Am einfachsten geht das per Barcode-Scan direkt in der Praxissoftware.",
    abschnitte: [
      {
        titel: "Die vier Schritte einer einfachen Materialwirtschaft",
        tabelle: [
          ["Schritt", "Was passiert", "Warum"],
          ["Wareneingang", "Lieferung scannen, Menge, Charge und Verfall erfassen", "Du weißt, was wirklich angekommen ist"],
          ["Verbrauch", "Bei der Behandlung ausbuchen, mit Charge in die Akte", "Verbrauch passt zur Behandlung, Rückrufe sind nachvollziehbar"],
          ["Zählen", "Regelmäßig den Bestand zählen, teure Ware öfter", "Abweichungen fallen früh auf"],
          ["Nachbestellen", "Bei Mindestbestand bestellen", "Kein Termin fällt aus, weil Material fehlt"],
        ],
      },
      {
        titel: "Worauf du in der Ästhetik besonders achten musst",
        liste: [
          "Verfallsdatum: Ware, die zuerst abläuft, zuerst verwenden (FEFO). Abgelaufene Ware darfst du nicht mehr einsetzen.",
          "Kühlkette: Viele Botulinumtoxine müssen gekühlt gelagert werden. Ein Kühlschrank mit Temperaturprotokoll gehört dazu.",
          "Angebrochene Flaschen: Halte fest, wann eine Flasche geöffnet wurde und wie lange sie laut Fachinformation verwendbar ist.",
          "Charge in der Akte: Bei Rückrufen oder Nebenwirkungen musst du schnell sagen können, welcher Kunde welche Charge bekommen hat.",
          "Teure Einzelstücke zählen, Kleinmaterial pauschal: Kanülen und Tupfer stückgenau zu buchen, kostet mehr Zeit, als es bringt.",
        ],
      },
      {
        titel: "Excel oder Software?",
        absaetze: [
          "Für den Anfang reicht eine Liste. Sobald mehrere Ärzte behandeln oder du mehr als eine Handvoll Produkte führst, wird sie unzuverlässig: Niemand trägt den Verbrauch zeitnah ein, und die Zahlen stimmen nie. Eine Lagerverwaltung, die mit Termin und Kundenakte verbunden ist, bucht den Verbrauch dort, wo er entsteht.",
        ],
      },
      {
        titel: "So läuft es bei MY HEALTH & BEAUTY",
        absaetze: [
          "Bei uns gehört das Lager zur Praxissoftware. Ware wird beim Eingang gescannt, der Arzt bucht bei der Behandlung aus, und die Charge landet in der Kundenakte. Abends und bei der Inventur zeigt die Software, wo Soll und Ist auseinanderliegen. Der Scan-Ablauf geht ab Dezember 2026 an unseren Standorten in Betrieb.",
          "Als Partnerpraxis nutzt du dasselbe System von Anfang an.",
        ],
      },
    ],
    fragen: [
      {
        frage: "Muss ich die Charge von Botox und Fillern dokumentieren?",
        antwort:
          "Eine allgemeine Pflicht wie bei Blutprodukten gibt es nicht. Wir empfehlen es trotzdem dringend: Bei einem Rückruf des Herstellers oder einer Nebenwirkung musst du wissen, welcher Kunde betroffen ist.",
      },
      {
        frage: "Wie oft sollte ich Inventur machen?",
        antwort:
          "Einmal im Jahr ist für die Steuer Pflicht. Für teure Ware wie Botulinumtoxin lohnt sich eine kurze Zählung jeden Tag oder jede Woche. Dann fallen Abweichungen auf, solange man sich noch erinnert.",
      },
      {
        frage: "Was mache ich mit abgelaufener Ware?",
        antwort:
          "Aussortieren, als Abgang buchen und fachgerecht entsorgen. Ein Blick auf die Verfallsdaten beim Wareneingang und eine Sortierung nach Verfall verhindern das meiste.",
      },
    ],
    quellen: [
      { titel: "§ 630f BGB: Dokumentation der Behandlung", url: "https://www.gesetze-im-internet.de/bgb/__630f.html" },
      { titel: "§ 240 HGB: Inventar", url: "https://www.gesetze-im-internet.de/hgb/__240.html" },
    ],
  },
  {
    slug: "praxisbedarf-einkauf-aesthetik",
    gruppe: "fuehren",
    geaendert: "2026-11-12",
    kurz: "Praxisbedarf einkaufen",
    h1: "Praxisbedarf für die ästhetische Praxis: Botox, Filler und Material richtig einkaufen",
    seoTitel: "Praxisbedarf für die ästhetische Praxis | MY",
    beschreibung:
      "Wo bekommst du als Arzt Botulinumtoxin, Hyaluron-Filler und Verbrauchsmaterial? Bezugswege, rechtliche Regeln und wie du beim Einkauf Geld sparst.",
    einleitung:
      "Der Einkauf ist in der ästhetischen Medizin einer der größten Kostenblöcke. Gleichzeitig gelten für Arzneimittel strenge Regeln. Hier steht, wo du was bekommst und wie du bessere Preise erreichst.",
    kurzGesagt:
      "Botulinumtoxin ist ein verschreibungspflichtiges Arzneimittel. Als Arzt bekommst du es in der Regel über eine Apotheke, als Praxisbedarf. Hyaluron-Filler sind Medizinprodukte, die kannst du direkt beim Hersteller oder einem Fachhändler kaufen. Verbrauchsmaterial wie Kanülen, Tupfer und Desinfektion gibt es bei Praxisbedarf-Händlern. Gute Preise bekommst du vor allem über Menge: mehrere Praxen, die gemeinsam einkaufen, verhandeln besser.",
    abschnitte: [
      {
        titel: "Was du wo bekommst",
        tabelle: [
          ["Produkt", "Einordnung", "Typischer Bezugsweg"],
          ["Botulinumtoxin", "Verschreibungspflichtiges Arzneimittel", "Apotheke, als Praxisbedarf"],
          ["Hyaluron-Filler", "Medizinprodukt", "Hersteller oder Fachhändler"],
          ["Lokalanästhetika", "Arzneimittel", "Apotheke"],
          ["Kanülen, Spritzen, Tupfer", "Medizinprodukte und Verbrauchsmaterial", "Praxisbedarf-Händler"],
          ["Desinfektion, Hygiene", "Biozide und Medizinprodukte", "Praxisbedarf-Händler"],
        ],
      },
      {
        titel: "Rechtliche Regeln, die du kennen solltest",
        liste: [
          "Arzneimittel dürfen nur auf bestimmten Wegen an Ärzte abgegeben werden (§ 47 Arzneimittelgesetz). Der übliche Weg ist die Apotheke.",
          "Arzneimittel an andere Praxen weiterverkaufen darfst du nicht ohne Großhandelserlaubnis (§ 52a AMG). Das gilt auch, wenn du nur einem befreundeten Kollegen aushelfen willst.",
          "Werbung für verschreibungspflichtige Arzneimittel gegenüber Kunden ist verboten (§ 10 Heilmittelwerbegesetz). Du bewirbst die Behandlung, nicht das Präparat.",
          "Lagerung nach Fachinformation, bei Botulinumtoxin meist gekühlt. Dazu gehört ein Temperaturprotokoll.",
        ],
      },
      {
        titel: "So sparst du beim Einkauf",
        liste: [
          "Weniger Marken: Wer sich auf zwei, drei Produktlinien festlegt, bekommt eher Staffelpreise.",
          "Gemeinsam einkaufen: Einkaufsgemeinschaften oder Verbünde verhandeln für viele Praxen.",
          "Verfall im Blick: Abgelaufene Ware ist der teuerste Einkauf. Bestell lieber öfter kleinere Mengen.",
          "Verbrauch messen: Wenn du weißt, wie viel du pro Behandlung brauchst, bestellst du passend und erkennst Ausreißer.",
        ],
      },
      {
        titel: "So läuft es bei MY HEALTH & BEAUTY",
        absaetze: [
          "Als Partnerpraxis kaufst du zu denselben Konditionen ein wie unsere eigenen Standorte. Bei Arzneimitteln läuft das über die gesetzlich vorgesehenen Wege. Die Lieferungen landen per Scan in unserer Lagerverwaltung, der Verbrauch wird bei der Behandlung gebucht.",
        ],
      },
    ],
    fragen: [
      {
        frage: "Kann ich Botox direkt beim Hersteller bestellen?",
        antwort:
          "In der Regel nicht. Botulinumtoxin ist verschreibungspflichtig und kommt über eine Apotheke zu dir. Die Apotheke bestellt es beim Großhandel oder Hersteller.",
      },
      {
        frage: "Brauche ich für Hyaluron-Filler ein Rezept?",
        antwort:
          "Nein. Hyaluron-Filler sind Medizinprodukte, keine Arzneimittel. Du kaufst sie direkt beim Hersteller oder einem Fachhändler.",
      },
      {
        frage: "Darf ich überzählige Ware an eine andere Praxis verkaufen?",
        antwort:
          "Bei Arzneimitteln nur mit Großhandelserlaubnis. Bei Medizinprodukten und Verbrauchsmaterial ist das einfacher, frag im Zweifel deinen Händler.",
      },
    ],
    quellen: [
      { titel: "§ 47 AMG: Vertriebsweg", url: "https://www.gesetze-im-internet.de/amg_1976/__47.html" },
      { titel: "§ 52a AMG: Großhandel mit Arzneimitteln", url: "https://www.gesetze-im-internet.de/amg_1976/__52a.html" },
      { titel: "§ 10 HWG: Werbung für verschreibungspflichtige Arzneimittel", url: "https://www.gesetze-im-internet.de/heilmwerbg/__10.html" },
    ],
  },
  {
    slug: "ki-in-der-arztpraxis",
    gruppe: "fuehren",
    geaendert: "2026-11-12",
    kurz: "KI in der Arztpraxis",
    h1: "KI in der Arztpraxis: Wo sie heute wirklich hilft",
    seoTitel: "KI in der Arztpraxis: Wo sie wirklich hilft | MY",
    beschreibung:
      "Telefon, Chat, Termine, Doku, Hautanalyse: Wo künstliche Intelligenz in der Praxis heute Arbeit abnimmt, was sie nicht darf und was der Datenschutz verlangt.",
    einleitung:
      "Über KI in der Medizin wird viel geredet. In den meisten Praxen ist sie trotzdem noch nicht angekommen. Hier steht nüchtern, wo KI heute im Praxisalltag hilft, besonders in einer ästhetischen Privatpraxis.",
    kurzGesagt:
      "Laut einer Bitkom-Umfrage von 2025 nutzen erst 15 Prozent der Ärzte in Praxen KI, obwohl 78 Prozent sie als Chance sehen. Am meisten bringt KI heute in der Organisation: Sie nimmt Anrufe an, beantwortet Nachrichten, bucht Termine, fasst Gespräche zusammen und hilft bei der Dokumentation. Die medizinische Entscheidung bleibt beim Arzt. Voraussetzung sind Datenschutz nach DSGVO, Verschwiegenheit des Anbieters und Transparenz gegenüber den Kunden.",
    abschnitte: [
      {
        titel: "Wo KI in der Praxis heute hilft",
        tabelle: [
          ["Aufgabe", "Was die KI macht", "Nutzen"],
          ["Telefon", "Nimmt Anrufe an, beantwortet Fragen, bucht Termine", "Kein Anruf geht verloren, Empfang wird entlastet"],
          ["WhatsApp und Chat", "Beantwortet Nachrichten rund um die Uhr", "Schnelle Antwort auch abends"],
          ["Dokumentation", "Fasst Gespräche zusammen, schlägt Texte vor", "Weniger Schreibarbeit nach der Behandlung"],
          ["Hautanalyse", "Wertet Fotos aus und schlägt Behandlungen vor", "Gute Grundlage für die Beratung"],
          ["Interne Fragen", "Beantwortet Fragen des Teams zur Software", "Weniger Rückfragen beim Chef"],
        ],
      },
      {
        titel: "Was KI nicht darf",
        absaetze: [
          "Die Indikation, die Aufklärung und die Behandlung bleiben ärztliche Aufgaben. Eine KI darf vorschlagen, entscheiden muss der Arzt. Das gilt auch für die Hautanalyse: Sie ist eine Hilfe für das Beratungsgespräch, keine Diagnose.",
        ],
      },
      {
        titel: "Datenschutz und KI-Verordnung",
        liste: [
          "Auftragsverarbeitungsvertrag mit jedem Anbieter, der Kundendaten verarbeitet (Art. 28 DSGVO).",
          "Verschwiegenheitsverpflichtung des Anbieters (§ 203 StGB).",
          "Transparenz: Kunden müssen erkennen, wenn sie mit einer KI sprechen oder schreiben (Art. 50 KI-Verordnung).",
          "Keine Kundendaten in frei zugängliche Chatbots kopieren. Dafür gibt es Versionen mit Vertrag und Datenschutz.",
        ],
      },
      {
        titel: "So läuft es bei MY HEALTH & BEAUTY",
        absaetze: [
          "Bei uns arbeitet KI dort, wo sie Zeit spart: Die MY-Telefonassistenz nimmt Anrufe an, der MY-Chatassistent beantwortet WhatsApp-Nachrichten, die Hautanalyse in der Kunden-App bereitet die Beratung vor, und Fragen des Teams zur Software beantwortet die KI direkt. Die ärztliche Entscheidung bleibt beim Arzt.",
          "Als Partnerpraxis bekommst du diese Werkzeuge mit der Software dazu, fertig eingerichtet.",
        ],
      },
    ],
    fragen: [
      {
        frage: "Wie viele Arztpraxen nutzen schon KI?",
        antwort:
          "Laut Bitkom-Umfrage von 2025 nutzen 15 Prozent der Ärzte in Praxen und MVZ mindestens eine KI-Anwendung, 8 Prozent in der Praxisverwaltung. Die Umfrage ist ein Stimmungsbild, nicht repräsentativ.",
      },
      {
        frage: "Ist KI in der Arztpraxis datenschutzkonform möglich?",
        antwort:
          "Ja, mit Auftragsverarbeitungsvertrag, Verschwiegenheitsverpflichtung, sicherer Verarbeitung möglichst in der EU und einem klaren Hinweis an die Kunden.",
      },
      {
        frage: "Womit sollte ich anfangen?",
        antwort:
          "Mit dem Telefon. Dort ist der Nutzen am schnellsten messbar: mehr angenommene Anrufe, mehr gebuchte Termine, ein ruhigerer Empfang.",
      },
    ],
    quellen: [
      { titel: "Bitkom: KI in Praxis und Kliniken im Einsatz (2025)", url: "https://www.bitkom.org/Presse/Presseinformation/KI-in-Praxis-und-Kliniken-im-Einsatz" },
      { titel: "KI-Verordnung (EU) 2024/1689", url: "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32024R1689" },
    ],
  },
  {
    slug: "praxismarketing-aesthetische-medizin",
    gruppe: "fuehren",
    geaendert: "2026-11-12",
    kurz: "Praxismarketing",
    h1: "Praxismarketing in der ästhetischen Medizin: Was erlaubt ist und was wirkt",
    seoTitel: "Praxismarketing in der ästhetischen Medizin | MY",
    beschreibung:
      "Wie gewinnt eine ästhetische Praxis neue Kunden? Google, Instagram, Bewertungen und Anzeigen, dazu die Grenzen aus Heilmittelwerbegesetz und Berufsordnung.",
    einleitung:
      "Eine ästhetische Praxis lebt von Kunden, die selbst zahlen und selbst entscheiden. Die suchen bei Google, schauen auf Instagram und lesen Bewertungen. Gleichzeitig ist Werbung für Ärzte streng geregelt. Hier steht, was funktioniert und wo die Grenzen liegen.",
    kurzGesagt:
      "Neue Kunden kommen in der Ästhetik vor allem über Google (Suche, Google-Profil, Bewertungen), über Instagram und über Empfehlungen. Anzeigen bei Google und Meta beschleunigen den Start. Verboten sind Vorher-Nachher-Bilder bei Unterspritzungen, Werbung für verschreibungspflichtige Präparate wie Botox beim Publikum und irreführende Versprechen. Am besten wirkt eine eigene Seite je Behandlung mit klaren Preisen und Online-Termin.",
    abschnitte: [
      {
        titel: "Die wichtigsten Kanäle",
        tabelle: [
          ["Kanal", "Wofür", "Aufwand"],
          ["Google-Unternehmensprofil", "Gefunden werden bei „Botox in der Nähe“, Bewertungen sammeln", "Gering, aber regelmäßig"],
          ["Website mit Behandlungsseiten", "Bei Google und KI-Suchen zu jeder Behandlung auftauchen", "Einmal hoch, dann Pflege"],
          ["Google-Anzeigen", "Sofort sichtbar bei Suchen mit Kaufabsicht", "Budget und laufende Steuerung"],
          ["Instagram und TikTok", "Vertrauen aufbauen, Arzt und Team zeigen", "Hoch: regelmäßig neue Videos"],
          ["Empfehlungen", "Zufriedene Kunden bringen Freunde mit", "Gering, wenn es ein einfaches Programm gibt"],
        ],
      },
      {
        titel: "Was in der Werbung verboten ist",
        liste: [
          "Vorher-Nachher-Bilder bei operativen plastisch-chirurgischen Eingriffen (§ 11 Abs. 1 Satz 3 HWG). Der Bundesgerichtshof hat 2025 entschieden, dass auch Unterspritzungen mit Hyaluron darunter fallen. Eine Einwilligung des Kunden ändert daran nichts.",
          "Werbung für verschreibungspflichtige Arzneimittel beim Publikum (§ 10 HWG). Du bewirbst die Faltenbehandlung, nicht das Präparat.",
          "Irreführende oder garantierte Ergebnisse, zum Beispiel „10 Jahre jünger“.",
          "Berufswidrige Werbung nach der Berufsordnung (§ 27 MBO-Ä): Sachliche Information ist erlaubt, anpreisende und vergleichende Werbung nicht.",
        ],
      },
      {
        titel: "Was in der Praxis am meisten bringt",
        liste: [
          "Bewertungen: Bitte jeden zufriedenen Kunden nach der Behandlung um eine Google-Bewertung. Antworte auf jede, auch auf die schlechten.",
          "Eine Seite je Behandlung mit Ablauf, Dauer, Preis ab und Online-Termin. Das ist es, wonach Kunden suchen.",
          "Gesichter zeigen: Kunden wollen wissen, wer sie behandelt. Ein kurzes Video vom Arzt wirkt mehr als jedes Stockfoto.",
          "Wiederkehr: Ein Kunde, der nach vier Monaten zur nächsten Botox-Behandlung kommt, kostet kein Werbebudget. Erinnere daran.",
        ],
      },
      {
        titel: "So läuft es bei MY HEALTH & BEAUTY",
        absaetze: [
          "Als Partnerpraxis startest du nicht bei null: Dein Standort steht unter der Marke MY HEALTH & BEAUTY auf unserer Website, mit Seiten zu jeder Behandlung, Online-Termin und Google-Profil. Erinnerungen an den nächsten Termin und ein Empfehlungsprogramm laufen automatisch.",
          "Mit dem Marketing-Paket steuert unser Team deine Anzeigen bei Google, Instagram und Facebook. Mit dem Social-Media-Paket kommen wir in deine Praxis und drehen die ersten Videos.",
        ],
      },
    ],
    fragen: [
      {
        frage: "Darf ich als Arzt Vorher-Nachher-Bilder von Botox oder Filler zeigen?",
        antwort:
          "Für Unterspritzungen nein. Der Bundesgerichtshof hat am 31.07.2025 entschieden (I ZR 170/24), dass auch minimal-invasive Unterspritzungen unter das Verbot fallen. Das gilt auch auf Instagram und auch mit Einwilligung des Kunden.",
      },
      {
        frage: "Darf ich mit dem Wort Botox werben?",
        antwort:
          "Gegenüber Kunden nicht für das Präparat selbst, weil Botulinumtoxin verschreibungspflichtig ist. Erlaubt ist, die Behandlung sachlich zu beschreiben. Lass deine Texte im Zweifel prüfen.",
      },
      {
        frage: "Wie viel Budget brauche ich für Werbung am Anfang?",
        antwort:
          "Das hängt von Stadt und Wettbewerb ab. Plane die ersten Monate mit einem festen Monatsbudget und miss, was ein gebuchter Termin kostet. Erst dann erhöhen.",
      },
    ],
    quellen: [
      { titel: "BGH, Urteil vom 31.07.2025, I ZR 170/24", url: "https://juris.bundesgerichtshof.de/cgi-bin/rechtsprechung/list.py?Gericht=bgh&Art=en&az=I%20ZR%20170/24" },
      { titel: "§ 11 HWG: Werbeverbote außerhalb der Fachkreise", url: "https://www.gesetze-im-internet.de/heilmwerbg/__11.html" },
      { titel: "Bundesärztekammer: (Muster-)Berufsordnung, § 27", url: "https://www.bundesaerztekammer.de/themen/recht/berufsrecht" },
    ],
  },
  {
    slug: "praxissoftware-privatpraxis",
    gruppe: "fuehren",
    geaendert: "2026-11-12",
    kurz: "Praxissoftware",
    h1: "Praxissoftware für die ästhetische Privatpraxis: Worauf es ankommt",
    seoTitel: "Praxissoftware für die Privatpraxis: Ästhetik | MY",
    beschreibung:
      "Welche Praxissoftware braucht eine ästhetische Privatpraxis? Termine, Akte, Fotodoku, Kasse, Lager: die Checkliste und warum ein System besser ist als fünf.",
    einleitung:
      "Klassische Praxissoftware ist für Kassenpraxen gebaut: Abrechnung mit der KV, Telematikinfrastruktur, Quartale. Eine ästhetische Privatpraxis braucht etwas anderes. Hier steht, was wirklich zählt.",
    kurzGesagt:
      "Eine ästhetische Privatpraxis braucht vor allem Online-Terminbuchung, eine Kundenakte mit Fotodokumentation und Einwilligungen, eine Kasse und ein Lager für Botox und Filler. Die Anbindung an die Telematikinfrastruktur und die KV-Abrechnung brauchst du als reine Privatpraxis nicht. Am meisten Zeit spart ein System, in dem Termin, Akte, Kasse und Lager zusammenhängen, statt fünf Programmen nebeneinander.",
    abschnitte: [
      {
        titel: "Checkliste: Was die Software können muss",
        tabelle: [
          ["Bereich", "Worauf du achtest"],
          ["Termine", "Online-Buchung, unterschiedliche Dauer je Behandlung, Erinnerungen per SMS oder WhatsApp"],
          ["Kundenakte", "Anamnese, Behandlungsdoku mit Produkt und Charge, Aufbewahrung 10 Jahre (§ 630f BGB)"],
          ["Fotos", "Fotodoku je Behandlung, getrennt von Werbung, mit Einwilligung"],
          ["Einwilligung", "Aufklärung und Unterschrift digital, vor dem Termin oder am Tablet"],
          ["Kasse", "Zahlung mit Karte, Rechnung, Gutscheine und Pakete"],
          ["Lager", "Wareneingang, Verbrauch je Behandlung, Verfall"],
          ["Auswertung", "Umsatz je Behandlung und Arzt, Wiederkehr der Kunden"],
          ["Datenschutz", "Server in der EU, Rechte nach Rolle, Protokoll der Zugriffe"],
        ],
      },
      {
        titel: "Was eine Privatpraxis nicht braucht",
        absaetze: [
          "Die Abrechnung mit der Kassenärztlichen Vereinigung und die Pflicht zur Telematikinfrastruktur betreffen Vertragsärzte. Als reine Privatpraxis brauchst du sie nicht. Viele klassische Praxisprogramme sind genau darauf ausgelegt und dadurch für die Ästhetik schwerfällig und teuer.",
        ],
      },
      {
        titel: "Ein System statt fünf",
        absaetze: [
          "Viele Praxen starten mit einem Buchungstool, einem Kassensystem, einer Excel-Liste fürs Lager und Papierbögen. Jede Lücke dazwischen kostet Zeit: Termine werden doppelt eingetragen, der Verbrauch passt nicht zur Kasse, und niemand sieht, ob ein Kunde wiederkommt. Wenn alles in einem System liegt, entsteht jede Information nur einmal.",
        ],
      },
      {
        titel: "So läuft es bei MY HEALTH & BEAUTY",
        absaetze: [
          "Unsere Software haben wir für unsere eigenen Standorte gebaut: Online-Buchung, Kunden-App, Kundenakte mit Fotodoku und digitalem Fragebogen, Kasse und Lager in einem System, dazu Telefon- und Chatassistent. Die Ärzte dokumentieren am Tablet, der Rest läuft im Hintergrund.",
          "Als Partnerpraxis arbeitest du vom ersten Tag an mit diesem System. Einrichtung, Updates und Schulung gehören dazu.",
        ],
      },
    ],
    fragen: [
      {
        frage: "Brauche ich als Privatpraxis eine zertifizierte Praxissoftware?",
        antwort:
          "Eine KV-Zulassung der Software brauchst du nur für die Kassenabrechnung. Für eine reine Privatpraxis zählen Dokumentation nach § 630f BGB, Datenschutz und eine ordnungsgemäße Kasse.",
      },
      {
        frage: "Muss eine Privatpraxis an die Telematikinfrastruktur?",
        antwort:
          "Die Pflicht zur Anbindung betrifft Vertragsärzte. Eine reine Privatpraxis ist davon nicht erfasst.",
      },
      {
        frage: "Wie lange muss ich die Behandlungsdokumentation aufbewahren?",
        antwort:
          "Mindestens zehn Jahre nach Abschluss der Behandlung (§ 630f Abs. 3 BGB), soweit andere Vorschriften nichts anderes verlangen.",
      },
    ],
    quellen: [
      { titel: "§ 630f BGB: Dokumentation der Behandlung", url: "https://www.gesetze-im-internet.de/bgb/__630f.html" },
      { titel: "gematik: Telematikinfrastruktur", url: "https://www.gematik.de/telematikinfrastruktur" },
    ],
  },
  {
    slug: "mfa-personal-finden",
    gruppe: "fuehren",
    geaendert: "2026-11-12",
    kurz: "Personal finden",
    h1: "MFA und Personal für die ästhetische Praxis finden",
    seoTitel: "MFA finden: Personal für die ästhetische Praxis | MY",
    beschreibung:
      "Medizinische Fachangestellte sind knapp. So findest du trotzdem ein gutes Team für deine ästhetische Praxis: Rollen, Wege und was du delegieren kannst.",
    einleitung:
      "Ohne Team keine Praxis. Doch Medizinische Fachangestellte gehören laut Bundesagentur für Arbeit zu den Engpassberufen. Gut, dass eine ästhetische Praxis nicht nur MFA braucht. Hier steht, wen du wirklich brauchst und wie du ihn findest.",
    kurzGesagt:
      "Eine ästhetische Praxis braucht am Anfang einen Arzt, der behandelt, und ein bis zwei Leute für Empfang, Beratung und Kasse. Dafür eignen sich nicht nur MFA, sondern auch Quereinsteiger aus Kosmetik, Hotel und Handel. Injektionen bleiben beim Arzt. Stellen findest du schneller über Instagram, Empfehlungen und Anzeigen als über klassische Jobbörsen. Entscheidend sind klare Abläufe und eine gute Einarbeitung.",
    abschnitte: [
      {
        titel: "Welche Rollen eine ästhetische Praxis braucht",
        tabelle: [
          ["Rolle", "Aufgaben", "Wer passt"],
          ["Arzt", "Aufklärung, Indikation, Behandlung", "Approbierter Arzt mit Erfahrung in der Ästhetik"],
          ["Kundenberater", "Empfang, Beratung, Termine, Kasse", "MFA oder Quereinsteiger aus Kosmetik, Hotel, Handel"],
          ["Praxisleitung", "Team, Lager, Dienstplan", "Erfahrene MFA oder Kundenberater, oft erst ab dem zweiten Arzt"],
        ],
      },
      {
        titel: "Was du delegieren darfst und was nicht",
        absaetze: [
          "Aufklärung, Indikation und die Injektion selbst sind ärztliche Aufgaben. Botulinumtoxin und Filler spritzt bei uns ausschließlich der Arzt. Empfang, Terminplanung, Vorbereitung, Fotos, Kasse und Nachsorge-Hinweise kann ein gut eingearbeitetes Team übernehmen.",
        ],
      },
      {
        titel: "Wo du gutes Personal findest",
        liste: [
          "Instagram und TikTok: Kurze Videos aus dem Praxisalltag sprechen genau die Leute an, die in der Ästhetik arbeiten wollen.",
          "Empfehlungen aus dem Team und von Kunden. Eine Prämie für erfolgreiche Empfehlungen lohnt sich.",
          "Anzeigen bei Meta und Indeed, mit klarer Aussage zu Gehalt, Arbeitszeit und Einarbeitung.",
          "Quereinsteiger: Wer aus Kosmetik oder Hotel kommt, kann mit Kunden umgehen. Das Fachliche lernt man mit guter Schulung.",
        ],
      },
      {
        titel: "So läuft es bei MY HEALTH & BEAUTY",
        absaetze: [
          "An unseren Standorten arbeiten Kundenberater am Empfang und in der Beratung, viele davon Quereinsteiger. Sie lernen mit unseren Schulungen in der App, die Ärzte behandeln. Dienstplan, Zeiterfassung und Provisionen laufen in der Software.",
          "Mit dem Recruiting-Paket finden wir Kundenberater und Ärzte für dein Team. Mit dem Lohn-Paket übernehmen wir die monatliche Lohnabrechnung.",
        ],
      },
    ],
    fragen: [
      {
        frage: "Brauche ich in einer ästhetischen Praxis unbedingt MFA?",
        antwort:
          "Nein. Für Empfang, Beratung und Kasse eignen sich auch Quereinsteiger. Für Aufgaben mit medizinischem Bezug ist eine Ausbildung als MFA hilfreich, Injektionen bleiben in jedem Fall beim Arzt.",
      },
      {
        frage: "Darf eine MFA Botox spritzen?",
        antwort:
          "Davon ist klar abzuraten. Botulinumtoxin ist verschreibungspflichtig, und die ästhetische Injektion gilt als ärztliche Kernleistung: Indikation, Aufklärung und Durchführung gehören zum Arzt. Bei uns spritzen ausschließlich Ärzte.",
      },
      {
        frage: "Wie viele Mitarbeiter brauche ich am Anfang?",
        antwort:
          "Für einen Behandlungsraum reichen meist ein Arzt und ein bis zwei Kundenberater. Mit dem zweiten Raum oder längeren Öffnungszeiten wächst das Team.",
      },
    ],
    quellen: [
      { titel: "Bundesärztekammer: Medizinische Fachangestellte als Engpassberuf", url: "https://www.bundesaerztekammer.de/presse/aktuelles/detail/wwwvon-beruf-wichtigde-influencer-werben-fuer-ausbildung-als-mfa" },
    ],
  },
];
