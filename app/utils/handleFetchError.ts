export function handleFetchError(error: any, t?: (key: string) => string) {
  const statusCode = error?.statusCode || error?.status || 500;

  if (statusCode === 404) {
    throw handleNotFound(t);
  }

  throw createError({
    statusCode,
    statusMessage: t ? t("error.500.statusMessage") : "unexpected error",
    message: t ? t("error.500.message") : "",
    fatal: true,
  });
}

export function handleNotFound(t?: (key: string) => string) {
  throw createError({
    statusCode: 404,
    statusMessage: t ? t("error.404.statusMessage") : "page not found",
    message: t ? t("error.404.message") : "",
    fatal: true,
  });
}
