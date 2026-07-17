// utils/GoogleMapsLoader.ts

import { Loader } from "@googlemaps/js-api-loader";
import { getDocumentCspNonce } from "./cspNonce";

let googleMapsLoader: Loader | null = null;

/**
 * Inicializa y retorna un Singleton del Google Maps Loader.
 * Evita reconfiguraciones del Loader con diferentes opciones.
 *
 * @param apiKey - Clave de API de Google Maps.
 * @param language - Idioma configurado al inicializar.
 * @returns Una instancia del Loader.
 */
export const getGoogleMapsLoader = (apiKey: string, language: string): Loader => {
  if (!googleMapsLoader) {
    googleMapsLoader = new Loader({
      apiKey,
      version: "weekly",
      language, // Idioma fijo al inicializar
      nonce: getDocumentCspNonce(),
    });
  }
  return googleMapsLoader;
};
