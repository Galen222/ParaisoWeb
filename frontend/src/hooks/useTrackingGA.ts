// useTrackingGA.ts
import ReactGA from "react-ga4";
import { useEffect } from "react"; // Asegúrate de incluir useEffect si se está utilizando
import { useCookieConsent } from "../contexts/CookieContext";

// Función para registrar una vista de página
export function useVisitedPageTrackingGA(currentPage: string) {
  const { cookieConsentAnalysisGoogle } = useCookieConsent();
  useEffect(() => {
    if (cookieConsentAnalysisGoogle) {
      ReactGA.send({ hitType: "pageview", page: "/" + currentPage, title: currentPage });
      console.log("Pagina " + window.location.pathname + window.location.search + " añadida a log de GA4");
    }
  }, [cookieConsentAnalysisGoogle, currentPage]);
}

// Función modificada para hacer seguimiento de clicks en botones
export function useButtonClickTrackingGA() {
  const { cookieConsentAnalysisGoogle } = useCookieConsent();

  return (usedButton: string): void => {
    console.log("pulsacion del boton boton " + usedButton + " registrada en ga4");
    if (cookieConsentAnalysisGoogle) {
      ReactGA.event({
        category: "Botón",
        action: "Pulsación",
        label: usedButton,
      });
    }
  };
}
