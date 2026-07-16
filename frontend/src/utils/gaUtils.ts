// utils/gaUtils.ts

import ReactGA from "react-ga4";
import { normalizeGoogleAnalyticsId } from "./googleAnalyticsId";

/**
 * Variable que indica si Google Analytics está desactivado.
 */
let gaDisabled = false;
let initializedAnalyticsId: string | null = null;

/** Extiende `window` con la bandera global utilizada por Google Analytics. */
declare global {
  interface Window {
    [key: `ga-disable-${string}`]: boolean;
  }
}

/**
 * Actualiza la bandera global de desactivación de Google Analytics.
 *
 * @param {string} analyticsId - Identificador de Google Analytics.
 * @param {boolean} disabled - Indica si el seguimiento debe permanecer desactivado.
 */
const setGADisabled = (analyticsId: string, disabled: boolean): void => {
  if (typeof window !== "undefined") {
    window[`ga-disable-${analyticsId}`] = disabled;
  }
  gaDisabled = disabled;
};

/**
 * Inicializa Google Analytics 4 (GA4) usando el ID proporcionado en las variables de entorno.
 * Si la configuración no está disponible, registra el problema sin interrumpir la aplicación.
 */
export const initGA = (): boolean => {
  const analyticsId = normalizeGoogleAnalyticsId(
    process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
  );
  if (!analyticsId) {
    initializedAnalyticsId = null;
    gaDisabled = true;
    console.error("Google Analytics no se ha iniciado: NEXT_PUBLIC_GOOGLE_ANALYTICS_ID no está definida.");
    return false;
  }

  try {
    // Reactiva el seguimiento si el usuario vuelve a conceder el consentimiento.
    setGADisabled(analyticsId, false);

    // Restaurar el consentimiento puede ejecutar este método más de una vez. No se crea
    // otro tracker para el mismo identificador, evitando eventos duplicados.
    if (initializedAnalyticsId !== analyticsId) {
      ReactGA.initialize(analyticsId);
      initializedAnalyticsId = analyticsId;
    }

    /* console.log("GA4 iniciado"); */
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error && error.message.trim() ? error.message : "Error desconocido";
    initializedAnalyticsId = null;
    setGADisabled(analyticsId, true);
    console.error("Google Analytics no se ha podido iniciar:", errorMessage);
    return false;
  }
};

/** Indica si GA puede recibir eventos sin arriesgar errores en la interfaz. */
export const isGAReady = (): boolean => initializedAnalyticsId !== null && !gaDisabled;

/** Registra una vista de página únicamente después de inicializar correctamente GA. */
export const sendGAPageView = (page: string, title: string): void => {
  if (!isGAReady()) return;

  try {
    ReactGA.send({ hitType: "pageview", page, title });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error && error.message.trim() ? error.message : "Error desconocido";
    console.error("Google Analytics no pudo registrar la vista de página:", errorMessage);
  }
};

/** Registra un clic de botón únicamente después de inicializar correctamente GA. */
export const sendGAButtonClick = (usedButton: string): void => {
  if (!isGAReady()) return;

  try {
    ReactGA.event({
      category: "Botón",
      action: `Pulsado ${usedButton}`,
      label: usedButton,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error && error.message.trim() ? error.message : "Error desconocido";
    console.error("Google Analytics no pudo registrar el clic:", errorMessage);
  }
};

/**
 * Desactiva Google Analytics para el usuario actual estableciendo una variable global.
 * Marca `gaDisabled` como true para evitar futuras desactivaciones redundantes.
 */
export const disableGA = async () => {
  if (!gaDisabled) {
    const analyticsId = normalizeGoogleAnalyticsId(
      process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
    );
    if (analyticsId) {
      setGADisabled(analyticsId, true);
      /* console.log(`GA desactivado`); */
    }
  }
};
