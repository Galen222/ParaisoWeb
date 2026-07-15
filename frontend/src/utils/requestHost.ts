import type { IncomingHttpHeaders } from "http";

/** Obtiene el hostname canónico configurado para la web, cuando es válido. */
const getCanonicalHostname = (): string | null => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) {
    return null;
  }

  try {
    return new URL(siteUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
};

/** Obtiene el hostname de Host como alternativa segura para desarrollo local. */
const getDirectRequestHostname = (headers: IncomingHttpHeaders): string | null => {
  const rawHost = headers.host?.trim();
  if (!rawHost) {
    return null;
  }

  try {
    return new URL(`http://${rawHost}`).hostname.toLowerCase();
  } catch {
    return null;
  }
};

/** Compara el referer con el host canónico sin confiar en cabeceras reenviadas del cliente. */
export const isSameRequestHost = (refererUrl: URL, headers: IncomingHttpHeaders): boolean => {
  // NEXT_PUBLIC_SITE_URL es la fuente de verdad en producción y evita que un cliente
  // pueda falsificar X-Forwarded-Host para presentar un referer externo como interno.
  const expectedHostname = getCanonicalHostname() ?? getDirectRequestHostname(headers);
  if (!expectedHostname) {
    // Sin un host verificable no se puede demostrar que el referer sea interno.
    return false;
  }

  return refererUrl.hostname.toLowerCase() === expectedHostname;
};
