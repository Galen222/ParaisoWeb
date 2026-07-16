const DEFAULT_PUBLIC_SITE_URL = "https://www.paraisodeljamon.com";

/** Valida y normaliza el origen público usado en canonical, Open Graph y JSON-LD. */
export const normalizePublicSiteUrl = (
  value: string,
  variableName = "NEXT_PUBLIC_SITE_URL"
): string => {
  const configuredUrl = value.trim();
  if (!configuredUrl) {
    throw new Error(`La variable ${variableName} no está definida.`);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(configuredUrl);
  } catch {
    throw new Error(`${variableName} debe ser una URL HTTP(S) válida.`);
  }

  if (
    !["http:", "https:"].includes(parsedUrl.protocol) ||
    parsedUrl.username !== "" ||
    parsedUrl.password !== "" ||
    parsedUrl.pathname !== "/" ||
    parsedUrl.search !== "" ||
    parsedUrl.hash !== ""
  ) {
    throw new Error(`${variableName} debe contener únicamente el origen HTTP(S) canónico.`);
  }

  return parsedUrl.origin;
};

/** Devuelve el origen público configurado o el dominio canónico histórico si no existe la variable. */
export const getPublicSiteUrl = (): string => {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return configuredUrl === undefined || configuredUrl.trim() === ""
    ? DEFAULT_PUBLIC_SITE_URL
    : normalizePublicSiteUrl(configuredUrl);
};

/** Exige que el origen público esté definido para endpoints que no deben usar un fallback. */
export const requireConfiguredPublicSiteUrl = (): string =>
  normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? "");
