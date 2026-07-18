// utils/GoogleMapsLoader.ts

import {
  importLibrary,
  setOptions,
  type LibraryMap,
} from "@googlemaps/js-api-loader";

type LibraryName = keyof LibraryMap;

type GoogleMapsLoader = {
  importLibrary<TLibraryName extends LibraryName>(
    libraryName: TLibraryName,
  ): Promise<LibraryMap[TLibraryName]>;
};

const GOOGLE_MAPS_LOAD_RETRIES = 3;

let googleMapsLoader: GoogleMapsLoader | null = null;

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

/**
 * Importa una librería conservando los tres reintentos automáticos que aplicaba
 * la clase Loader de la versión 1 cuando fallaba la descarga del script.
 */
const importLibraryWithRetries = async <TLibraryName extends LibraryName>(
  libraryName: TLibraryName,
): Promise<LibraryMap[TLibraryName]> => {
  let failedAttempts = 0;

  while (true) {
    try {
      return await importLibrary(libraryName);
    } catch (error: unknown) {
      if (failedAttempts >= GOOGLE_MAPS_LOAD_RETRIES) {
        throw error;
      }

      failedAttempts += 1;
      const retryDelay = failedAttempts * 2 ** failedAttempts;
      await wait(retryDelay);
    }
  }
};

/**
 * Inicializa y retorna un Singleton del cargador de Google Maps.
 * Evita reconfiguraciones con diferentes opciones y conserva el idioma de la
 * primera carga aunque el locale de la página cambie después.
 *
 * @param apiKey - Clave de API de Google Maps.
 * @param language - Idioma configurado al inicializar.
 * @returns El cargador funcional adaptado a la API interna de la aplicación.
 */
export const getGoogleMapsLoader = (
  apiKey: string,
  language: string,
): GoogleMapsLoader => {
  if (!googleMapsLoader) {
    setOptions({
      key: apiKey,
      v: "weekly",
      language, // Idioma fijo al inicializar
    });

    // js-api-loader 2 obtiene automáticamente el nonce del primer script[nonce]
    // del documento al crear el script externo de Google Maps.
    googleMapsLoader = {
      importLibrary: importLibraryWithRetries,
    };
  }

  return googleMapsLoader;
};
