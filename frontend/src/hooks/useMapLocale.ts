// hooks/useMapLocale.ts

import { useRef } from "react";
import { useRouter } from "next/router";

/**
 * Hook personalizado para gestionar el idioma de la API de Google Maps.
 * Garantiza que el idioma se calcule y fije una sola vez, independientemente de cambios posteriores en el idioma global.
 *
 * @returns {string} Idioma configurado para la API de Google Maps.
 */
export function useMapLocale(): string {
  const router = useRouter(); // Obtenemos el idioma inicial desde router.locale
  const mapLocaleRef = useRef<string | null>(null); // Valor persistente e inmutable

  // Asignamos el valor inicial solo si mapLocaleRef.current no tiene valor
  if (!mapLocaleRef.current) {
    const allowedLocales = ["es", "en", "de"];
    const initialLocale = router.locale?.slice(0, 2) || "es"; // Fallback al idioma predeterminado
    mapLocaleRef.current = allowedLocales.includes(initialLocale) ? initialLocale : "es";
  }

  return mapLocaleRef.current; // Devolvemos siempre el mismo valor
}
