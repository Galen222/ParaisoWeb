// utils/cookieUtils.ts

import { IntlShape } from "react-intl";
import { toast, Slide } from "react-toastify";
import { disableGA } from "@/utils/gaUtils";

/**
 * Obtiene el valor de una cookie específica por su nombre.
 *
 * @param {string} name - El nombre de la cookie a buscar.
 * @returns {string | undefined} - El valor de la cookie, o `undefined` si no se encuentra.
 */
export const getCookieValue = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";")[0];
  }
  return undefined;
};

/**
 * Crea una cookie con información sobre el tipo de dispositivo.
 * La cookie contiene el tipo de dispositivo, la resolución de pantalla y el idioma del navegador.
 */
export const createDeviceCookie = () => {
  const deviceInfo = {
    deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "Tablet-Mobile" : "PC",
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
  };
  document.cookie = `_device=${JSON.stringify(deviceInfo)}; path=/; max-age=31536000; SameSite=Lax`;
};

/**
 * Borra cookies que coincidan con un patrón específico y actualiza el estado del consentimiento de cookies.
 *
 * @param {IntlShape} intl - Objeto de internacionalización para mostrar mensajes.
 * @param {Function} setAcceptCookiePersonalization - Función para actualizar el estado de consentimiento de personalización.
 * @param {boolean} cookieConsentAnalysis - Estado del consentimiento de cookies de análisis.
 * @param {Function} setAcceptCookieAnalysis - Función para actualizar el estado de aceptación de cookies de análisis.
 * @param {Function} setCookieConsentAnalysis - Función para actualizar el estado de consentimiento de cookies de análisis.
 * @param {boolean} cookieConsentAnalysisGoogle - Estado del consentimiento de cookies de Google Analytics.
 * @param {Function} setAcceptCookieAnalysisGoogle - Función para actualizar el estado de aceptación de cookies de Google Analytics.
 * @param {Function} setCookieConsentAnalysisGoogle - Función para actualizar el estado de consentimiento de cookies de Google Analytics.
 * @param {boolean} cookieConsentPersonalization - Estado del consentimiento de cookies de personalización.
 * @param {Function} setCookieConsentPersonalization - Función para actualizar el estado de consentimiento de cookies de personalización.
 */
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
    // const domains = ["paraisodeljamon.com"]; // Producción
    const domains = ["localhost", ".asuscomm.com"]; // Desarrollo
    for (const cookie of cookies) {
      const [cookieName] = cookie.split("=");

      // Borra la cookie de personalización si se ha dado consentimiento para ella.
      if (cookieName === "_locale" && cookieConsentPersonalization) {
        setAcceptCookiePersonalization(false);
        setCookieConsentPersonalization(false);
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }

      // Borra cookies de análisis si se ha dado consentimiento para ellas.
      if ((cookieName === "_device" || cookieName === "_visited") && cookieConsentAnalysis) {
        setAcceptCookieAnalysis(false);
        setCookieConsentAnalysis(false);
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }

      // Borra cookies de Google Analytics si se ha dado consentimiento para ellas.
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

    // Notificación de éxito al borrar cookies.
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
    // Notificación de error si la eliminación de cookies falla.
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
