// hooks/useVisitedPageTracking.ts

import { useEffect } from "react";
import { useCookieConsent } from "../contexts/CookieContext";
import { getCookieValue, setClientCookie } from "../utils/cookieUtils";

const MAX_VISITED_PAGES = 25;
const MAX_VISITED_COOKIE_VALUE_LENGTH = 2048;

/** Decodifica valores nuevos y conserva cookies antiguas o parcialmente dañadas. */
const decodeVisitedPage = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/** Construye una lista única y acotada para no superar el límite habitual de cookies. */
const buildVisitedCookieValue = (pages: string[]): string => {
  const encodedPages = pages.map((page) => encodeURIComponent(page));
  const retainedPages: string[] = [];
  let retainedLength = 0;

  for (let index = encodedPages.length - 1; index >= 0; index -= 1) {
    const encodedPage = encodedPages[index];
    const additionalLength = encodedPage.length + (retainedPages.length > 0 ? 1 : 0);
    if (retainedPages.length >= MAX_VISITED_PAGES || retainedLength + additionalLength > MAX_VISITED_COOKIE_VALUE_LENGTH) {
      break;
    }
    retainedPages.unshift(encodedPage);
    retainedLength += additionalLength;
  }

  return retainedPages.join(",");
};

/**
 * Hook personalizado para rastrear las páginas visitadas por el usuario.
 * Agrega el nombre de la página a una cookie (`_visited`) si el usuario ha dado su consentimiento de análisis.
 *
 * @param {string} currentPage - Nombre o identificador de la página actual que se desea rastrear.
 */
export function useVisitedPageTracking(currentPage: string) {
  const { cookieConsentAnalysis } = useCookieConsent(); // Verifica el consentimiento para el análisis de cookies

  useEffect(() => {
    if (!cookieConsentAnalysis) {
      return;
    }

    /* console.log("El consentimiento de cookies de análisis ha sido aceptado."); */
    const normalizedCurrentPage = currentPage.trim();
    if (!normalizedCurrentPage) {
      return;
    }

    const visitedPageValue = getCookieValue("_visited"); // Obtiene el valor actual de la cookie '_visited'
    const pagesVisited = (visitedPageValue ? visitedPageValue.split(",") : [])
      .map(decodeVisitedPage)
      .map((page) => page.trim())
      .filter(Boolean);
    const uniquePagesVisited = Array.from(new Set(pagesVisited));

    if (uniquePagesVisited.includes(normalizedCurrentPage)) {
      /* console.log(`${normalizedCurrentPage} ya está incluida en la cookie '_visited'. No se harán cambios.`); */
      return;
    }

    const cookieValue = buildVisitedCookieValue([...uniquePagesVisited, normalizedCurrentPage]);
    setClientCookie("_visited", cookieValue, 31536000);
    /* console.log(`Se añadió ${normalizedCurrentPage} al valor de la cookie '_visited'.`); */
  }, [cookieConsentAnalysis, currentPage]); // Ejecuta el efecto cada vez que cambia el consentimiento o la página
}
