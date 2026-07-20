/** Dominio de cookie permitido, con punto inicial opcional y sin protocolo, puerto ni ruta. */
const COOKIE_DOMAIN_PATTERN = /^\.?[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

/** Convierte la variable pública en dominios de borrado validados y sin duplicados. */
export const parseCookieDeletionDomains = (rawValue: string | undefined): string[] => {
  const configuredValue = rawValue?.trim() ?? "";
  if (!configuredValue) {
    throw new Error("NEXT_PUBLIC_COOKIE_DELETION_DOMAINS no está definida");
  }

  const domains: string[] = [];
  for (const rawDomain of configuredValue.split(",")) {
    const configuredDomain = rawDomain.trim().toLowerCase();
    if (!COOKIE_DOMAIN_PATTERN.test(configuredDomain)) {
      throw new Error(`Dominio de cookie no válido: ${configuredDomain || "(vacío)"}`);
    }

    // RFC 6265 ignora el punto inicial de Domain; normalizarlo evita intentos duplicados.
    const domain = configuredDomain.replace(/^\./, "");
    if (!domains.includes(domain)) {
      domains.push(domain);
    }
  }

  return domains;
};

/** Obtiene durante la compilación de Next.js los dominios donde deben caducarse las cookies. */
export const getConfiguredCookieDeletionDomains = (): string[] =>
  parseCookieDeletionDomains(process.env.NEXT_PUBLIC_COOKIE_DELETION_DOMAINS);
