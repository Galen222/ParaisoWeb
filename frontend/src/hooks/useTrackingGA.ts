import ReactGA from "react-ga4";
import { useEffect } from "react";
import { useCookieConsent } from "../contexts/CookieContext";

// Función para registrar una vista de página
export function useTrackingGA(currentPage: string) {
  const { cookieConsentAnalysisGoogle } = useCookieConsent();
  useEffect(() => {
    if (cookieConsentAnalysisGoogle) {
      ReactGA.send({ hitType: "pageview", page: currentPage });
      console.log("Pagina " + currentPage + " añadida a log de GA4");
    }
  }, [cookieConsentAnalysisGoogle, currentPage]);
}
