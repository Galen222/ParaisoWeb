import type { IncomingHttpHeaders } from "http";

interface CanonicalHostnameResult {
  configured: boolean;
  hostname: string | null;
}

/** Obtiene el hostname canónico y distingue una variable ausente de una configuración inválida. */
const getCanonicalHostname = (): CanonicalHostnameResult => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) {
    return { configured: false, hostname: null };
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
      return { configured: true, hostname: null };
    }

    return { configured: true, hostname: parsedUrl.hostname.toLowerCase() };
  } catch {
    return { configured: true, hostname: null };
  }
};

/** Obtiene el hostname de Host como alternativa segura únicamente para desarrollo local. */
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
  const canonicalHostname = getCanonicalHostname();
  const expectedHostname = canonicalHostname.configured
    ? canonicalHostname.hostname
    : getDirectRequestHostname(headers);

  if (!expectedHostname) {
    // Una variable canónica presente pero inválida debe fallar de forma segura; no se
    // reutiliza Host porque ocultaría un error de despliegue y volvería a confiar en la petición.
    return false;
  }

  return refererUrl.hostname.toLowerCase() === expectedHostname;
};
