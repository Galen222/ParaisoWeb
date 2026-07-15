import type { IncomingHttpHeaders } from "http";

interface CanonicalOriginResult {
  configured: boolean;
  origin: string | null;
}

/** Obtiene el origen canónico y distingue una variable ausente de una configuración inválida. */
const getCanonicalOrigin = (): CanonicalOriginResult => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) {
    return { configured: false, origin: null };
  }

  try {
    const parsedUrl = new URL(siteUrl);
    const hasUnsupportedParts =
      !["http:", "https:"].includes(parsedUrl.protocol) ||
      Boolean(parsedUrl.username) ||
      Boolean(parsedUrl.password) ||
      (parsedUrl.pathname !== "/" && parsedUrl.pathname !== "") ||
      Boolean(parsedUrl.search) ||
      Boolean(parsedUrl.hash);

    if (hasUnsupportedParts || !parsedUrl.hostname) {
      return { configured: true, origin: null };
    }

    return { configured: true, origin: parsedUrl.origin.toLowerCase() };
  } catch {
    return { configured: true, origin: null };
  }
};

/** Obtiene host y puerto de Host como alternativa segura únicamente para desarrollo local. */
const getDirectRequestHost = (headers: IncomingHttpHeaders): string | null => {
  const rawHost = headers.host?.trim();
  if (!rawHost) {
    return null;
  }

  try {
    const parsedUrl = new URL(`http://${rawHost}`);
    if (
      parsedUrl.username ||
      parsedUrl.password ||
      parsedUrl.pathname !== "/" ||
      parsedUrl.search ||
      parsedUrl.hash
    ) {
      return null;
    }
    return parsedUrl.host.toLowerCase();
  } catch {
    return null;
  }
};

/** Compara el referer con el origen canónico sin confiar en cabeceras reenviadas del cliente. */
export const isSameRequestHost = (refererUrl: URL, headers: IncomingHttpHeaders): boolean => {
  // NEXT_PUBLIC_SITE_URL es la fuente de verdad en producción y evita que un cliente
  // pueda falsificar X-Forwarded-Host para presentar un referer externo como interno.
  const canonicalOrigin = getCanonicalOrigin();
  if (canonicalOrigin.configured) {
    if (!canonicalOrigin.origin) {
      // Una variable canónica presente pero inválida debe fallar de forma segura; no se
      // reutiliza Host porque ocultaría un error de despliegue y volvería a confiar en la petición.
      return false;
    }

    // El protocolo y el puerto forman parte del origen. Comparar solo el hostname permitía
    // que otra aplicación del mismo dominio se confundiera con una navegación interna.
    return refererUrl.origin.toLowerCase() === canonicalOrigin.origin;
  }

  const expectedHost = getDirectRequestHost(headers);

  if (!expectedHost) {
    return false;
  }

  // Sin URL canónica no se conoce el protocolo visto por el navegador detrás de un proxy,
  // pero el puerto de Host sí debe coincidir para no mezclar aplicaciones locales distintas.
  return refererUrl.host.toLowerCase() === expectedHost;
};
