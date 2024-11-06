// hooks/useTrackingGA.ts

import ReactGA from "react-ga4";
import { useEffect } from "react";
import { useCookieConsent } from "../contexts/CookieContext";

/**
 * Hook para registrar una vista de página en Google Analytics.
 * Se envía un evento de "pageview" solo si el usuario ha dado consentimiento para las cookies de análisis de Google.
 *
 * @param {string} currentPage - Nombre o ruta de la página actual para registrar en Google Analytics.
 */
export function useVisitedPageTrackingGA(currentPage: string) {
  const { cookieConsentAnalysisGoogle } = useCookieConsent(); // Verifica el consentimiento de cookies

  useEffect(() => {
    if (cookieConsentAnalysisGoogle) {
      // Enviar evento de vista de página a GA4
      ReactGA.send({ hitType: "pageview", page: "/" + currentPage, title: currentPage });
      /* console.log("Página " + window.location.pathname + window.location.search + " añadida a log de GA4"); */
    }
  }, [cookieConsentAnalysisGoogle, currentPage]); // Ejecuta el efecto cuando cambia el consentimiento o la página
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
      // Enviar evento de clic en botón a GA4
      ReactGA.event({
        category: "Botón",
        action: "Pulsado " + usedButton,
        label: usedButton,
      });
    }
  };
}
