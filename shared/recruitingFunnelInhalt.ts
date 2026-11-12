/**
 * Texte, Bilder und Videos des Recruiting-Funnels Aerzte
 * (/karriere/bewerben/<stadt>). Texte aus dem Perspective-Funnel
 * recruiting.myhealthandbeauty.com/docs1 (Stand 12.11.2026), mit "Kunden"
 * statt "Gaeste/Klienten". Bilder vom eigenen Shooting 2026 (Strapi-Medien),
 * statt der Unsplash-Stockfotos bei Perspective. Videos: Michaels
 * "Aerzte Recruiting" auf Vimeo, wie bei Perspective eingebunden.
 */

const MEDIA = "https://media.myhealthandbeauty.app";

export interface FunnelBild {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const bild = (datei: string, alt: string, width = 1000, height = 666): FunnelBild => ({
  src: `${MEDIA}/large_${datei}.webp`,
  alt,
  width,
  height,
});

export const FUNNEL_BILDER = {
  team: bild("2026_MYHB_Tag2_18_c8f564feac", "Ärzteteam von MY HEALTH & BEAUTY vor dem Logo"),
  beratung: bild("2026_MYHB_Tag2_105_03ed4c1626", "Arzt im Beratungsgespräch in einer MY HEALTH & BEAUTY Lounge", 1000, 667),
  empfang: bild("2026_MYHB_Tag3_34_ebf7060f7d", "Empfang einer MY HEALTH & BEAUTY Lounge"),
  lounge: bild("2026_MYHB_Tag3_32_4cedcff959", "Schild einer MY HEALTH & BEAUTY Lounge"),
  aerzte: bild("2026_MYHB_Tag2_40_46146feabe", "Ärzte von MY HEALTH & BEAUTY in der Lounge"),
  gruender: bild("2026_MYHB_Tag2_50_409ecb5426", "Rihem Mikhail (Recruiting) und Michael Auf der Mauer (Gründer)"),
  behandlung: bild("2026_MYHB_Tag2_120_6e84fb584d", "Botox-Behandlung in einer MY HEALTH & BEAUTY Lounge"),
  infusion: bild("2026_MYHB_Tag3_25_b7d57aa01c", "Vitamin-Infusion in einer MY HEALTH & BEAUTY Lounge"),
  gespraech: bild("2026_MYHB_Tag2_107_eeb1dc8823", "Arzt bespricht eine Behandlung mit einer Kundin", 1000, 667),
} as const;

/** Michaels Recruiting-Videos (hochkant). */
export const FUNNEL_VIDEOS = [
  { id: "1184858140", titel: "Ärzte Recruiting bei MY HEALTH & BEAUTY", poster: `${MEDIA}/large_2026_MYHB_Tag1_88_739b33bb5c.webp` },
  { id: "1184495040", titel: "Ärzte Recruiting bei MY HEALTH & BEAUTY, Teil 2", poster: `${MEDIA}/large_2026_MYHB_Tag1_78_4436aca9ab.webp` },
] as const;

export interface Kachel {
  titel: string;
  text: string;
}

export const VORTEILE_START: Kachel[] = [
  { titel: "Höchste Qualitätsstandards", text: "Wir verwenden nur premium Produkte und modernste Behandlungsmethoden, damit unsere Kunden strahlend zufrieden unsere Lounges verlassen." },
  { titel: "Arbeite in unseren modernen Lounges", text: "Unsere stilvoll eingerichteten Lounges in deutschen Großstädten bieten ein professionelles und angenehmes Arbeitsumfeld." },
  { titel: "Modernste Ausstattung", text: "Wir stellen dir erstklassige medizinische Geräte und hochwertige Behandlungsprodukte zur Verfügung." },
  { titel: "Kontinuierliche Weiterbildung", text: "Regelmäßige Schulungen zu neuen Behandlungsmethoden und Techniken halten dich auf dem neuesten Stand der Ästhetik." },
  { titel: "Attraktives Vergütungspaket", text: "Festes Gehalt plus leistungsabhängige Provisionen – deine Expertise wird fair belohnt." },
  { titel: "Eigenverantwortliches Arbeiten", text: "Du übernimmst Verantwortung für deine Kunden und gestaltest deren Behandlungserlebnis eigenständig mit." },
  { titel: "Professionelles Team", text: "Arbeite mit qualifizierten Kollegen zusammen, die deine Leidenschaft für Ästhetik und Kundenzufriedenheit teilen." },
  { titel: "Flexible Arbeitszeiten", text: "Unser Walk-in-Konzept ermöglicht eine abwechslungsreiche Tagesgestaltung mit verschiedenen Behandlungen und Kunden." },
  { titel: "Team-Events", text: "Regelmäßige Schulungsveranstaltungen und Team-Events stärken den Zusammenhalt und den fachlichen Austausch." },
];

export const SCHRITTE: Kachel[] = [
  { titel: "Bewirb dich für die Position", text: "Teile uns dein Interesse mit – egal ob über unsere Website, LinkedIn oder direkt im Gespräch." },
  { titel: "Erstes Kennenlernen", text: "Ein kurzes Gespräch hilft uns beiden, die wichtigsten Fragen zu klären und uns gegenseitig kennenzulernen." },
  { titel: "Fachliche Qualifikation", text: "Wir besprechen deine Erfahrungen und prüfen deine fachlichen Qualifikationen für ästhetische Behandlungen." },
  { titel: "Praktische Einschätzung", text: "Eine kurze praktische Demonstration hilft uns zu sehen, ob du dich in deinem Fachgebiet wohlfühlst." },
  { titel: "Lerne dein Team kennen", text: "Jetzt kannst du deine zukünftigen Kollegen und unsere Lounge-Atmosphäre persönlich erleben." },
  { titel: "Willkommen im Team!", text: "Wir bereiten bereits dein Onboarding und die Einarbeitung in unsere Behandlungsstandards vor." },
];

export const VORTEILE_WARUM: Kachel[] = [
  { titel: "Echte Wirkung? Jeden Tag!", text: "Du hilfst Menschen dabei, sich selbstbewusster und wohler zu fühlen. Jede Behandlung macht einen direkten Unterschied im Leben unserer Kunden." },
  { titel: "Flexible Arbeitszeiten", text: "Arbeite in einem der modernsten Lounge-Konzepte Deutschlands mit flexiblen Schichten, die sich deinem Lebensstil anpassen." },
  { titel: "Modernste Medizintechnik", text: "Arbeite mit modernster Ausstattung für ästhetische Behandlungen – von Botox und Hyaluronfillern bis hin zu Mesotherapie und Vitamininfusionen – in erstklassigen Behandlungsräumen." },
  { titel: "Fortbildung & Entwicklung", text: "Regelmäßige Schulungen in neuesten Behandlungsmethoden und Zertifizierungen halten dich an der Spitze der ästhetischen Medizin." },
  { titel: "Attraktive Vergütung", text: "Wettbewerbsfähiges Gehalt plus erfolgsabhängige Boni und Mitarbeiterrabatte auf alle Behandlungen für dich und deine Familie." },
  { titel: "Professionelle Autonomie", text: "Du arbeitest eigenverantwortlich mit direktem Patientenkontakt und kannst deine medizinische Expertise voll entfalten." },
  { titel: "Herzliches Team", text: "Unser Motto: Professionell, zugänglich und menschlich. Wir schaffen eine Atmosphäre, in der sich sowohl Team als auch Kunden wohlfühlen." },
  { titel: "Team Events", text: "Regelmäßige Fortbildungen und Teamevents stärken unseren Zusammenhalt und erweitern dein berufliches Netzwerk." },
];

export const AUFGABEN: string[] = [
  "Du führst professionelle Botox- und Filler-Behandlungen durch und berätst Kunden zu den optimalen Behandlungsoptionen für ihre individuellen Wünsche.",
  "Du bietest Mesotherapie, PRP-Haartherapie und hochdosierte Vitamin-Infusionen an – immer mit höchsten Sicherheits- und Qualitätsstandards.",
  "Du sorgst für eine entspannte Atmosphäre in unseren Walk-in-Lounges und machst jeden Besuch zu einem positiven Erlebnis.",
  "Du dokumentierst Behandlungen sorgfältig und stellst sicher, dass alle medizinischen Standards eingehalten werden.",
  "Du arbeitest eigenverantwortlich und flexibel – perfekt für die spontanen Bedürfnisse unserer Kunden im Walk-in-Modell.",
  "Du hilfst beim Aufbau neuer Standorte mit und bringst deine Expertise in die Weiterentwicklung unseres Lounge-Konzepts ein.",
];

export const PROFIL: string[] = [
  "Du hast eine medizinische Ausbildung und Leidenschaft für ästhetische Medizin und Wellness.",
  "Du kommunizierst einfühlsam mit Kunden und schaffst Vertrauen durch deine professionelle, zugängliche Art.",
  "Du arbeitest gerne eigenständig und kannst flexibel auf spontane Walk-in-Kunden eingehen.",
  "Du erkennst individuelle Bedürfnisse und findest innovative Lösungen für Schönheits- und Wellness-Ziele.",
  "Du sprichst fließend Deutsch und hast idealerweise Erfahrung mit ästhetischen Behandlungen.",
  "Kein Muss, aber ein Vorteil: Erfahrung mit Vitamin-Therapien oder innovativen Wellness-Konzepten.",
];
