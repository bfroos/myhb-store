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
 * Was in HubSpot von Hand angelegt werden muss (Private App, Properties):
 * docs/hubspot-bewerbung-aerzte.md. Ohne diese Properties laufen die Requests
 * auf einen 400 ("Property ... does not exist").
 *
 * Das Portal hat kein HubSpot Professional, also keine Workflows. Deshalb
 * liegt beides hier im Code: Jenny wird Owner des Deals (HubSpot benachrichtigt
 * Owner von sich aus), und die Loeschfrist erledigt der Cron
 * server/api/cron/bewerber-loeschen.get.ts.
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
/**
 * Jenniffer Bauer (Recruiting), Owner jeder neuen Bewerbung. Ueber
 * NUXT_HUBSPOT_RECRUITING_OWNER_ID austauschbar, wenn das Recruiting wechselt.
 */
const DEFAULT_OWNER_ID = "39148340";

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
  ownerId: string;
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
    ownerId:
      ((config as any).hubspotRecruitingOwnerId as string | undefined) ||
      DEFAULT_OWNER_ID,
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
 * verknuepft mit dem Kontakt. Jenny ist Owner: Die Zuweisung loest HubSpots
 * eigene Benachrichtigung "Deal zugewiesen" aus, ein Workflow ist dafuer nicht
 * noetig.
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
          hubspot_owner_id: config.ownerId,
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

// ---------------------------------------------------------------------------
// Loeschfrist (Cron server/api/cron/bewerber-loeschen.get.ts)
// ---------------------------------------------------------------------------

/** Erkennt die Notizen, die createBewerbungsNotiz anlegt. */
const NOTIZ_KENNUNG = "<b>Bewerbung Arzt (Karriereseite)</b>";

export type FaelligerKontakt = {
  id: string;
  lifecyclestage: string | null;
  cvUrl: string | null;
};

/** Kontakte, deren `bewerbung_loeschdatum` heute oder frueher ist. */
export async function findeFaelligeBewerber(
  config: HubspotConfig,
  faelligBisMs: string,
  max: number,
): Promise<FaelligerKontakt[]> {
  const p = HUBSPOT_APPLICANT_PROPERTIES;
  const result = await hubspotFetch<{
    results?: Array<{ id: string; properties: Record<string, string | null> }>;
  }>(config, "/crm/v3/objects/contacts/search", {
    method: "POST",
    body: {
      filterGroups: [
        {
          filters: [
            { propertyName: p.loeschdatum, operator: "LTE", value: faelligBisMs },
          ],
        },
      ],
      properties: ["lifecyclestage", p.cvUrl],
      sorts: [{ propertyName: p.loeschdatum, direction: "ASCENDING" }],
      limit: max,
    },
  });

  return (result.results ?? []).map((kontakt) => ({
    id: kontakt.id,
    lifecyclestage: kontakt.properties.lifecyclestage ?? null,
    cvUrl: kontakt.properties[p.cvUrl] ?? null,
  }));
}

async function assoziierteIds(
  config: HubspotConfig,
  contactId: string,
  zu: "deals" | "notes",
): Promise<string[]> {
  const result = await hubspotFetch<{ results?: Array<{ toObjectId: number }> }>(
    config,
    `/crm/v4/objects/contacts/${contactId}/associations/${zu}?limit=500`,
  );
  return (result.results ?? []).map((r) => String(r.toObjectId));
}

async function batchRead(
  config: HubspotConfig,
  objekt: "deals" | "notes",
  ids: string[],
  properties: string[],
): Promise<Array<{ id: string; properties: Record<string, string | null> }>> {
  if (ids.length === 0) return [];
  const result = await hubspotFetch<{
    results?: Array<{ id: string; properties: Record<string, string | null> }>;
  }>(config, `/crm/v3/objects/${objekt}/batch/read`, {
    method: "POST",
    body: { properties, inputs: ids.map((id) => ({ id })) },
  });
  return result.results ?? [];
}

export type BewerbungsSpuren = {
  /** Deals der Recruiting-Pipeline mit ihrer Stage. */
  recruitingDeals: Array<{ id: string; stage: string }>;
  hatAndereDeals: boolean;
  /** Notizen aus createBewerbungsNotiz und ihre Anhaenge. */
  notizIds: string[];
  dateiIds: string[];
};

/** Alles, was am Kontakt von Bewerbungen stammt. */
export async function ladeBewerbungsSpuren(
  config: HubspotConfig,
  contactId: string,
): Promise<BewerbungsSpuren> {
  const deals = await batchRead(
    config,
    "deals",
    await assoziierteIds(config, contactId, "deals"),
    ["pipeline", "dealstage"],
  );
  const recruitingDeals = deals
    .filter((deal) => deal.properties.pipeline === config.pipelineId)
    .map((deal) => ({ id: deal.id, stage: deal.properties.dealstage ?? "" }));

  const notizen = (
    await batchRead(
      config,
      "notes",
      await assoziierteIds(config, contactId, "notes"),
      ["hs_note_body", "hs_attachment_ids"],
    )
  ).filter((notiz) => notiz.properties.hs_note_body?.startsWith(NOTIZ_KENNUNG));

  return {
    recruitingDeals,
    hatAndereDeals: deals.length > recruitingDeals.length,
    notizIds: notizen.map((notiz) => notiz.id),
    dateiIds: notizen.flatMap((notiz) =>
      (notiz.properties.hs_attachment_ids ?? "")
        .split(";")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  };
}

export async function loescheObjekt(
  config: HubspotConfig,
  objekt: "contacts" | "deals" | "notes",
  id: string,
): Promise<void> {
  await hubspotFetch(config, `/crm/v3/objects/${objekt}/${id}`, {
    method: "DELETE",
  });
}

export async function loescheDatei(
  config: HubspotConfig,
  fileId: string,
): Promise<void> {
  await hubspotFetch(config, `/files/v3/files/${fileId}`, { method: "DELETE" });
}

/**
 * Leert die Bewerbungs-Properties eines Kontakts, der bleibt (Bestandskundin).
 * Damit faellt er auch aus der naechsten Suche nach faelligen Bewerbern.
 */
export async function leereBewerbungsFelder(
  config: HubspotConfig,
  contactId: string,
): Promise<void> {
  const properties = Object.fromEntries(
    Object.values(HUBSPOT_APPLICANT_PROPERTIES).map((name) => [name, ""]),
  );
  await hubspotFetch(config, `/crm/v3/objects/contacts/${contactId}`, {
    method: "PATCH",
    body: { properties },
  });
}
