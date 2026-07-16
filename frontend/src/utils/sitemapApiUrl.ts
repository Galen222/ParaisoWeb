const LOOPBACK_IPV4_PATTERN = /^127(?:\.\d{1,3}){3}$/;

/** Comprueba que cada octeto IPv4 esté dentro del rango permitido. */
const isValidLoopbackIpv4 = (hostname: string): boolean => {
  if (!LOOPBACK_IPV4_PATTERN.test(hostname)) return false;

  return hostname
    .split(".")
    .every((octet) => Number.parseInt(octet, 10) >= 0 && Number.parseInt(octet, 10) <= 255);
};

/**
 * Valida que una URL HTTP(S), previamente normalizada, apunte al loopback local.
 * El backend restringe el endpoint de datos del sitemap a ese origen.
 */
export const requireLoopbackSitemapApiUrl = (
  normalizedUrl: string,
  variableName = "SITEMAP_API_URL"
): string => {
  const hostname = new URL(normalizedUrl).hostname.toLowerCase();

  if (
    hostname !== "localhost" &&
    hostname !== "[::1]" &&
    !isValidLoopbackIpv4(hostname)
  ) {
    throw new Error(
      `La variable de entorno ${variableName} debe apuntar a una dirección loopback local.`
    );
  }

  return normalizedUrl;
};
