/** Límites de espera para evitar que la interfaz quede bloqueada indefinidamente. */
export const TOKEN_REQUEST_TIMEOUT_MS = 10000;
export const READ_REQUEST_TIMEOUT_MS = 15000;
export const CONTACT_REQUEST_TIMEOUT_MS = 120000;
export const DOWNLOAD_REQUEST_TIMEOUT_MS = 30000;

const UNSUPPORTED_CONFIGURATION_CHARACTER_PATTERN = /[\p{C}\p{Z}]/u;
const containsUnsupportedConfigurationCharacter = (value: string): boolean =>
  Array.from(value).some(
    (character) =>
      character !== " " && UNSUPPORTED_CONFIGURATION_CHARACTER_PATTERN.test(character)
  );
const ABSOLUTE_HTTP_URL_PATTERN = /^https?:\/\/([^/?#]*)([^?#]*)/i;
const MAX_URL_DECODE_PASSES = 5;

/** Elimina únicamente espacios ASCII exteriores; otros separadores pueden ocultar errores. */
const trimAsciiSpaces = (value: string): string => value.replace(/^ +| +$/g, "");

/** Detecta sintaxis que WHATWG URL convertiría silenciosamente en otro host o ruta. */
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

/**
 * Valida una URL pública usada también durante SSR y elimina barras finales.
 * Las rutas relativas funcionan en el navegador, pero fallan en getServerSideProps,
 * por lo que las APIs deben configurarse mediante una URL HTTP(S) absoluta.
 */
export const requirePublicApiUrl = (value: string | undefined, variableName: string): string => {
  const rawValue = value ?? "";
  if (containsUnsupportedConfigurationCharacter(rawValue)) {
    throw new Error(
      `La variable de entorno ${variableName} contiene caracteres de control no permitidos.`
    );
  }

  const trimmedValue = trimAsciiSpaces(rawValue);
  if (!trimmedValue) {
    throw new Error(`La variable de entorno ${variableName} no está definida.`);
  }
  if (hasUnsafeRawUrlSyntax(trimmedValue)) {
    throw new Error(
      `La variable de entorno ${variableName} contiene una URL que se normalizaría de forma insegura.`
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmedValue);
  } catch {
    throw new Error(`La variable de entorno ${variableName} no contiene una URL válida.`);
  }

  if (
    !["http:", "https:"].includes(parsedUrl.protocol) ||
    parsedUrl.username !== "" ||
    parsedUrl.password !== "" ||
    parsedUrl.port === "0" ||
    parsedUrl.search !== "" ||
    parsedUrl.hash !== ""
  ) {
    throw new Error(`La variable de entorno ${variableName} debe ser una URL HTTP(S) absoluta sin credenciales, query ni fragmento.`);
  }

  const normalizedPath = parsedUrl.pathname.replace(/\/+$/, "");
  return `${parsedUrl.origin}${normalizedPath}`;
};
