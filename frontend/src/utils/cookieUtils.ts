// Importaciones necesarias para las funciones
import { IntlShape } from "react-intl";
import { toast, Slide } from "react-toastify";
import { disableGA } from "@/utils/gaUtils";

// Función para obtener el valor de una cookie especificada por nombre
export const getCookieValue = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";")[0];
  }
  return undefined;
};

// Funcion para crear la cookie de analisis de tipo de dispositivo
export const createDeviceCookie = () => {
  const deviceInfo = {
    deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "Tablet-Mobile" : "PC",
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
  };
  document.cookie = `_device=${JSON.stringify(deviceInfo)}; path=/; max-age=31536000; SameSite=Lax`;
};

// Función para borrar cookies que coincidan con un patrón específico
export const deleteCookies = async (
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
    // const domains = ["paraisodeljamon.com"]; // Prod
    const domains = ["localhost", ".asuscomm.com"]; // Dev
    for (const cookie of cookies) {
      const [cookieName] = cookie.split("=");

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
        await disableGA();
        domains.forEach((domain) => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
          /* console.log(`Borrada cookie Google: ${cookieName} del dominio: ${domain}`); */
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
