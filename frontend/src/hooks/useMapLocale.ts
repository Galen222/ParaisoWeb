// hooks/useMapLocale.ts

import { useEffect, useState } from "react";

/**
 * Hook personalizado para gestionar el idioma de la API de Google Maps.
 * Configura el idioma basado en la preferencia del usuario almacenada en una cookie
 * o en el idioma predeterminado del navegador. Este valor se establece una sola vez
 * y no cambia durante la ejecución del sitio web.
 *
 * @returns {string} Idioma configurado para la API de Google Maps.
 */
export function useMapLocale(): string {
  // Estado para almacenar el idioma del mapa de Google Maps
  const [mapLocale, setMapLocale] = useState<string>("es"); // Valor predeterminado: 'es'

  useEffect(() => {
    // Función para obtener el valor de una cookie por su nombre
    const getCookie = (name: string): string | undefined => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return undefined;
    };

    // Define los idiomas permitidos para la API de Google Maps
    const allowedLocales = ["es", "en", "de"];

    // Intentar obtener el locale desde la cookie '_locale'
    const cookieLocale = getCookie("_locale");

    let initialMapLocale = "es"; // Valor predeterminado

    if (cookieLocale && allowedLocales.includes(cookieLocale)) {
      initialMapLocale = cookieLocale;
    } else {
      // Obtener el idioma del navegador
      const browserLocale = navigator.language.slice(0, 2);
      if (allowedLocales.includes(browserLocale)) {
        initialMapLocale = browserLocale;
      }
    }

    setMapLocale(initialMapLocale);
    // Dependencias vacías para asegurar que este efecto solo corre una vez
  }, []);

  return mapLocale;
}
