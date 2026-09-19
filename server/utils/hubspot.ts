/**
 * HubSpot-Anbindung fuer das Bewerbungsformular Aerzte (bfroos/myhb-store#102).
 *
 * Bewusst kein eingebettetes HubSpot-Formular: Das Formular gehoert ins
 * Seitendesign, `career_apply` soll aus unserem eigenen Code feuern und der
 * Lebenslauf soll nicht durch ein Drittanbieter-Script laufen, das vor dem
 * Consent-Banner laedt. Die Bewerbung geht deshalb serverseitig mit einem
 * Private-App-Token an die CRM-API.
 *
 * Diese Datei kennt nur HubSpot. Validierung und Formularlogik stehen in
 * server/api/karriere/bewerbung.post.ts.
 *
 * Was in HubSpot von Hand angelegt werden muss — Properties, Workflow fuer die
 * Benachrichtigung an Jenny, Loeschfrist fuer Bewerberdaten:
 * docs/hubspot-bewerbung-aerzte.md. Ohne diese Properties laufen die Requests
 * auf einen 400 ("Property ... does not exist").
 */

const HUBSPOT_API_BASE = "https://api.hubapi.com";

/**
 * Pipeline "Recruiting" und ihre erste Stage im Portal 148248537. Das Ticket
 * verlangt eine eigene Pipeline "Bewerber Arzt" — die Recruiting-Pipeline gibt
 * es aber schon, mit genau den passenden Stages (Bewerbung eingegangen →
 * Kontaktiert → Erstgespraech → … → Absage). Eine zweite Pipeline waere
 * Doppelpflege; dass es eine Arzt-Bewerbung ist, steht an der Bewerbung selbst
 * (`bewerbung_quelle`) und im Deal-Namen.
 *
 * Ueber Env ueberschreibbar, damit ein Test-Portal nicht in die echte Pipeline
 * schreibt.
 */
const DEFAULT_PIPELINE_ID = "3858382020";
const DEFAULT_STAGE_ID = "5463910623"; // "Bewerbung eingegangen"
const DEFAULT_PORTAL_ID = "148248537";
const DEFAULT_UI_DOMAIN = "app-eu1.hubspot.com";

/** Ordner im HubSpot File Manager, in dem die Lebenslaeufe landen. */
const CV_FOLDER_PATH = "/bewerbungen/aerzte";

/**
 * HubSpot-Association-Typen (HUBSPOT_DEFINED). Die IDs sind portaluebergreifend
 * fest vergeben, deshalb stehen sie hier als Konstanten.
 */
const ASSOCIATION_DEAL_TO_CONTACT = 3;
const ASSOCIATION_NOTE_TO_CONTACT = 202;
const ASSOCIATION_NOTE_TO_DEAL = 214;

/**
 * Namen der Custom-Properties am Kontakt. Wer sie in HubSpot anders nennt,
 * aendert sie hier — nur an dieser Stelle.
 */
export const HUBSPOT_APPLICANT_PROPERTIES = {
  ausbildungsstand: "bewerbung_ausbildungsstand",
  wunschstandort: "bewerbung_wunschstandort",
  cvUrl: "bewerbung_cv_url",
  cvDateiname: "bewerbung_cv_dateiname",
  eingegangenAm: "bewerbung_eingegangen_am",
  loeschdatum: "bewerbung_loeschdatum",
  datenschutzZugestimmtAm: "bewerbung_datenschutz_zugestimmt_am",
  quelle: "bewerbung_quelle",
} as const;

/** DSGVO: Bewerberdaten werden sechs Monate nach Eingang geloescht. */
export const BEWERBER_AUFBEWAHRUNG_MONATE = 6;

export type HubspotConfig = {
  token: string;
  pipelineId: string;
  stageId: string;
  portalId: string;
  uiDomain: string;
};

/**
 * Liest die HubSpot-Zugangsdaten aus der runtimeConfig. Wirft, wenn das Token
 * fehlt — ohne Token gibt es keinen sinnvollen Teilbetrieb, die Bewerbung waere
 * sonst still verloren.
 */
export function getHubspotConfig(): HubspotConfig {
  const config = useRuntimeConfig();
  const token = (config as any).hubspotPrivateAppToken as string | undefined;

  if (!token) {
    throw createError({
      statusCode: 500,
      statusMessage:
        "Missing server runtimeConfig: hubspotPrivateAppToken (set NUXT_HUBSPOT_PRIVATE_APP_TOKEN)",
    });
  }

  return {
    token,
    pipelineId:
      ((config as any).hubspotRecruitingPipelineId as string | undefined) ||
      DEFAULT_PIPELINE_ID,
    stageId:
      ((config as any).hubspotRecruitingStageId as string | undefined) ||
      DEFAULT_STAGE_ID,
    portalId:
      ((config as any).hubspotPortalId as string | undefined) ||
      DEFAULT_PORTAL_ID,
    uiDomain:
      ((config as any).hubspotUiDomain as string | undefined) ||
      DEFAULT_UI_DOMAIN,
  };
}

/**
 * Duenner Wrapper um die HubSpot-API. Fehlermeldungen von HubSpot gehen ins
 * Server-Log, nach aussen geht nur ein 502 — HubSpot-Antworten koennen
 * Property-Namen und Portal-Interna enthalten.
 */
async function hubspotFetch<T>(
  config: HubspotConfig,
  path: string,
  options: { method?: string; body?: unknown; formData?: FormData } = {},
): Promise<T> {
  const { method = "GET", body, formData } = options;

  try {
    return await $fetch<T>(`${HUBSPOT_API_BASE}${path}`, {
      method: method as any,
      headers: { Authorization: `Bearer ${config.token}` },
      ...(formData ? { body: formData } : {}),
      ...(body ? { body } : {}),
    });
  } catch (error: any) {
    const message =
      error?.data?.message || error?.message || "Unbekannter HubSpot-Fehler";
    console.error(`[hubspot] ${method} ${path} fehlgeschlagen: ${message}`);
    throw createError({
      statusCode: 502,
      statusMessage: "HubSpot API error",
    });
  }
}

/** HubSpot-Datumsfelder erwarten YYYY-MM-DD (UTC). */
function toHubspotDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Eingang + Aufbewahrungsfrist → Loeschdatum. */
export function berechneLoeschdatum(eingang: Date): Date {
  const loeschdatum = new Date(eingang);
  loeschdatum.setUTCMonth(
    loeschdatum.getUTCMonth() + BEWERBER_AUFBEWAHRUNG_MONATE,
  );
  return loeschdatum;
}

export type CvUploadResult = {
  fileId: string;
  /**
   * Deep-Link in den File Manager statt der rohen Datei-URL: Die Datei liegt
   * als PRIVATE im Portal, eine direkte URL waere ohne Signatur nicht abrufbar.
   * Angemeldete HubSpot-Nutzerinnen oeffnen sie ueber diesen Link.
   */
  portalUrl: string;
  fileName: string;
};

/**
 * Laedt den Lebenslauf in den File Manager. Zugriff PRIVATE — Bewerbungs-
 * unterlagen duerfen nicht unter einer erratbaren oeffentlichen URL liegen.
 */
export async function uploadCv(
  config: HubspotConfig,
  file: { data: Buffer; filename: string; type?: string },
): Promise<CvUploadResult> {
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([new Uint8Array(file.data)], {
      type: file.type || "application/octet-stream",
    }),
    file.filename,
  );
  formData.append("folderPath", CV_FOLDER_PATH);
  formData.append(
    "options",
    JSON.stringify({
      access: "PRIVATE",
      overwrite: false,
      duplicateValidationStrategy: "NONE",
      duplicateValidationScope: "ENTIRE_PORTAL",
    }),
  );

  const result = await hubspotFetch<{ id: string; name?: string }>(
    config,
    "/files/v3/files",
    { method: "POST", formData },
  );

  return {
    fileId: result.id,
    portalUrl: `https://${config.uiDomain}/files/${config.portalId}/?fileId=${result.id}`,
    fileName: result.name || file.filename,
  };
}

export type BewerbungsDaten = {
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  ausbildungsstand: string;
  ausbildungsstandLabel: string;
  wunschstandort: string;
  nachricht: string;
  quelle: string;
  eingegangenAm: Date;
  cv: CvUploadResult | null;
  /** Gesetzt, wenn der Upload scheiterte — steht dann in der Notiz. */
  cvFehler: string | null;
};

/**
 * Legt den Kontakt an oder aktualisiert ihn. Bewusst ein Upsert ueber die
 * E-Mail: Wer sich zweimal bewirbt, soll kein zweiter Kontakt werden.
 *
 * `lifecyclestage` bleibt absichtlich unangetastet — eine bestehende Kundin,
 * die sich bewirbt, darf im CRM nicht vom Kunden zum Lead zurueckgestuft
 * werden. Dass es eine Bewerbung ist, traegt der Deal in der
 * Recruiting-Pipeline.
 */
export async function upsertBewerberKontakt(
  config: HubspotConfig,
  daten: BewerbungsDaten,
): Promise<string> {
  const p = HUBSPOT_APPLICANT_PROPERTIES;
  const properties: Record<string, string> = {
    email: daten.email,
    firstname: daten.vorname,
    lastname: daten.nachname,
    phone: daten.telefon,
    [p.ausbildungsstand]: daten.ausbildungsstand,
    [p.wunschstandort]: daten.wunschstandort,
    [p.quelle]: daten.quelle,
    [p.eingegangenAm]: toHubspotDate(daten.eingegangenAm),
    [p.datenschutzZugestimmtAm]: toHubspotDate(daten.eingegangenAm),
    [p.loeschdatum]: toHubspotDate(berechneLoeschdatum(daten.eingegangenAm)),
  };

  if (daten.cv) {
    properties[p.cvUrl] = daten.cv.portalUrl;
    properties[p.cvDateiname] = daten.cv.fileName;
  }

  const search = await hubspotFetch<{ results?: Array<{ id: string }> }>(
    config,
    "/crm/v3/objects/contacts/search",
    {
      method: "POST",
      body: {
        filterGroups: [
          {
            filters: [
              { propertyName: "email", operator: "EQ", value: daten.email },
            ],
          },
        ],
        properties: ["email"],
        limit: 1,
      },
    },
  );

  const existingId = search.results?.[0]?.id;

  if (existingId) {
    await hubspotFetch(config, `/crm/v3/objects/contacts/${existingId}`, {
      method: "PATCH",
      body: { properties },
    });
    return existingId;
  }

  const created = await hubspotFetch<{ id: string }>(
    config,
    "/crm/v3/objects/contacts",
    { method: "POST", body: { properties } },
  );
  return created.id;
}

/**
 * Legt den Deal in der Recruiting-Pipeline an, Stage "Bewerbung eingegangen",
 * verknuepft mit dem Kontakt. An dieser Deal-Erstellung haengt der Workflow,
 * der Jenny benachrichtigt (siehe docs/hubspot-bewerbung-aerzte.md).
 */
export async function createBewerbungsDeal(
  config: HubspotConfig,
  contactId: string,
  daten: BewerbungsDaten,
): Promise<string> {
  const deal = await hubspotFetch<{ id: string }>(
    config,
    "/crm/v3/objects/deals",
    {
      method: "POST",
      body: {
        properties: {
          dealname: `Bewerbung Arzt — ${daten.vorname} ${daten.nachname}`,
          pipeline: config.pipelineId,
          dealstage: config.stageId,
        },
        associations: [
          {
            to: { id: contactId },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: ASSOCIATION_DEAL_TO_CONTACT,
              },
            ],
          },
        ],
      },
    },
  );
  return deal.id;
}

/**
 * Notiz mit allen Formularfeldern, am Kontakt und am Deal. Der Lebenslauf
 * haengt als Anhang dran — so liegt die vollstaendige Bewerbung im Verlauf und
 * niemand muss sich die Felder aus dem Kontakt zusammensuchen.
 */
export async function createBewerbungsNotiz(
  config: HubspotConfig,
  contactId: string,
  dealId: string,
  daten: BewerbungsDaten,
): Promise<void> {
  const zeilen = [
    "<b>Bewerbung Arzt (Karriereseite)</b>",
    `Name: ${daten.vorname} ${daten.nachname}`,
    `E-Mail: ${daten.email}`,
    `Telefon: ${daten.telefon}`,
    `Ausbildungsstand: ${daten.ausbildungsstandLabel}`,
    `Wunschstandort: ${daten.wunschstandort}`,
    `Quelle: ${daten.quelle}`,
    daten.nachricht ? `Nachricht: ${daten.nachricht}` : null,
    daten.cv ? `Lebenslauf: ${daten.cv.fileName}` : null,
    daten.cvFehler
      ? `<b>Lebenslauf konnte nicht gespeichert werden (${daten.cvFehler}) — bitte bei der Bewerberin/dem Bewerber nachfordern.</b>`
      : null,
    `Loeschdatum nach ${BEWERBER_AUFBEWAHRUNG_MONATE} Monaten: ${toHubspotDate(
      berechneLoeschdatum(daten.eingegangenAm),
    )}`,
  ].filter(Boolean);

  await hubspotFetch(config, "/crm/v3/objects/notes", {
    method: "POST",
    body: {
      properties: {
        hs_timestamp: daten.eingegangenAm.toISOString(),
        hs_note_body: zeilen.join("<br>"),
        ...(daten.cv ? { hs_attachment_ids: daten.cv.fileId } : {}),
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: ASSOCIATION_NOTE_TO_CONTACT,
            },
          ],
        },
        {
          to: { id: dealId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: ASSOCIATION_NOTE_TO_DEAL,
            },
          ],
        },
      ],
    },
  });
}
