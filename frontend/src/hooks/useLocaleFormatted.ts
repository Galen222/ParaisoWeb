// hooks/useLocaleFormatted.js

import { useRouter } from "next/router";

/**
 * Hook personalizado para formatear el locale actual al formato requerido por SEO.
 * Convierte los códigos de idioma ('en', 'de', 'es') a formatos completos ('en_US', 'de_DE', 'es_ES').
 *
 * @returns {string} Locale formateado (por ejemplo, 'en_US', 'de_DE', 'es_ES').
 */
const useLocaleFormatted = () => {
  const router = useRouter();
  const { locale } = router;

  /**
   * Función para mapear el locale corto al formato completo requerido para SEO
   *
   * @returns {string} Locale formateado.
   */
  const formattedLocale = (() => {
    switch (locale) {
      case "en":
        return "en_US"; // Inglés de Estados Unidos
      case "de":
        return "de_DE"; // Alemán de Alemania
      case "es":
      default:
        return "es_ES"; // Español de España
    }
  })();

  return formattedLocale;
};

export default useLocaleFormatted;
