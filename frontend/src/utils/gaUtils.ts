// utils/gaUtils.ts

import ReactGA from "react-ga4";

/**
 * Variable que indica si Google Analytics está desactivado.
 */
let gaDisabled = false;

/**
 * Inicializa Google Analytics 4 (GA4) usando el ID proporcionado en las variables de entorno.
 * Lanza un error si el ID no está definido.
 */
export const initGA = () => {
  const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  if (!analyticsId) {
    throw new Error("Google Analytics ID no está definido en las variables de entorno.");
  }
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
      (window as any)[`ga-disable-${analyticsId}`] = true;
      gaDisabled = true;
      /* console.log(`GA desactivado`); */
    }
  }
};
