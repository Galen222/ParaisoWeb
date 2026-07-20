// utils/cookieUtils.ts

import { IntlShape } from "react-intl";
import { disableGA } from "../utils/gaUtils";
import { LOCALE_COOKIE_NAME } from "./localeCookie";
import { getConfiguredCookieDeletionDomains } from "./cookieDeletionConfig";
import { clientLogger } from "../logging/clientLogger";

/** Nombre de la cookie necesaria que conserva la elección de consentimiento. */
export const COOKIE_CONSENT_NAME = "_cookie_consent";

/** Evento emitido al borrar la elección para volver a solicitar el consentimiento sin recargar. */
export const COOKIE_CONSENT_CLEARED_EVENT = "paraisoweb:cookie-consent-cleared";

/** Clave efímera usada para avisar a otras pestañas de un cambio de consentimiento. */
export const COOKIE_CONSENT_SYNC_STORAGE_KEY = "paraisoweb:cookie-consent-sync";

/** Categorías de cookies opcionales que deben revocarse. */
export interface CookieCategoriesToRevoke {
  analysis?: boolean;
  googleAnalytics?: boolean;
  personalization?: boolean;
}

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

/** Caduca una cookie como host-only y en todos los dominios configurados para el entorno. */
const expireCookieAcrossConfiguredDomains = (cookieName: string): void => {
  expireCookie(cookieName);
  getConfiguredCookieDeletionDomains().forEach((domain) => {
    expireCookie(cookieName, domain);
  });
};

/** Devuelve los nombres de cookies visibles en la ruta actual. */
const getVisibleCookieNames = (): string[] =>
  document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => cookie.split("=", 1)[0]);

/** Avisa a la interfaz de que la elección se ha revocado sin asumir un nombre de cookie. */
const notifyCookieConsentCleared = (): void => {
  notifyCookieConsentChanged();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COOKIE_CONSENT_CLEARED_EVENT));
  }
};

/**
 * Retira las cookies de las categorías cuyo consentimiento se ha revocado.
 * También desactiva Google Analytics aunque sus cookies ya no sean visibles para JavaScript.
 */
export const revokeCookieCategories = ({
  analysis = false,
  googleAnalytics = false,
  personalization = false,
}: CookieCategoriesToRevoke): boolean => {
  if (typeof document === "undefined") {
    return true;
  }

  // La desactivación lógica no debe depender de que la configuración de dominios sea válida.
  // Así GA deja de recibir eventos incluso ante una incidencia inesperada en el bundle.
  if (googleAnalytics) {
    void disableGA();
  }

  try {
    if (personalization) {
      expireCookieAcrossConfiguredDomains(LOCALE_COOKIE_NAME);
    }

    if (analysis) {
      expireCookieAcrossConfiguredDomains("_device");
      expireCookieAcrossConfiguredDomains("_visited");
    }

    if (googleAnalytics) {
      getVisibleCookieNames()
        .filter(isGoogleAnalyticsCookie)
        .forEach(expireCookieAcrossConfiguredDomains);
    }

    return true;
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "error desconocido";
    clientLogger.error("No se pudieron revocar físicamente todas las cookies:", detail);
    return false;
  }
};

/** Avisa a las demás pestañas sin guardar la preferencia en localStorage. */
const notifyCookieConsentChanged = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      COOKIE_CONSENT_SYNC_STORAGE_KEY,
      `${Date.now()}:${Math.random()}`
    );
    window.localStorage.removeItem(COOKIE_CONSENT_SYNC_STORAGE_KEY);
  } catch {
    // El consentimiento sigue guardado en cookie aunque el almacenamiento esté bloqueado.
  }
};

/**
 * Guarda la elección de consentimiento durante un año.
 * El valor incluye una versión para poder invalidarlo si cambia la política.
 */
export const saveCookieConsentPreference = (preference: string): void => {
  setClientCookie(COOKIE_CONSENT_NAME, preference, 31536000);
  notifyCookieConsentChanged();
};

/** Elimina la elección guardada para que el modal pueda volver a solicitarla. */
export const clearCookieConsentPreference = (): void => {
  expireCookie(COOKIE_CONSENT_NAME);
  notifyCookieConsentCleared();
};

/** Guarda el idioma elegido durante un año. */
export const saveLocalePreference = (locale: string): void => {
  setClientCookie(LOCALE_COOKIE_NAME, locale, 31536000);
};

/** Elimina el idioma guardado cuando una navegación no llega a completarse. */
export const clearLocalePreference = (): void => {
  expireCookie(LOCALE_COOKIE_NAME);
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
  let deletionSucceeded = false;

  try {
    // La revocación debe detener el seguimiento antes del borrado para que GA no recree cookies.
    await disableGA();

    // El botón elimina todas las cookies visibles; la variable de entorno configura únicamente
    // los dominios en los que se repite la caducidad para casar con el atributo Domain original.
    getVisibleCookieNames().forEach(expireCookieAcrossConfiguredDomains);

    // Borra también la cookie necesaria aunque ya no fuese visible al construir la lista anterior.
    expireCookieAcrossConfiguredDomains(COOKIE_CONSENT_NAME);

    // No se confirma el borrado mientras quede alguna cookie accesible desde esta ruta.
    deletionSucceeded = getVisibleCookieNames().length === 0;
  } catch {
    deletionSucceeded = false;
  } finally {
    // Sincroniza siempre el contexto: retirar el consentimiento es independiente de que
    // el navegador permita o no eliminar físicamente todas las cookies.
    setAcceptCookiePersonalization(false);
    setCookieConsentPersonalization(false);
    setAcceptCookieAnalysis(false);
    setCookieConsentAnalysis(false);
    setAcceptCookieAnalysisGoogle(false);
    setCookieConsentAnalysisGoogle(false);
    notifyCookieConsentCleared();
  }

  return deletionSucceeded;
};
