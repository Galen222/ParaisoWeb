// utils/cookieUtils.ts

import { IntlShape } from "react-intl";
import { disableGA } from "../utils/gaUtils";

/** Nombre de la cookie necesaria que conserva la elección de consentimiento. */
export const COOKIE_CONSENT_NAME = "_cookie_consent";

/**
 * Guarda la elección de consentimiento durante un año.
 * El valor incluye una versión para poder invalidarlo si cambia la política.
 */
export const saveCookieConsentPreference = (preference: string): void => {
  document.cookie = `${COOKIE_CONSENT_NAME}=${preference}; path=/; max-age=31536000; SameSite=Lax`;
};

/** Elimina la elección guardada para que el modal pueda volver a solicitarla. */
export const clearCookieConsentPreference = (): void => {
  document.cookie = `${COOKIE_CONSENT_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

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
 * Borra cookies que coincidan con un patrón específico, la preferencia guardada y actualiza el estado del consentimiento.
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
 *
 * @returns {Promise<boolean>} - Retorna `true` si las cookies se borraron correctamente, de lo contrario `false`.
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
): Promise<boolean> => {
  try {
    const cookies = document.cookie.split("; ").filter(Boolean);
    // const domains = ["paraisodeljamon.com", ".paraisodeljamon.com"]; // Producción
    // const domains = [".asuscomm.com"]; // Desarrollo
    const domains = [".asuscomm.com", "paraisodeljamon.com", ".paraisodeljamon.com"]; // En Servidor
    let hasAnalysisCookie = false;
    let hasGoogleAnalyticsCookie = false;
    let hasPersonalizationCookie = false;

    /** Caduca una cookie para el host actual o para un dominio concreto. */
    const expireCookie = (cookieName: string, domain?: string) => {
      const domainAttribute = domain ? ` domain=${domain};` : "";
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${domainAttribute}`;
    };

    for (const cookie of cookies) {
      const [cookieName] = cookie.split("=");

      // Borra la cookie de personalización aunque el estado de React se haya quedado desincronizado.
      if (cookieName === "_locale") {
        hasPersonalizationCookie = true;
        expireCookie(cookieName);
      }

      // Borra las cookies de análisis que existan realmente, con independencia del estado en memoria.
      if (cookieName === "_device" || cookieName === "_visited") {
        hasAnalysisCookie = true;
        expireCookie(cookieName);
      }

      // Las cookies de Google pueden ser host-only o pertenecer al dominio raíz. Se intentan ambas variantes.
      if (cookieName.match(/^_ga($|_)/)) {
        hasGoogleAnalyticsCookie = true;
        expireCookie(cookieName);
        domains.forEach((domain) => {
          expireCookie(cookieName, domain);
          /* console.log(`Borrada cookie Google: ${cookieName} del dominio: ${domain}`); */
        });
      }
    }

    // Sincroniza el contexto aunque las cookies ya hubieran desaparecido por caducidad o por otra pestaña.
    if (cookieConsentPersonalization || hasPersonalizationCookie) {
      setAcceptCookiePersonalization(false);
      setCookieConsentPersonalization(false);
    }
    if (cookieConsentAnalysis || hasAnalysisCookie) {
      setAcceptCookieAnalysis(false);
      setCookieConsentAnalysis(false);
    }
    if (cookieConsentAnalysisGoogle || hasGoogleAnalyticsCookie) {
      setAcceptCookieAnalysisGoogle(false);
      setCookieConsentAnalysisGoogle(false);
      await disableGA();
    }

    // Borra también la cookie necesaria que conserva la elección del usuario.
    clearCookieConsentPreference();

    return true; // Indica que las cookies se borraron correctamente
  } catch {
    return false; // Indica que hubo un error al borrar las cookies
  }
};
