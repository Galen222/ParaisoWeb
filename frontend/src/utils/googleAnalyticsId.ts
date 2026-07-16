const GOOGLE_ANALYTICS_ID_PATTERN = /^G-[A-Z0-9]+$/;
const EXAMPLE_GOOGLE_ANALYTICS_ID = "G-XXXXXXXXXX";

/**
 * Normaliza el identificador público de GA4 y descarta valores ausentes,
 * de ejemplo o con un formato que ReactGA no puede utilizar correctamente.
 */
export const normalizeGoogleAnalyticsId = (value: string | undefined): string | null => {
  const normalized = value?.trim().toUpperCase();
  if (
    !normalized ||
    normalized === EXAMPLE_GOOGLE_ANALYTICS_ID ||
    !GOOGLE_ANALYTICS_ID_PATTERN.test(normalized)
  ) {
    return null;
  }

  return normalized;
};
