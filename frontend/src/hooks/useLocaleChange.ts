// hooks/useLocaleChange.ts

import { useRouter } from "next/router";
import { useCallback } from "react";
import { useCookieConsent } from "../contexts/CookieContext";
import { getBlogPostBySlug, getBlogPostById } from "../services/blogService";
import { getTimedToken } from "../services/tokenService";

const SUPPORTED_LOCALES = new Set(["es", "en", "de"]);

/**
 * Tipo de la función que cambia el idioma de la aplicación.
 */
export type LocaleChangeHandler = (newLocale: string) => Promise<void>;

/**
 * Hook que maneja el cambio de idioma y actualiza la cookie de idioma si se permite la personalización.
 *
 * @returns {LocaleChangeHandler} Función para cambiar el idioma.
 */
export function useLocaleChange(): LocaleChangeHandler {
  const router = useRouter();
  const { cookieConsentPersonalization } = useCookieConsent();

  /**
   * Cambia el idioma de la aplicación y guarda en cookies si se permite la personalización.
   *
   * @param {string} newLocale - Nuevo idioma a establecer (por ejemplo, 'es', 'en', 'de').
   */
  const handleLocaleChange = useCallback(
    async (newLocale: string) => {
      // Ignora valores ajenos a los idiomas configurados para no generar rutas ni cookies inválidas.
      if (!SUPPORTED_LOCALES.has(newLocale)) {
        console.error(`Cambio de idioma ignorado: locale no soportado "${newLocale}".`);
        return;
      }

      let newPath = router.asPath;

      // Verifica si estás en la página `[slug]`
      if (router.pathname === "/blog/[slug]") {
        const { slug } = router.query;

        try {
          const token = await getTimedToken();
          // Obtenemos el artículo actual utilizando el slug y el idioma actuales.
          // El idioma evita resolver una traducción distinta cuando dos versiones comparten slug.
          const currentBlogPost = await getBlogPostBySlug(slug as string, token, router.locale || "es");

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

      // Si el usuario ha consentido la personalización, actualiza la cookie antes de navegar.
      // Así getServerSideProps recibe ya el nuevo idioma y no redirige de vuelta por leer la preferencia anterior.
      if (cookieConsentPersonalization) {
        document.cookie = `_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      }

      // Espera a que termine la navegación para que la promesa del manejador represente el cambio real de idioma.
      await router.push(newPath, newPath, { locale: newLocale });
    },
    [router, cookieConsentPersonalization]
  );

  return handleLocaleChange;
}
