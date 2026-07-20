import { requirePublicApiUrl } from "./api.config";
import { parseCookieDeletionDomains } from "../utils/cookieDeletionConfig";
import { validateGoogleAnalyticsIdConfiguration } from "../utils/googleAnalyticsId";
import { normalizePublicSiteUrl } from "../utils/publicSiteUrl";
import { requireLoopbackSitemapApiUrl } from "../utils/sitemapApiUrl";

const REQUIRED_PUBLIC_API_VARIABLES = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_API_BLOG_URL",
  "NEXT_PUBLIC_API_CHARCUTERIA_URL",
  "NEXT_PUBLIC_API_CONTACTO_URL",
] as const;

const EXAMPLE_GOOGLE_MAPS_API_KEY = "cambiar_por_clave_publica_de_google_maps";
const EXAMPLE_RECAPTCHA_SITE_KEY = "cambiar_por_clave_publica_de_recaptcha";

/** Exige una clave pública real y evita que un ejemplo llegue al bundle del navegador. */
const requirePublicBrowserKey = (
  value: string | undefined,
  variableName: string,
  exampleValue: string
): string => {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    throw new Error(`La variable de entorno ${variableName} no está definida.`);
  }
  if (normalized === exampleValue) {
    throw new Error(
      `La variable de entorno ${variableName} debe sustituir el valor de ejemplo.`
    );
  }
  if (!/^[A-Za-z0-9_-]+$/u.test(normalized)) {
    throw new Error(
      `La variable de entorno ${variableName} solo admite letras, números, guion y guion bajo.`
    );
  }

  return normalized;
};

/**
 * Valida durante el arranque de Next.js toda configuración cuya ausencia provocaría
 * un fallo tardío en el navegador o degradaría silenciosamente una ruta pública.
 */
export const validateFrontendBuildEnvironment = (
  environment: NodeJS.ProcessEnv
): void => {
  normalizePublicSiteUrl(environment.NEXT_PUBLIC_SITE_URL ?? "");

  for (const variableName of REQUIRED_PUBLIC_API_VARIABLES) {
    requirePublicApiUrl(environment[variableName], variableName);
  }

  requireLoopbackSitemapApiUrl(
    requirePublicApiUrl(environment.SITEMAP_API_URL, "SITEMAP_API_URL")
  );

  parseCookieDeletionDomains(environment.NEXT_PUBLIC_COOKIE_DELETION_DOMAINS);

  requirePublicBrowserKey(
    environment.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
    EXAMPLE_GOOGLE_MAPS_API_KEY
  );
  requirePublicBrowserKey(
    environment.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
    EXAMPLE_RECAPTCHA_SITE_KEY
  );

  validateGoogleAnalyticsIdConfiguration(
    environment.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
  );
};
