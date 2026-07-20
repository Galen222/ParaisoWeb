const DEFAULT_PUBLIC_SITE_URL = "https://www.paraisodeljamon.com";
const UNSUPPORTED_CONFIGURATION_CHARACTER_PATTERN = /[\p{C}\p{Z}]/u;
const containsUnsupportedConfigurationCharacter = (value: string): boolean =>
  Array.from(value).some(
    (character) =>
      character !== " " && UNSUPPORTED_CONFIGURATION_CHARACTER_PATTERN.test(character)
  );
const ABSOLUTE_HTTP_URL_PATTERN = /^https?:\/\/([^/?#]*)([^?#]*)/i;
const MAX_URL_DECODE_PASSES = 5;

/** Elimina únicamente espacios ASCII exteriores; otros separadores deben rechazarse. */
const trimAsciiSpaces = (value: string): string => value.replace(/^ +| +$/g, "");

/** Detecta hosts codificados y rutas que URL convertiría silenciosamente en otro origen. */
const hasUnsafeRawUrlSyntax = (value: string): boolean => {
  const match = ABSOLUTE_HTTP_URL_PATTERN.exec(value);
  if (!match) {
    return true;
  }

  const authority = match[1];
  let decodedPath = match[2] || "";
  if (authority.includes("%") || authority.includes("\\") || decodedPath.includes("\\")) {
    return true;
  }

  let decodingStabilized = false;
  for (let pass = 0; pass < MAX_URL_DECODE_PASSES; pass += 1) {
    if (/%(?![0-9A-Fa-f]{2})/.test(decodedPath)) {
      return true;
    }

    let nextPath: string;
    try {
      nextPath = decodeURIComponent(decodedPath);
    } catch {
      return true;
    }

    if (nextPath === decodedPath) {
      decodingStabilized = true;
      break;
    }
    decodedPath = nextPath;
  }

  if (!decodingStabilized) {
    return true;
  }

  return (
    containsUnsupportedConfigurationCharacter(decodedPath) ||
    decodedPath.includes("\\") ||
    decodedPath.includes("?") ||
    decodedPath.includes("#") ||
    decodedPath.split("/").some((segment) => segment === "." || segment === "..")
  );
};

/** Valida y normaliza el origen público usado en canonical, Open Graph y JSON-LD. */
export const normalizePublicSiteUrl = (
  value: string,
  variableName = "NEXT_PUBLIC_SITE_URL"
): string => {
  if (containsUnsupportedConfigurationCharacter(value)) {
    throw new Error(`${variableName} contiene caracteres de control no permitidos.`);
  }

  const configuredUrl = trimAsciiSpaces(value);
  if (!configuredUrl) {
    throw new Error(`La variable ${variableName} no está definida.`);
  }
  if (hasUnsafeRawUrlSyntax(configuredUrl)) {
    throw new Error(`${variableName} contiene una URL que se normalizaría de forma insegura.`);
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
    parsedUrl.port === "0" ||
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
  return configuredUrl === undefined || /^ *$/.test(configuredUrl)
    ? DEFAULT_PUBLIC_SITE_URL
    : normalizePublicSiteUrl(configuredUrl);
};

/** Exige que el origen público esté definido para endpoints que no deben usar un fallback. */
export const requireConfiguredPublicSiteUrl = (): string =>
  normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? "");
