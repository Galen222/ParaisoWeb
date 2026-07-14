// utils/gaUtils.ts

import ReactGA from "react-ga4";

/**
 * Variable que indica si Google Analytics está desactivado.
 */
let gaDisabled = false;

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
 * Lanza un error si el ID no está definido.
 */
export const initGA = () => {
  const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  if (!analyticsId) {
    throw new Error("Google Analytics ID no está definido en las variables de entorno.");
  }

  // Reactiva el seguimiento si el usuario vuelve a conceder el consentimiento.
  setGADisabled(analyticsId, false);
  ReactGA.initialize(analyticsId);
  /* console.log("GA4 iniciado"); */
};

/**
 * Desactiva Google Analytics para el usuario actual estableciendo una variable global.
 * Marca `gaDisabled` como true para evitar futuras desactivaciones redundantes.
 */
export const disableGA = async () => {
  if (!gaDisabled) {
    const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "";
    if (analyticsId) {
      setGADisabled(analyticsId, true);
      /* console.log(`GA desactivado`); */
    }
  }
};
