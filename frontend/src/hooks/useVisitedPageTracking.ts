// hooks/useVisitedPageTracking.ts

import { useEffect } from "react";
import { useCookieConsent } from "../contexts/CookieContext";
import { getCookieValue } from "../utils/cookieUtils";

/**
 * Hook personalizado para rastrear las páginas visitadas por el usuario.
 * Agrega el nombre de la página a una cookie (`_visited`) si el usuario ha dado su consentimiento de análisis.
 *
 * @param {string} currentPage - Nombre o identificador de la página actual que se desea rastrear.
 */
export function useVisitedPageTracking(currentPage: string) {
  const { cookieConsentAnalysis } = useCookieConsent(); // Verifica el consentimiento para el análisis de cookies

  useEffect(() => {
    if (cookieConsentAnalysis) {
      /* console.log("El consentimiento de cookies de análisis ha sido aceptado."); */

      const visitedPageValue = getCookieValue("_visited"); // Obtiene el valor actual de la cookie '_visited'
      if (visitedPageValue) {
        const pagesVisited = visitedPageValue.split(","); // Convierte el valor en un array de páginas visitadas
        if (!pagesVisited.includes(currentPage)) {
          // Si la página actual no está en la cookie, la añade
          document.cookie = `_visited=${pagesVisited.join(",")},${currentPage}; path=/; max-age=31536000; SameSite=Lax`;
          /* console.log(`Se añadió ${currentPage} al valor de la cookie '_visited'.`); */
        } else {
          /* console.log(`${currentPage} ya está incluida en la cookie '_visited'. No se harán cambios.`); */
        }
      } else {
        // Si no existe la cookie '_visited', la crea con el valor de la página actual
        document.cookie = `_visited=${currentPage}; path=/; max-age=31536000; SameSite=Lax`;
        /* console.log(`Cookie '_visited' creada con el valor de ${currentPage}.`); */
      }
    }
  }, [cookieConsentAnalysis, currentPage]); // Ejecuta el efecto cada vez que cambia el consentimiento o la página
}
