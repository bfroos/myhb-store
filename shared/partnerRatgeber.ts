/**
 * Ratgeber fuer Aerzte, die eine eigene Praxis fuer aesthetische Medizin
 * gruenden wollen (E32, bfroos/myhb-store#435).
 *
 * Warum es diese Seiten gibt (Sistrix, 07.11.2026): Nach "Franchise" oder
 * "Partnerprogramm" sucht fast niemand. Gesucht wird nach Gruendung, Kosten,
 * Verdienst, Uebernahme und Kursen. Jede Seite beantwortet genau eine dieser
 * Fragen ehrlich und verlinkt auf /partnerpraxis.
 *
 * Regeln fuer die Texte:
 * - Zahlen nur mit Quelle oder ausdruecklich als Richtwert/Rechenbeispiel.
 * - Keine Gebuehren von MYHB (Benjamin 07.11.2026: Preise erst intern klaeren).
 * - Kein Umsatzversprechen fuer Partner; das Rechenbeispiel ist allgemein.
 * - "Aerzte", "Kunden", nie die weibliche Form. Kein "Franchise" als Eigenname.
 *   "Botox" ist hier erlaubt: die Seiten richten sich an Aerzte, und
 *   "botox kurs" ist der Suchbegriff (Benjamin 07.11.2026).
 */

export const RATGEBER_BASIS = "/partnerpraxis";
export const RATGEBER_STAND = "November 2026";

export type Abschnitt = {
  titel: string;
  absaetze?: string[];
  liste?: string[];
  /** Tabelle: erste Zeile = Kopf. */
  tabelle?: string[][];
};

export type RatgeberFrage = { frage: string; antwort: string };

export type RatgeberArtikel = {
  slug: string;
  /** Kurzname fuer Links und Brotkrumen. */
  kurz: string;
  h1: string;
  seoTitel: string;
  beschreibung: string;
  einleitung: string;
  /** Die Antwort in drei bis vier Saetzen, ganz oben. Das zitieren Google und KI-Suchen. */
  kurzGesagt: string;
  abschnitte: Abschnitt[];
  fragen: RatgeberFrage[];
  quellen: { titel: string; url: string }[];
};

export const RATGEBER: RatgeberArtikel[] = [
  {
    slug: "privatpraxis-eroeffnen",
    kurz: "Privatpraxis eröffnen",
    h1: "Privatpraxis eröffnen: Voraussetzungen und Checkliste für Ärzte",
    seoTitel: "Privatpraxis eröffnen: Voraussetzungen & Checkliste | MY",
    beschreibung:
      "Was brauchst du, um als Arzt eine Privatpraxis zu eröffnen? Approbation, Anmeldungen, Steuern, Versicherung und eine Checkliste für die ästhetische Medizin.",
    einleitung:
      "Du willst dich mit einer eigenen Privatpraxis selbstständig machen, zum Beispiel in der ästhetischen Medizin? Gute Nachricht: Der Weg ist kürzer als bei einer Kassenpraxis. Hier steht, was du wirklich brauchst und in welcher Reihenfolge.",
    kurzGesagt:
      "Für eine Privatpraxis brauchst du die Approbation, aber keine Kassenzulassung und keinen Facharzttitel. Du zeigst die Praxis bei deiner Landesärztekammer an, meldest dich beim Finanzamt und schließt eine Berufshaftpflicht ab, die ästhetische Behandlungen ausdrücklich abdeckt. Ästhetische Behandlungen ohne medizinischen Grund sind umsatzsteuerpflichtig. Rechne von der Idee bis zur Eröffnung mit drei bis sechs Monaten.",
    abschnitte: [
      {
        titel: "Was du als Arzt mindestens brauchst",
        liste: [
          "Approbation als Arzt. Sie ist die einzige zwingende fachliche Voraussetzung.",
          "Keinen Facharzttitel: Rechtlich darfst du auch ohne Facharzt eine Privatpraxis führen. Auf dem Praxisschild darfst du aber nur Bezeichnungen tragen, die du wirklich erworben hast.",
          "Keine Kassenzulassung: Eine Privatpraxis rechnet nicht mit den Krankenkassen ab. Es gibt keine Bedarfsplanung, du suchst dir den Ort frei aus.",
          "Erfahrung in den Behandlungen, die du anbieten willst. Das schreibt kein Gesetz vor, aber deine Versicherung und deine Kunden erwarten es.",
        ],
      },
      {
        titel: "Diese Stellen musst du informieren",
        tabelle: [
          ["Stelle", "Was du dort machst"],
          ["Landesärztekammer", "Niederlassung anzeigen (Berufsordnung § 17). Die Kammer prüft auch Praxisschild und Werbung."],
          ["Finanzamt", "Fragebogen zur steuerlichen Erfassung ausfüllen. Du bekommst eine Steuernummer."],
          ["Berufshaftpflicht", "Versicherung abschließen, die ästhetische Eingriffe ausdrücklich einschließt. Ohne sie keine Behandlung."],
          ["Gesundheitsamt", "Je nach Bundesland Praxis melden. Einen Hygieneplan brauchst du in jedem Fall."],
          ["Agentur für Arbeit und BGW", "Betriebsnummer beantragen und bei der Berufsgenossenschaft melden, sobald du Personal einstellst."],
        ],
      },
      {
        titel: "Steuern: der Punkt, den viele übersehen",
        absaetze: [
          "Ärztliche Heilbehandlungen sind von der Umsatzsteuer befreit. Ästhetische Behandlungen ohne medizinischen Grund sind es nicht: Für Faltenbehandlung, Lippenunterspritzung oder Skinbooster fallen in der Regel 19 % Umsatzsteuer an. So sehen es der Europäische Gerichtshof und der Bundesfinanzhof.",
          "Verkaufst du in der Praxis auch Pflegeprodukte, ist das eine gewerbliche Tätigkeit. Ab einer gewissen Größe kann das die ganze Praxis gewerbesteuerpflichtig machen. Sprich das vor dem Start mit einem Steuerberater durch, der Ärzte betreut.",
        ],
      },
      {
        titel: "Werbung: was in der Ästhetik nicht erlaubt ist",
        liste: [
          "Keine Vorher-nachher-Bilder in der Werbung für ästhetische Eingriffe. Der Bundesgerichtshof zählt seit Juli 2025 auch Unterspritzungen dazu.",
          "Keine Werbung für verschreibungspflichtige Mittel wie Botulinumtoxin bei Kunden. Du sprichst über die Behandlung, nicht über das Präparat.",
          "Sachlich bleiben: Die Berufsordnung verbietet anpreisende oder irreführende Werbung.",
        ],
      },
      {
        titel: "Checkliste: In 10 Schritten zur eigenen Privatpraxis",
        liste: [
          "Angebot festlegen: Welche Behandlungen bietest du an, für wen, zu welchen Preisen?",
          "Standort suchen: gute Lage, sichtbar, gut erreichbar. In der Ästhetik funktionieren Innenstädte und Einkaufszentren gut.",
          "Finanzierung klären: Kostenplan, Eigenkapital, Gespräch mit der Bank.",
          "Rechtsform wählen: Einzelpraxis oder Praxis-GmbH, mit Steuerberater.",
          "Mietvertrag prüfen lassen und Umbau planen.",
          "Berufshaftpflicht abschließen.",
          "Niederlassung bei der Ärztekammer anzeigen, Finanzamt informieren.",
          "Einrichtung, Technik, Software und Erstbestückung bestellen.",
          "Team einstellen: mindestens eine Person für Empfang und Termine.",
          "Website, Google-Profil und Online-Termin starten, bevor du eröffnest.",
        ],
      },
    ],
    fragen: [
      {
        frage: "Kann jeder Arzt eine Privatpraxis eröffnen?",
        antwort:
          "Ja, jeder approbierte Arzt darf eine Privatpraxis eröffnen. Ein Facharzttitel oder eine Kassenzulassung ist dafür nicht nötig. Du musst die Niederlassung bei deiner Landesärztekammer anzeigen und eine passende Berufshaftpflicht haben.",
      },
      {
        frage: "Brauche ich für eine Privatpraxis einen Facharzt?",
        antwort:
          "Nein. Für eine Privatpraxis reicht die Approbation. Du darfst aber nur die Bezeichnungen führen, die du erworben hast. In der ästhetischen Medizin zählen für Kunden vor allem Erfahrung und gute Ergebnisse.",
      },
      {
        frage: "Wie lange dauert es, eine Privatpraxis zu eröffnen?",
        antwort:
          "Meist drei bis sechs Monate. Am längsten dauern die Suche nach dem Standort und der Umbau. Die Anmeldungen selbst sind in wenigen Wochen erledigt.",
      },
      {
        frage: "Muss ich auf ästhetische Behandlungen Umsatzsteuer zahlen?",
        antwort:
          "In der Regel ja. Behandlungen ohne medizinischen Grund sind nicht von der Umsatzsteuer befreit, es fallen 19 % an. Behandlungen mit medizinischem Grund, etwa gegen starkes Schwitzen, können befreit sein. Lass dich von einem Steuerberater beraten.",
      },
      {
        frage: "Brauche ich einen Gewerbeschein?",
        antwort:
          "Für die ärztliche Tätigkeit nicht, Ärzte sind freiberuflich tätig. Verkaufst du zusätzlich Produkte, kann dieser Teil gewerblich sein. Viele Praxen trennen das deshalb.",
      },
    ],
    quellen: [
      { titel: "Ärztekammer Westfalen-Lippe: Niederlassung als Privatarzt (Merkblatt)", url: "https://www.aekwl.de/fileadmin/user_upload/aekwl/recht/merkblaetter/Niederlassung_als_Privatarzt.pdf" },
      { titel: "Ärztekammer Nordrhein: Niederlassung in Privatpraxis", url: "https://www.aekno.de/fileadmin/user_upload/aekno/downloads/2022/privatpraxis-niederlassung-2022-01.pdf" },
    ],
  },
  {
    slug: "kosten-praxis-aesthetische-medizin",
    kurz: "Kosten einer Praxis",
    h1: "Was kostet eine Praxis für ästhetische Medizin?",
    seoTitel: "Was kostet eine Praxis für ästhetische Medizin? | MY",
    beschreibung:
      "Praxiseinrichtung, Technik, Ware, Miete, Personal: Was eine Praxis für ästhetische Medizin zum Start und im Monat kostet, mit Richtwerten aus neun Standorten.",
    einleitung:
      "Eine Praxis für ästhetische Medizin ist deutlich günstiger als eine klassische Arztpraxis. Du brauchst keine Großgeräte, kein Labor und kein Röntgen. Teuer wird es trotzdem schnell, wenn Einrichtung, Ware und Marketing nicht geplant sind. Die Richtwerte unten stammen aus dem Aufbau unserer neun eigenen Standorte.",
    kurzGesagt:
      "Für eine kleine Praxis für ästhetische Medizin mit zwei Behandlungsräumen solltest du für Einrichtung, Technik, Branding und die erste Ware rund 35.000 bis 60.000 € einplanen. Mit Umbau, Mietkaution und Reserve für die ersten Monate sind es rund 45.000 bis 80.000 €. Eine Praxisübernahme ist meist deutlich teurer.",
    abschnitte: [
      {
        titel: "Einmalige Kosten zum Start",
        tabelle: [
          ["Posten", "Was dazugehört", "Richtwert"],
          ["Behandlungsraum (je Raum)", "Behandlungsliege, Arzthocker, Rollwagen, Untersuchungslicht", "4.000–7.000 €"],
          ["Empfang und Wartebereich", "Tresen, Sofa, Stühle, Tisch", "8.000–15.000 €"],
          ["Technik", "Tablets, Drucker, WLAN, Medikamenten-Kühlschrank mit Temperaturaufzeichnung", "4.000–6.000 €"],
          ["Branding", "Logo, Leuchtschrift, Praxisschild, Preistafeln, Bilder", "5.000–10.000 €"],
          ["Medizinische Grundausstattung", "Notfallkoffer mit Defibrillator, Sterilgut, Hygieneplan", "2.000–4.000 €"],
          ["Erste Ware", "Hyaluron, Skinbooster, Infusionen, Verbrauchsmaterial", "8.000–12.000 €"],
          ["Summe (2 Räume)", "", "rund 35.000–60.000 €"],
        ],
        absaetze: [
          "Dazu kommen je nach Fläche Umbau, Mietkaution (meist zwei bis drei Monatsmieten) und eine Reserve für die Anlaufzeit. Plane mindestens drei Monate Fixkosten als Puffer ein.",
        ],
      },
      {
        titel: "Laufende Kosten im Monat",
        liste: [
          "Ware und Verbrauchsmaterial: in der Ästhetik meist 20 bis 30 % vom Umsatz.",
          "Personal: mindestens eine Vollzeitkraft für Empfang, Termine und Kasse.",
          "Miete und Nebenkosten: stark abhängig von Stadt und Lage.",
          "Software: Termine, Kundenakte, Kasse und Lager kosten zusammen schnell 150 bis 400 € im Monat.",
          "Website, Google und Social Media: über eine Agentur meist 500 bis 1.500 € im Monat, plus Werbebudget.",
          "Telefon: Ein Telefonservice kostet 300 bis 800 € im Monat, wenn niemand am Empfang ist.",
          "Versicherungen, Steuerberater, Lohnabrechnung.",
        ],
      },
      {
        titel: "Neugründung oder Übernahme: was ist günstiger?",
        absaetze: [
          "Bei einer Neugründung zahlst du nur für Einrichtung und Start. Bei einer Übernahme kommt der Kaufpreis für die Praxis dazu, vor allem für den Kundenstamm. Laut apoBank kostete schon die Neugründung einer hausärztlichen Einzelpraxis 2022/23 im Schnitt rund 78.000 €, die Übernahme rund 94.000 €. In der Ästhetik brauchst du weniger Geräte, dafür mehr Geld für Marke, Lage und Ware.",
          "Mehr dazu im Ratgeber „Praxisübernahme oder Neugründung“.",
        ],
      },
      {
        titel: "So sparst du beim Start",
        liste: [
          "Klein anfangen: zwei Behandlungsräume reichen für den Start.",
          "Ware in kleinen Mengen bestellen und auf gute Einkaufskonditionen achten.",
          "Software nehmen, die Termine, Kundenakte, Kasse und Lager in einem System vereint.",
          "Website und Google-Profil vor der Eröffnung starten, damit am ersten Tag schon Termine da sind.",
          "Oder als Partnerpraxis starten: Marke, Website, Software und Einkauf kommen dann fertig.",
        ],
      },
    ],
    fragen: [
      {
        frage: "Was kostet eine Praxiseinrichtung für ästhetische Medizin?",
        antwort:
          "Für zwei Behandlungsräume mit Empfang, Technik und Branding rund 25.000 bis 45.000 €. Mit der ersten Ware und der medizinischen Grundausstattung kommst du auf rund 35.000 bis 60.000 €.",
      },
      {
        frage: "Wie viel Eigenkapital brauche ich?",
        antwort:
          "Banken erwarten meist 10 bis 20 % Eigenkapital. Bei einem Kapitalbedarf von 60.000 € sind das 6.000 bis 12.000 €. Ärzte bekommen bei Banken in der Regel gute Konditionen.",
      },
      {
        frage: "Welche Geräte brauche ich für eine Ästhetik-Praxis?",
        antwort:
          "Für Unterspritzungen, Skinbooster und Infusionen keine Großgeräte. Wichtig sind eine gute Behandlungsliege, Licht, ein Medikamenten-Kühlschrank mit Temperaturaufzeichnung und eine Notfallausrüstung mit Defibrillator. Laser und Geräte für Hautstraffung kannst du später dazunehmen.",
      },
      {
        frage: "Wann rechnet sich eine Praxis für ästhetische Medizin?",
        antwort:
          "Das hängt vor allem davon ab, wie schnell sich dein Kalender füllt. Wer mit Website, Google-Profil und Online-Termin startet, ist schneller ausgelastet. Rechne für die ersten Monate mit einer Anlaufphase.",
      },
    ],
    quellen: [
      { titel: "apoBank: Existenzgründungsanalyse Hausärzte 2022/23 (Grafiken)", url: "https://www.apobank.de/dam/jcr:8f700bf9-69fe-4766-abef-18d8e1b265d6/Grafiken%20zu%20PM_Exigr%C3%BCndungen%20Haus%C3%A4rzte_2024.pdf" },
      { titel: "Richtwerte: Aufbau der neun Standorte von MY HEALTH & BEAUTY", url: "https://www.myhealthandbeauty.com/standorte" },
    ],
  },
  {
    slug: "verdienst-eigene-praxis",
    kurz: "Verdienst mit eigener Praxis",
    h1: "Wie viel verdient ein Arzt mit eigener Praxis in der ästhetischen Medizin?",
    seoTitel: "Was verdient ein Arzt mit eigener Praxis? Ästhetik | MY",
    beschreibung:
      "Was verdient ein Arzt mit eigener Praxis? Zahlen vom Statistischen Bundesamt, was in der Ästhetik anders ist und ein Rechenbeispiel zum Nachrechnen.",
    einleitung:
      "„Lohnt sich eine eigene Praxis?“ ist die Frage, die sich fast jeder Arzt vor dem Schritt in die Selbstständigkeit stellt. Hier findest du die offiziellen Zahlen und eine einfache Rechnung, mit der du für deine eigene Praxis rechnen kannst.",
    kurzGesagt:
      "Laut Statistischem Bundesamt lag der Reinertrag einer Arztpraxis 2023 im Schnitt bei 310.000 €, die Hälfte der Praxen lag bei höchstens 219.000 €. Das ist nicht das Gehalt: Davon gehen noch Steuern, Altersvorsorge und Krankenversicherung ab, und in Gemeinschaftspraxen teilt sich der Betrag. In der ästhetischen Medizin hängt der Verdienst vor allem von der Auslastung, den Preisen und den Wiederkehrern ab.",
    abschnitte: [
      {
        titel: "Die offiziellen Zahlen",
        tabelle: [
          ["Kennzahl (alle Arztpraxen, 2023)", "Wert"],
          ["Reinertrag je Praxis, Durchschnitt", "310.000 €"],
          ["Reinertrag je Praxis, Median", "219.000 €"],
          ["Anteil der Einnahmen aus Privatabrechnung", "28 %"],
        ],
        absaetze: [
          "Der Reinertrag ist das, was nach Abzug der Praxiskosten übrig bleibt. Steuern, Altersvorsorge und Krankenversicherung zahlst du davon noch selbst. Die Zahlen gelten für alle Fachrichtungen; eigene Zahlen nur für die Ästhetik veröffentlicht das Statistische Bundesamt nicht.",
        ],
      },
      {
        titel: "Was in der Ästhetik anders ist",
        liste: [
          "Kein Budget und keine Kassen: Kunden zahlen selbst, sofort und zu deinen Preisen.",
          "Kurze Behandlungen: Viele Behandlungen dauern 15 bis 45 Minuten. Die Auslastung entscheidet über alles.",
          "Wiederkehrende Kunden: Faltenbehandlungen werden alle paar Monate wiederholt. Ein treuer Kundenstamm ist das wichtigste Kapital.",
          "Höhere Warenkosten: Hyaluron, Skinbooster und Wirkstoffe machen meist 20 bis 30 % vom Umsatz aus.",
          "Umsatzsteuer: Auf rein ästhetische Behandlungen fallen 19 % an. Rechne immer mit Nettopreisen.",
        ],
      },
      {
        titel: "Rechenbeispiel zum Selbstrechnen",
        absaetze: [
          "Ein Beispiel für eine kleine Praxis mit zwei Behandlungsräumen. Das ist kein Versprechen, sondern eine Rechnung zum Nachmachen. Setz deine eigenen Zahlen ein.",
        ],
        tabelle: [
          ["Posten im Monat", "Beispiel"],
          ["Umsatz netto (ohne Umsatzsteuer)", "30.000 €"],
          ["Ware und Verbrauchsmaterial (25 %)", "−7.500 €"],
          ["Personal (2 Kräfte inkl. Arbeitgeberanteil)", "−7.000 €"],
          ["Miete und Nebenkosten", "−3.000 €"],
          ["Marketing und Werbung", "−2.000 €"],
          ["Software, Versicherung, Steuerberater, Sonstiges", "−1.500 €"],
          ["Überschuss vor Steuern", "9.000 €"],
        ],
      },
      {
        titel: "So steigerst du deinen Verdienst",
        liste: [
          "Kalender füllen: Online-Termin rund um die Uhr, schnelle Antworten am Telefon.",
          "Kunden zurückholen: an die nächste Behandlung erinnern, statt zu warten.",
          "Einkauf: gute Konditionen bei der Ware wirken direkt auf den Gewinn.",
          "Weniger Verwaltung: Jede Stunde Papierkram ist eine Stunde ohne Behandlung.",
        ],
      },
    ],
    fragen: [
      {
        frage: "Was verdient ein Arzt mit eigener Praxis im Durchschnitt?",
        antwort:
          "Der Reinertrag einer Arztpraxis lag 2023 laut Statistischem Bundesamt im Schnitt bei 310.000 €, im Median bei 219.000 €. Davon gehen noch Steuern, Altersvorsorge und Krankenversicherung ab. Bei mehreren Inhabern teilt sich der Betrag.",
      },
      {
        frage: "Verdient man in der ästhetischen Medizin mehr?",
        antwort:
          "Das kann sein, ist aber nicht sicher. Es gibt kein Budget, und Kunden zahlen sofort. Dafür musst du Kunden selbst gewinnen und hast höhere Warenkosten. Entscheidend sind Auslastung, Preise und wie viele Kunden wiederkommen.",
      },
      {
        frage: "Wie lange dauert es, bis eine eigene Praxis Gewinn macht?",
        antwort:
          "Das hängt davon ab, wie schnell du Kunden gewinnst. Mit gutem Standort, Website und Online-Termin geht es schneller. Plane mindestens drei Monate Reserve für die Anlaufphase ein.",
      },
    ],
    quellen: [
      { titel: "Statistisches Bundesamt: Kostenstruktur bei Arzt- und Zahnarztpraxen 2023 (Bericht Deutsches Ärzteblatt)", url: "https://www.aerzteblatt.de/news/mehr-einnahmen-durch-privatabrechnungen-in-arztpraxen-49bcd47c-de9a-4e65-a528-ddd346e7e8c0" },
      { titel: "apotheke adhoc: Arztpraxen, Reinertrag sinkt auf 310.000 Euro", url: "https://www.apotheke-adhoc.de/nachrichten/detail/politik/arztpraxen-reinertrag-sinkt-auf-310000-euro/" },
    ],
  },
  {
    slug: "aesthetische-medizin-ausbildung",
    kurz: "Ausbildung und Kurse",
    h1: "Arzt für ästhetische Medizin werden: Ausbildung, Botox-Kurs und Filler-Kurs",
    seoTitel: "Ästhetische Medizin lernen: Botox- & Filler-Kurs | MY",
    beschreibung:
      "Wie wirst du Arzt für ästhetische Medizin? Ob es einen Facharzt gibt, was Botox- und Filler-Kurse bringen und warum Praxis an echten Kunden am meisten zählt.",
    einleitung:
      "Viele Ärzte wollen in die ästhetische Medizin wechseln, wissen aber nicht, wie sie dort sicher werden. Einen festen Ausbildungsweg gibt es nicht. Umso wichtiger ist es, den richtigen Weg zu wählen.",
    kurzGesagt:
      "Einen Facharzt für ästhetische Medizin gibt es in Deutschland nicht. Jeder approbierte Arzt darf ästhetische Behandlungen durchführen. Den Einstieg bilden meist Kurse für Botox und Filler bei Herstellern, Fachgesellschaften oder Akademien. Sicher wirst du aber erst durch viele Behandlungen unter Anleitung erfahrener Kollegen.",
    abschnitte: [
      {
        titel: "Gibt es einen Facharzt für ästhetische Medizin?",
        absaetze: [
          "Nein. Ästhetische Medizin ist in Deutschland keine eigene Facharztrichtung und keine Zusatzbezeichnung. Nahe dran sind Dermatologie und Plastische und Ästhetische Chirurgie. Viele erfolgreiche Ärzte in der Ästhetik kommen aber aus ganz anderen Fächern, etwa Allgemeinmedizin, Anästhesie oder Innere Medizin.",
          "Wichtig: Botulinumtoxin ist verschreibungspflichtig. Behandlungen damit sind Ärzten vorbehalten, Heilpraktiker dürfen sie nicht durchführen.",
        ],
      },
      {
        titel: "Welche Kurse es gibt",
        tabelle: [
          ["Kurs", "Inhalt", "Dauer"],
          ["Botox-Grundkurs", "Anatomie der Mimik, Dosierung, Stirn, Zornesfalte, Krähenfüße, Komplikationen", "1–2 Tage"],
          ["Filler-Grundkurs (Hyaluron)", "Anatomie der Gefäße, Lippen, Nasolabialfalten, Kinn, Notfallmanagement", "1–2 Tage"],
          ["Aufbaukurse", "Profilierung, Kieferlinie, Augenringe, Kombinationen", "je 1 Tag"],
          ["Skinbooster, Mesotherapie, Infusionen", "Indikationen, Techniken, Produktwahl", "½–1 Tag"],
        ],
        absaetze: [
          "Kurse bieten Hersteller, Fachgesellschaften wie die Deutsche Gesellschaft für Botulinum- und Fillertherapie (DGBT) und private Akademien an. Die Preise reichen von einigen Hundert bis über 2.000 € pro Kurs. Achte darauf, dass du selbst an Probanden behandelst und nicht nur zuschaust.",
        ],
      },
      {
        titel: "Warum ein Kurs allein nicht reicht",
        absaetze: [
          "Nach einem Wochenendkurs hast du eine Handvoll Behandlungen gemacht. Sicher in Dosierung, Technik und im Umgang mit Komplikationen wirst du erst nach vielen Behandlungen. Am besten lernst du an der Seite erfahrener Ärzte, die du jederzeit fragen kannst.",
          "Deshalb gibt es bei uns einen zweiten Weg: Du arbeitest als Arzt an einem unserer Standorte, lernst dort alle Behandlungen im Alltag und eröffnest später deine eigene Praxis.",
        ],
      },
      {
        titel: "Dein Weg in die ästhetische Medizin",
        liste: [
          "Grundkurse für Botox und Filler mit Hands-on-Teil besuchen.",
          "Unter Anleitung behandeln: in einer erfahrenen Praxis, nicht allein.",
          "Komplikationen sicher beherrschen: Gefäßverschluss, Hyaluronidase, Notfallkoffer.",
          "Aufbaukurse für schwierigere Zonen erst nach einigen Hundert Behandlungen.",
          "Dann selbstständig machen, in eigener Praxis oder als Partnerpraxis.",
        ],
      },
    ],
    fragen: [
      {
        frage: "Wie werde ich Arzt für ästhetische Medizin?",
        antwort:
          "Mit Approbation darfst du ästhetische Behandlungen durchführen. Den Einstieg bilden Grundkurse für Botox und Filler. Sicher wirst du durch viele Behandlungen unter Anleitung erfahrener Kollegen, zum Beispiel als angestellter Arzt in einer ästhetischen Praxis.",
      },
      {
        frage: "Was kostet ein Botox-Kurs für Ärzte?",
        antwort:
          "Ein Grundkurs kostet je nach Anbieter und Umfang einige Hundert bis über 2.000 €. Achte darauf, dass du selbst an Probanden behandelst und die Anatomie gründlich lernst.",
      },
      {
        frage: "Dürfen Heilpraktiker Botox spritzen?",
        antwort:
          "Nein. Botulinumtoxin ist verschreibungspflichtig. Behandlungen damit sind Ärzten vorbehalten.",
      },
      {
        frage: "Gibt es einen Facharzt für ästhetische Medizin?",
        antwort:
          "Nein, ästhetische Medizin ist in Deutschland keine eigene Facharztrichtung. Am nächsten dran sind Dermatologie und Plastische und Ästhetische Chirurgie. Für ästhetische Behandlungen reicht die Approbation.",
      },
    ],
    quellen: [
      { titel: "Deutsche Gesellschaft für Botulinum- und Fillertherapie (DGBT)", url: "https://www.dgbt.de" },
      { titel: "Bundesärztekammer: (Muster-)Weiterbildungsordnung", url: "https://www.bundesaerztekammer.de/themen/aerzte/aus-fort-und-weiterbildung/weiterbildung/muster-weiterbildungsordnung" },
    ],
  },
  {
    slug: "praxisuebernahme-oder-neugruendung",
    kurz: "Übernahme oder Neugründung",
    h1: "Praxisübernahme oder Neugründung: was passt in der ästhetischen Medizin?",
    seoTitel: "Praxisübernahme oder Neugründung? Ästhetik | MY",
    beschreibung:
      "Praxis übernehmen oder neu gründen? Vor- und Nachteile, worauf du bei einer Praxisübernahme in der ästhetischen Medizin achten musst, und eine Checkliste.",
    einleitung:
      "Eine bestehende Praxis zu übernehmen klingt sicher: Kunden, Team und Räume sind schon da. In der ästhetischen Medizin ist die Rechnung aber anders als in der Kassenpraxis. Hier erfährst du, wann sich eine Übernahme lohnt und wann du besser neu gründest.",
    kurzGesagt:
      "Eine Praxisübernahme bringt Kunden, Team und Räume mit, kostet aber zusätzlich einen Kaufpreis für den Kundenstamm. In der Ästhetik binden sich Kunden stark an ihren Arzt, deshalb geht ein Teil oft mit dem Vorgänger. Eine Neugründung ist meist günstiger und lässt dir alle Freiheiten, braucht aber eine Anlaufphase. Ein Mittelweg ist ein Standort, der unter einer bekannten Marke startet.",
    abschnitte: [
      {
        titel: "Vor- und Nachteile im Vergleich",
        tabelle: [
          ["", "Übernahme", "Neugründung"],
          ["Kosten", "Kaufpreis plus Modernisierung", "Nur Einrichtung und Start"],
          ["Kunden", "ab dem ersten Tag, aber an den Vorgänger gebunden", "musst du selbst gewinnen"],
          ["Team", "übernimmst du mit allen Verträgen", "stellst du selbst zusammen"],
          ["Räume und Lage", "stehen fest", "frei wählbar"],
          ["Risiko", "versteckte Probleme (Verträge, Ruf, Technik)", "langsame Anlaufphase"],
        ],
      },
      {
        titel: "Worauf du bei einer Übernahme achten musst",
        liste: [
          "Umsatz der letzten drei Jahre: steigend, stabil oder fallend? Und wie viel davon macht der Vorgänger selbst?",
          "Wiederkehrer: Wie viele Kunden kommen regelmäßig? Das ist der eigentliche Wert der Praxis.",
          "Mietvertrag: Restlaufzeit, Verlängerung, Zustimmung des Vermieters zur Übernahme.",
          "Personal: Bei einer Übernahme gehen die Arbeitsverhältnisse auf dich über (§ 613a BGB).",
          "Kundenakten: Die Weitergabe braucht die Einwilligung der Kunden. Üblich ist das Zwei-Schrank-Modell.",
          "Übergangszeit: Arbeitet der Vorgänger noch einige Monate mit, bleiben mehr Kunden.",
          "Ruf: Google-Bewertungen und Beschwerden ansehen, bevor du unterschreibst.",
        ],
      },
      {
        titel: "Wie der Kaufpreis entsteht",
        absaetze: [
          "Der Preis setzt sich aus dem Wert der Einrichtung und dem ideellen Wert zusammen, also dem Kundenstamm und dem Namen. Gerade der ideelle Wert ist in der Ästhetik schwer zu greifen, weil Kunden oft dem Arzt folgen und nicht der Adresse. Lass die Praxis von einem unabhängigen Gutachter bewerten und vereinbare, wenn möglich, eine Übergangszeit mit dem Vorgänger.",
        ],
      },
      {
        titel: "Der dritte Weg: Start unter einer bekannten Marke",
        absaetze: [
          "Du kannst auch neu gründen, ohne bei null anzufangen: als Partnerpraxis einer Marke, die Kunden schon kennen. Dann bringst du deine eigene Praxis ein oder eröffnest neu, und Marke, Website, Software und Einkauf sind vom ersten Tag an da.",
        ],
      },
    ],
    fragen: [
      {
        frage: "Ist eine Praxisübernahme besser als eine Neugründung?",
        antwort:
          "Nicht automatisch. Eine Übernahme bringt sofort Kunden, kostet aber einen Kaufpreis, und in der Ästhetik gehen Kunden oft mit dem Vorgänger. Eine Neugründung ist meist günstiger, braucht aber eine Anlaufphase.",
      },
      {
        frage: "Was kostet eine Praxisübernahme?",
        antwort:
          "Das hängt vor allem vom Kundenstamm und vom Umsatz ab. Laut apoBank kostete die Übernahme einer hausärztlichen Einzelpraxis 2022/23 im Schnitt rund 94.000 €, Facharztpraxen liegen oft deutlich darüber. Lass jede Praxis unabhängig bewerten.",
      },
      {
        frage: "Darf ich die Kundenakten bei einer Übernahme einfach übernehmen?",
        antwort:
          "Nein. Kundenakten unterliegen der ärztlichen Schweigepflicht. Du darfst sie erst einsehen, wenn der Kunde zustimmt. Bis dahin verwahrst du sie getrennt (Zwei-Schrank-Modell).",
      },
      {
        frage: "Kann ich meine bestehende Praxis in ein Partnerprogramm einbringen?",
        antwort:
          "Bei MY HEALTH & BEAUTY ja. Du behältst deine Praxis und deine Kunden und bekommst Marke, Website, Software und Einkauf dazu.",
      },
    ],
    quellen: [
      { titel: "apoBank: Existenzgründungsanalyse Hausärzte 2022/23 (Grafiken)", url: "https://www.apobank.de/dam/jcr:8f700bf9-69fe-4766-abef-18d8e1b265d6/Grafiken%20zu%20PM_Exigr%C3%BCndungen%20Haus%C3%A4rzte_2024.pdf" },
      { titel: "§ 613a BGB: Rechte und Pflichten bei Betriebsübergang", url: "https://www.gesetze-im-internet.de/bgb/__613a.html" },
    ],
  },
];

export function ratgeberPfad(slug: string): string {
  return `${RATGEBER_BASIS}/${slug}`;
}

export function findeRatgeber(slug: string): RatgeberArtikel | undefined {
  return RATGEBER.find((a) => a.slug === slug);
}

/** FAQPage plus Article, fuer Google und KI-Suchen. Text 1:1 wie auf der Seite. */
export function ratgeberSchema(a: RatgeberArtikel, siteUrl: string) {
  const basis = siteUrl.replace(/\/$/, "");
  const url = `${basis}${ratgeberPfad(a.slug)}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${url}#artikel`,
      headline: a.h1,
      description: a.beschreibung,
      url,
      inLanguage: "de-DE",
      dateModified: "2026-11-07",
      audience: { "@type": "Audience", audienceType: "Ärzte" },
      publisher: { "@type": "Organization", name: "MY HEALTH & BEAUTY", url: basis },
      isPartOf: { "@type": "WebSite", url: basis },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: a.fragen.map((f) => ({
        "@type": "Question",
        name: f.frage,
        acceptedAnswer: { "@type": "Answer", text: f.antwort },
      })),
    },
  ];
}
