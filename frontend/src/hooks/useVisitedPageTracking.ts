import { useEffect } from "react";
import { useCookieConsent } from "../context/CookieContext";
import { getCookieValue } from "../utils/utils";

// Hook personalizado para rastrear páginas visitadas
export function useVisitedPageTracking(currentPage: string) {
  const { cookieConsentAnalysis } = useCookieConsent();

  useEffect(() => {
    if (cookieConsentAnalysis) {
      console.log("El consentimiento de cookies de analisis ha sido aceptado.");

      const visitedPageValue = getCookieValue("_visited");
      if (visitedPageValue) {
        const pagesVisited = visitedPageValue.split(",");
        if (!pagesVisited.includes(currentPage)) {
          document.cookie = `_visited=${pagesVisited.join(",")},${currentPage}; path=/; max-age=31536000; SameSite=Lax`;
          console.log(`Se añadió ${currentPage} al valor de la cookie '_visited'.`);
        } else {
          console.log(`${currentPage} ya está incluida en la cookie '_visited'. No se harán cambios.`);
        }
      } else {
        document.cookie = `_visited=${currentPage}; path=/; max-age=31536000; SameSite=Lax`;
        console.log(`Cookie '_visited' creada con el valor de ${currentPage}.`);
      }
    } else {
      console.log("El consentimiento de cookies de analisis no ha sido aceptado.");
    }
  }, [cookieConsentAnalysis, currentPage]);
}
