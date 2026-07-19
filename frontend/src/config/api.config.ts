/** Límites de espera para evitar que la interfaz quede bloqueada indefinidamente. */
export const TOKEN_REQUEST_TIMEOUT_MS = 10000;
export const READ_REQUEST_TIMEOUT_MS = 15000;
export const CONTACT_REQUEST_TIMEOUT_MS = 120000;
export const DOWNLOAD_REQUEST_TIMEOUT_MS = 30000;

const RAW_URL_CONTROL_PATTERN = /[\p{C}\p{Zl}\p{Zp}]/u;

/**
 * Valida una URL pública usada también durante SSR y elimina barras finales.
 * Las rutas relativas funcionan en el navegador, pero fallan en getServerSideProps,
 * por lo que las APIs deben configurarse mediante una URL HTTP(S) absoluta.
 */
export const requirePublicApiUrl = (value: string | undefined, variableName: string): string => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) {
    throw new Error(`La variable de entorno ${variableName} no está definida.`);
  }
  if (RAW_URL_CONTROL_PATTERN.test(trimmedValue)) {
    throw new Error(
      `La variable de entorno ${variableName} contiene caracteres de control no permitidos.`
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
