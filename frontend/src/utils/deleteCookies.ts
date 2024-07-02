// Importaciones necesarias para las funciones
import { IntlShape } from "react-intl";
import { toast, Slide } from "react-toastify";

// Función para borrar las cookies
// Función para borrar cookies que coincidan con un patrón
export const deleteCookies = (
  intl: IntlShape,
  cookieConsentAnalysis: boolean,
  setCookieConsentAnalysis: (value: boolean) => void,
  cookieConsentAnalysisGoogle: boolean,
  setCookieConsentAnalysisGoogle: (value: boolean) => void,
  cookieConsentPersonalization: boolean,
  setCookieConsentPersonalization: (value: boolean) => void
) => {
  try {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const [cookieName] = cookie.split("=");
      if (cookieName === "_locale" && cookieConsentPersonalization) {
        setCookieConsentPersonalization(false);
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
      if ((cookieName === "_device" || cookieName === "_visited") && cookieConsentAnalysis) {
        setCookieConsentAnalysis(false);
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
      // Borra todas las cookies que comiencen con "_ga" incluyendo las con sufijos variables como "_ga_XXXXX"
      if (cookieName.match(/^_ga($|_)/) && cookieConsentAnalysisGoogle) {
        setCookieConsentAnalysisGoogle(false);
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        console.log(`Borrada cookie Google: ${cookieName}`);
      }
    }
    toast.success(intl.formatMessage({ id: "cookie_Borrado_Ok" }), {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    });
  } catch (error) {
    toast.error(intl.formatMessage({ id: "cookie_Borrado_Error" }), {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    });
  }
};
