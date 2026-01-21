type NewsletterRequestBody = {
  email?: string;
  marketingSource?: string;
};

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = (config as any).mailchimpApiKey as string | undefined;
  const listId = (config as any).mailchimpListId as string | undefined;
  const serverPrefix =
    ((config as any).mailchimpServerPrefix as string | undefined) ||
    apiKey?.split("-")[1];
  const tagsRaw = (config as any).mailchimpTags as string | undefined;

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage:
        "Missing server runtimeConfig: mailchimpApiKey (set NUXT_MAILCHIMP_API_KEY)",
    });
  }

  if (!listId) {
    throw createError({
      statusCode: 500,
      statusMessage:
        "Missing server runtimeConfig: mailchimpListId (set NUXT_MAILCHIMP_LIST_ID)",
    });
  }

  if (!serverPrefix) {
    throw createError({
      statusCode: 500,
      statusMessage:
        "Missing server runtimeConfig: mailchimpServerPrefix (set NUXT_MAILCHIMP_SERVER_PREFIX)",
    });
  }

  const body = (await readBody(event)) as NewsletterRequestBody | null;
  const email = body?.email?.trim().toLowerCase() || "";
  const marketingSource = body?.marketingSource?.trim() || "";

  if (!email || !isValidEmail(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ungültige E-Mail-Adresse",
    });
  }

  const merge_fields: Record<string, string> = {};
  if (marketingSource) {
    merge_fields.MARSOURCE = marketingSource;
  }

  const tags = (tagsRaw || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`;

  try {
    await $fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString(
          "base64"
        )}`,
      },
      body: {
        email_address: email,
        status: "pending",
        ...(Object.keys(merge_fields).length ? { merge_fields } : {}),
        ...(tags.length ? { tags } : {}),
      },
    });
  } catch (error: any) {
    const detail = error?.data?.detail as string | undefined;
    if (detail?.toLowerCase().includes("member exists")) {
      return { status: "exists" };
    }

    throw createError({
      statusCode: 502,
      statusMessage: `Mailchimp API error${detail ? `: ${detail}` : ""}`,
    });
  }

  return { status: "pending" };
});
