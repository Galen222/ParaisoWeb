// hooks/useLocaleFormatted.ts

import { useMemo } from "react";

/**
 * Hook personalizado para formatear el locale al formato requerido por next-seo y HTML lang.
 *
 * @param {string} locale - Locale actual (e.g., 'en', 'de', 'es').
 * @returns {string} - Locale formateado (e.g., 'en-US', 'de-DE', 'es-ES').
 */
const useLocaleFormatted = (locale: string): string => {
  /**
   * Convierte el locale corto al formato completo requerido por SEO y HTML lang.
   *
   * @param {string} locale - Locale actual (e.g., 'en', 'de', 'es').
   * @returns {string} - Locale formateado (e.g., 'en-US', 'de-DE', 'es-ES').
   */
  const formatLocale = (locale: string): string => {
    switch (locale) {
      case "en":
        return "en-US"; // Inglés de Estados Unidos
      case "de":
        return "de-DE"; // Alemán de Alemania
      case "es":
      default:
        return "es-ES"; // Español de España
    }
  };

  /**
   * useMemo para memorizar el valor formateado y recalcularlo solo cuando el locale cambia.
   */
  const formattedLocale = useMemo(() => formatLocale(locale), [locale]);

  return formattedLocale;
};

export default useLocaleFormatted;
