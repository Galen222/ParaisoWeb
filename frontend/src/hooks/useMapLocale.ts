// hooks/useMapLocale.ts

import { useRouter } from "next/router";

const allowedLocales = ["es", "en", "de", "fr"];

/**
 * Hook personalizado para gestionar el idioma de la API de Google Maps.
 * Mantiene el idioma del mapa sincronizado con el locale actual de Next.js.
 *
 * @returns {string} Idioma configurado para la API de Google Maps.
 */
export function useMapLocale(): string {
  const router = useRouter(); // Obtenemos el idioma inicial desde router.locale

  // Deriva el idioma en cada render. Congelarlo en el montaje hacía que un cambio de idioma
  // anterior a la carga del mapa siguiera inicializando Google Maps con el locale antiguo.
  const currentLocale = router.locale?.slice(0, 2) || "es";
  return allowedLocales.includes(currentLocale) ? currentLocale : "es";
}
