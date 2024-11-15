// hooks/useLocaleChange.ts

import { useRouter } from "next/router";
import { useCallback } from "react";
import { useCookieConsent } from "../contexts/CookieContext";
import { getBlogPostBySlug, getBlogPostById } from "../services/blogService";
import { getTimedToken } from "../services/tokenService";

/**
 * Hook que maneja el cambio de idioma y actualiza la cookie de idioma si se permite la personalización.
 *
 * @returns {Function} Función para cambiar el idioma.
 */
export function useLocaleChange(): Function {
  const router = useRouter();
  const { cookieConsentPersonalization } = useCookieConsent();

  /**
   * Cambia el idioma de la aplicación y guarda en cookies si se permite la personalización.
   *
   * @param {string} newLocale - Nuevo idioma a establecer (por ejemplo, 'es', 'en', 'de').
   */
  const handleLocaleChange = useCallback(
    async (newLocale: string) => {
      let newPath = router.asPath;

      // Verifica si estás en la página `[slug]`
      if (router.pathname === "/blog/[slug]") {
        const { slug } = router.query;

        try {
          const token = await getTimedToken();
          // Obtenemos el artículo actual utilizando el slug actual
          const currentBlogPost = await getBlogPostBySlug(slug as string, token);

          // Obtenemos el artículo en el nuevo idioma utilizando el ID del artículo actual
          const newBlogPost = await getBlogPostById(currentBlogPost.id_noticia, newLocale, token);

          if (newBlogPost && newBlogPost.slug) {
            // Construimos la nueva ruta con el slug en el nuevo idioma
            newPath = `/blog/${newBlogPost.slug}`;
          } else {
            // Si no existe traducción, podríamos mantener el mismo slug o redirigir al blog principal
            newPath = `/blog`;
          }
        } catch (error) {
          console.error("Error fetching translated slug:", error);
          // En caso de error, podríamos redirigir al blog principal
          newPath = `/blog`;
        }
      }

      // Cambia el idioma en la URL utilizando Next.js router
      router.push(newPath, newPath, { locale: newLocale });

      // Si el usuario ha consentido la personalización, actualiza la cookie de idioma
      if (cookieConsentPersonalization) {
        document.cookie = `_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      }
    },
    [router, cookieConsentPersonalization]
  );

  return handleLocaleChange;
}
