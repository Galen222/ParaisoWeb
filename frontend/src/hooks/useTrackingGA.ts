// hooks/useTrackingGA.ts

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useCookieConsent } from "../contexts/CookieContext";
import { sendGAButtonClick, sendGAPageView } from "../utils/gaUtils";

/**
 * Hook para registrar una vista de página en Google Analytics.
 * Se envía un evento de "pageview" solo si el usuario ha dado consentimiento para las cookies de análisis de Google.
 *
 * @param {string} currentPage - Nombre o ruta de la página actual para registrar en Google Analytics.
 */
export function useVisitedPageTrackingGA(currentPage: string) {
  const { cookieConsentAnalysisGoogle } = useCookieConsent(); // Verifica el consentimiento de cookies
  const router = useRouter();
  // Analytics no registra el fragmento, por lo que un cambio exclusivo de ancla
  // representa la misma página y no debe disparar otra vista duplicada.
  const routeWithoutHash = router.asPath.split("#", 1)[0];

  useEffect(() => {
    if (cookieConsentAnalysisGoogle) {
      // Registra la ruta real. Usar solo el alias de la página agrupaba todos los artículos
      // del blog bajo `/articulo` y perdía slug, locale y parámetros de consulta.
      const page = `${window.location.pathname}${window.location.search}`;
      sendGAPageView(page, currentPage);
      /* console.log("Página " + window.location.pathname + window.location.search + " añadida a log de GA4"); */
    }
  }, [cookieConsentAnalysisGoogle, currentPage, routeWithoutHash]); // Ignora cambios exclusivos de ancla
}

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
