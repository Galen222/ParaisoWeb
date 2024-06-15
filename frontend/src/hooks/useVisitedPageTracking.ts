import { useEffect } from "react";
import { useCookieConsent } from "../context/CookieConsentContext";
import { getCookieValue } from "../utils/utils";

// Hook personalizado para rastrear páginas visitadas
export function useVisitedPageTracking(currentPage: string) {
  const { cookieConsent } = useCookieConsent();

  useEffect(() => {
    if (cookieConsent) {
      console.log("El consentimiento de cookies ha sido aceptado.");

      const visitedValue = getCookieValue("visited");
      if (visitedValue) {
        const pagesVisited = visitedValue.split(",");
        if (!pagesVisited.includes(currentPage)) {
          document.cookie = `visited=${pagesVisited.join(",")},${currentPage}; path=/; max-age=31536000; SameSite=Lax`;
          console.log(`Se añadió ${currentPage} al valor de la cookie 'visited'.`);
        } else {
          console.log(`${currentPage} ya está incluida en la cookie 'visited'. No se harán cambios.`);
        }
      } else {
        document.cookie = `visited=${currentPage}; path=/; max-age=31536000; SameSite=Lax`;
        console.log(`Cookie 'visited' creada con el valor de ${currentPage}.`);
      }
    } else {
      console.log("El consentimiento de cookies no ha sido aceptado.");
    }
  }, [cookieConsent, currentPage]);
}
