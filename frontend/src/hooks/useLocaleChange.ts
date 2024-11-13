// hooks/useLocaleChange.ts

import { useRouter } from "next/router";
import { useCallback } from "react";
import { useCookieConsent } from "../contexts/CookieContext";

/**
 * Hook que maneja el cambio de idioma y actualiza la cookie de idioma si se permite la personalización.
 *
 * @returns {Function} Función para cambiar el idioma.
 */
export function useLocaleChange(): Function {
  const router = useRouter();

  // Obtiene el estado de consentimiento para la personalización de cookies desde el contexto
  const { cookieConsentPersonalization } = useCookieConsent();

  /**
   * Cambia el idioma de la aplicación y guarda en cookies si se permite la personalización.
   *
   * @param {string} newLocale - Nuevo idioma a establecer (por ejemplo, 'es', 'en', 'de').
   */
  const handleLocaleChange = useCallback(
    (newLocale: string) => {
      // Cambia el idioma en la URL utilizando Next.js router
      router.push(router.pathname, router.asPath, { locale: newLocale });

      // Si el usuario ha consentido la personalización, actualiza la cookie de idioma
      if (cookieConsentPersonalization) {
        document.cookie = `_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      }
    },
    [router, cookieConsentPersonalization]
  );

  return handleLocaleChange;
}
