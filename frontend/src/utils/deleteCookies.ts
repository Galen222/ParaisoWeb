// Importaciones necesarias para las funciones
import { IntlShape } from "react-intl";
import { toast, Slide } from "react-toastify";

// Función para borrar las cookies
// Función para borrar cookies que coincidan con un patrón
export const deleteCookies = (
  intl: IntlShape,
  setAcceptCookiePersonalization: (value: boolean) => void,
  cookieConsentAnalysis: boolean,
  setAcceptCookieAnalysis: (value: boolean) => void,
  setCookieConsentAnalysis: (value: boolean) => void,
  cookieConsentAnalysisGoogle: boolean,
  setAcceptCookieAnalysisGoogle: (value: boolean) => void,
  setCookieConsentAnalysisGoogle: (value: boolean) => void,
  cookieConsentPersonalization: boolean,
  setCookieConsentPersonalization: (value: boolean) => void
) => {
  try {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const [cookieName] = cookie.split("=");
      const domains = ["localhost", ".asuscomm.com"];

      if (cookieName === "_locale" && cookieConsentPersonalization) {
        setAcceptCookiePersonalization(false);
        setCookieConsentPersonalization(false);
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
      if ((cookieName === "_device" || cookieName === "_visited") && cookieConsentAnalysis) {
        setAcceptCookieAnalysis(false);
        setCookieConsentAnalysis(false);
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }

      if (cookieName.match(/^_ga($|_)/) && cookieConsentAnalysisGoogle) {
        setAcceptCookieAnalysisGoogle(false);
        setCookieConsentAnalysisGoogle(false);
        domains.forEach((domain) => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
          console.log(`Borrada cookie Google: ${cookieName} del dominio: ${domain}`);
        });
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

export const deleteCookieGA = () => {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [cookieName] = cookie.split("=");
    const domains = ["localhost", ".asuscomm.com"];
    domains.forEach((domain) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
      console.log(`Borrada cookie Google: ${cookieName} del dominio: ${domain}`);
    });
  }
};
