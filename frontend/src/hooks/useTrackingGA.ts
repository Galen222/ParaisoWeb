// hooks/useTrackingGA.ts

import { useCookieConsent } from "../contexts/CookieContext";
import { sendGAButtonClick } from "../utils/gaUtils";

// Las vistas de página las registra GA4 mediante la medición automática de cambios
// del historial. Enviarlas también desde React duplicaba cada navegación de Next.js.

/**
 * Hook para hacer seguimiento de clics en botones en Google Analytics.
 * Retorna una función que registra el clic en un botón especificado si el consentimiento para análisis de Google está activo.
 *
 * @returns {(usedButton: string) => void} - Función para registrar el clic en el botón con el nombre `usedButton`.
 */
export function useButtonClickTrackingGA(): (usedButton: string) => void {
  const { cookieConsentAnalysisGoogle } = useCookieConsent(); // Verifica el consentimiento de cookies

  return (usedButton: string): void => {
    /* console.log("Pulsación del botón " + usedButton + " registrada en GA4"); */
    if (cookieConsentAnalysisGoogle) {
      // Enviar evento de clic en botón a GA4 únicamente si la inicialización terminó correctamente.
      sendGAButtonClick(usedButton);
    }
  };
}
