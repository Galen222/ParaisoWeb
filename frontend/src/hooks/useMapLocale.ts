// hooks/useMapLocale.ts

import { useState } from "react";
import { useRouter } from "next/router";

const allowedLocales = ["es", "en", "de"];

/**
 * Hook personalizado para gestionar el idioma de la API de Google Maps.
 * Garantiza que el idioma se calcule y fije una sola vez, independientemente de cambios posteriores en el idioma global.
 *
 * @returns {string} Idioma configurado para la API de Google Maps.
 */
export function useMapLocale(): string {
  const router = useRouter(); // Obtenemos el idioma inicial desde router.locale

  // Conservamos el idioma inicial durante toda la vida del componente sin leer ni escribir refs durante el render.
  const [mapLocale] = useState<string>(() => {
    const initialLocale = router.locale?.slice(0, 2) || "es"; // Fallback al idioma predeterminado
    return allowedLocales.includes(initialLocale) ? initialLocale : "es";
  });

  return mapLocale; // Devolvemos siempre el mismo valor
}
