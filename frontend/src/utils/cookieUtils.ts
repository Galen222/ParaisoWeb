// utils/cookieUtils.ts

import { IntlShape } from "react-intl";
import { disableGA } from "../utils/gaUtils";

/** Nombre de la cookie necesaria que conserva la elección de consentimiento. */
export const COOKIE_CONSENT_NAME = "_cookie_consent";

/** Evento emitido al borrar la elección para volver a solicitar el consentimiento sin recargar. */
export const COOKIE_CONSENT_CLEARED_EVENT = "paraisoweb:cookie-consent-cleared";

/** Categorías de cookies opcionales que deben revocarse. */
export interface CookieCategoriesToRevoke {
  analysis?: boolean;
  googleAnalytics?: boolean;
  personalization?: boolean;
}

// Dominios en los que pueden haberse creado cookies de Google Analytics.
const GOOGLE_ANALYTICS_COOKIE_DOMAINS = [".asuscomm.com", "paraisodeljamon.com", ".paraisodeljamon.com"];

/** Reconoce las cookies habituales creadas por Google Analytics y sus contenedores. */
export const isGoogleAnalyticsCookie = (cookieName: string): boolean =>
  /^_ga($|_)/.test(cookieName) || /^_gid$/.test(cookieName) || /^_gat($|_)/.test(cookieName);

/** Construye atributos comunes y añade Secure únicamente cuando la página usa HTTPS. */
const buildCookieAttributes = (domain?: string): string => {
  const attributes = ["path=/", "SameSite=Lax"];
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    attributes.push("Secure");
  }
  if (domain) {
    attributes.push(`domain=${domain}`);
  }
  return attributes.join("; ");
};

/** Escribe una cookie cliente con los atributos de seguridad comunes. */
export const setClientCookie = (cookieName: string, value: string, maxAgeSeconds: number): void => {
  document.cookie = `${cookieName}=${value}; max-age=${maxAgeSeconds}; ${buildCookieAttributes()}`;
};

/** Caduca una cookie para el host actual o para un dominio concreto. */
const expireCookie = (cookieName: string, domain?: string): void => {
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${buildCookieAttributes(domain)}`;
};

/**
 * Retira las cookies de las categorías cuyo consentimiento se ha revocado.
 * También desactiva Google Analytics aunque sus cookies ya no sean visibles para JavaScript.
 */
export const revokeCookieCategories = ({
  analysis = false,
  googleAnalytics = false,
  personalization = false,
}: CookieCategoriesToRevoke): void => {
  if (typeof document === "undefined") {
    return;
  }

  if (personalization) {
    expireCookie("_locale");
  }

  if (analysis) {
    expireCookie("_device");
    expireCookie("_visited");
  }

  if (googleAnalytics) {
    const googleCookieNames = document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => cookie.split("=", 1)[0])
      .filter(isGoogleAnalyticsCookie);

    googleCookieNames.forEach((cookieName) => {
      expireCookie(cookieName);
      GOOGLE_ANALYTICS_COOKIE_DOMAINS.forEach((domain) => expireCookie(cookieName, domain));
    });

    void disableGA();
  }
};

/**
 * Guarda la elección de consentimiento durante un año.
 * El valor incluye una versión para poder invalidarlo si cambia la política.
 */
export const saveCookieConsentPreference = (preference: string): void => {
  setClientCookie(COOKIE_CONSENT_NAME, preference, 31536000);
};

/** Elimina la elección guardada para que el modal pueda volver a solicitarla. */
export const clearCookieConsentPreference = (): void => {
  expireCookie(COOKIE_CONSENT_NAME);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COOKIE_CONSENT_CLEARED_EVENT));
  }
};

/** Guarda el idioma elegido durante un año. */
export const saveLocalePreference = (locale: string): void => {
  setClientCookie("_locale", locale, 31536000);
};

/** Elimina el idioma guardado cuando una navegación no llega a completarse. */
export const clearLocalePreference = (): void => {
  expireCookie("_locale");
};

/**
 * Obtiene el valor de una cookie específica por su nombre.
 *
 * @param {string} name - El nombre de la cookie a buscar.
 * @returns {string | undefined} - El valor de la cookie, o `undefined` si no se encuentra.
 */
export const getCookieValue = (name: string): string | undefined => {
  const cookiePrefix = `${name}=`;
  const matchingCookie = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(cookiePrefix));

  return matchingCookie?.slice(cookiePrefix.length);
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
  // JSON contiene comillas y comas que no son cookie-octets válidos. Codificar el valor
  // evita que algunos navegadores lo trunquen o ignoren sin cambiar la información guardada.
  const encodedDeviceInfo = encodeURIComponent(JSON.stringify(deviceInfo));
  setClientCookie("_device", encodedDeviceInfo, 31536000);
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
    const cookies = document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean);
    // const domains = ["paraisodeljamon.com", ".paraisodeljamon.com"]; // Producción
    // const domains = [".asuscomm.com"]; // Desarrollo
    const domains = [".asuscomm.com", "paraisodeljamon.com", ".paraisodeljamon.com"]; // En Servidor

    for (const cookie of cookies) {
      const [cookieName] = cookie.split("=");

      // Borra la cookie de personalización aunque el estado de React se haya quedado desincronizado.
      if (cookieName === "_locale") {
        expireCookie(cookieName);
      }

      // Borra las cookies de análisis que existan realmente, con independencia del estado en memoria.
      if (cookieName === "_device" || cookieName === "_visited") {
        expireCookie(cookieName);
      }

      // Las cookies de Google pueden ser host-only o pertenecer al dominio raíz. Se intentan ambas variantes.
      if (isGoogleAnalyticsCookie(cookieName)) {
        expireCookie(cookieName);
        domains.forEach((domain) => {
          expireCookie(cookieName, domain);
          /* console.log(`Borrada cookie Google: ${cookieName} del dominio: ${domain}`); */
        });
      }
    }

    // Sincroniza siempre el contexto aunque las cookies ya hubieran desaparecido por caducidad,
    // por otra pestaña o antes de que se confirmara una selección del modal.
    setAcceptCookiePersonalization(false);
    setCookieConsentPersonalization(false);
    setAcceptCookieAnalysis(false);
    setCookieConsentAnalysis(false);
    setAcceptCookieAnalysisGoogle(false);
    setCookieConsentAnalysisGoogle(false);
    await disableGA();

    // Borra también la cookie necesaria que conserva la elección del usuario.
    clearCookieConsentPreference();

    return true; // Indica que las cookies se borraron correctamente
  } catch {
    return false; // Indica que hubo un error al borrar las cookies
  }
};
