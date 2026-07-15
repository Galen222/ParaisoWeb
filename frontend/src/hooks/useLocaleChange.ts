// hooks/useLocaleChange.ts

import { useRouter } from "next/router";
import { useCallback, useRef } from "react";
import { useCookieConsent } from "../contexts/CookieContext";
import { getBlogPostBySlug, getBlogPostById } from "../services/blogService";
import { getTimedToken } from "../services/tokenService";
import {
  clearLocalePreference,
  getCookieValue,
  saveLocalePreference,
} from "../utils/cookieUtils";

const SUPPORTED_LOCALES = new Set(["es", "en", "de"]);
const VALID_SLUG_PATTERN = /^[\p{L}\p{N}\p{M}-]+$/u;
const MAX_SLUG_LENGTH = 150;

/** Devuelve un mensaje breve para depurar sin registrar respuestas, cabeceras ni tokens. */
const getErrorMessageForLog = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Error desconocido";
};

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
  const localeChangeSequenceRef = useRef(0);

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

      // Evita repetir la navegación y las peticiones del blog al pulsar el idioma que ya está activo.
      if (newLocale === router.locale) {
        return;
      }

      // Cada solicitud invalida las anteriores para que una respuesta lenta no sobrescriba el último idioma elegido.
      const localeChangeSequence = ++localeChangeSequenceRef.current;
      let newPath = router.asPath;

      // Verifica si estás en la página `[slug]`
      if (router.pathname === "/blog/[slug]") {
        const slug = typeof router.query.slug === "string" ? router.query.slug : null;

        // No solicita tokens ni artículos cuando Next.js todavía no dispone de un slug válido.
        if (!slug) {
          console.error("Cambio de idioma del blog ignorado: slug no disponible o inválido.");
          return;
        }

        try {
          const token = await getTimedToken();
          if (localeChangeSequence !== localeChangeSequenceRef.current) return;

          // Obtenemos el artículo actual utilizando el slug y el idioma actuales.
          // El idioma evita resolver una traducción distinta cuando dos versiones comparten slug.
          const currentBlogPost = await getBlogPostBySlug(slug, token, router.locale || "es");
          if (localeChangeSequence !== localeChangeSequenceRef.current) return;

          // No consulta la traducción con un identificador vacío, decimal o negativo devuelto por la API.
          if (!Number.isInteger(currentBlogPost.id_noticia) || currentBlogPost.id_noticia <= 0) {
            console.error("Cambio de idioma del blog cancelado: identificador de artículo inválido.");
            newPath = `/blog`;
          } else {
            // Obtenemos el artículo en el nuevo idioma utilizando el ID del artículo actual
            const newBlogPost = await getBlogPostById(currentBlogPost.id_noticia, newLocale, token);
            if (localeChangeSequence !== localeChangeSequenceRef.current) return;

            const isExpectedTranslation =
              newBlogPost.id_noticia === currentBlogPost.id_noticia &&
              newBlogPost.idioma === newLocale &&
              typeof newBlogPost.slug === "string" &&
              newBlogPost.slug.length <= MAX_SLUG_LENGTH &&
              VALID_SLUG_PATTERN.test(newBlogPost.slug);

            if (isExpectedTranslation) {
              // Construimos la nueva ruta con el slug en el nuevo idioma
              newPath = `/blog/${newBlogPost.slug}`;
            } else {
              // Si la respuesta no corresponde a la traducción solicitada, redirige al blog principal.
              console.error("Cambio de idioma del blog cancelado: la traducción recibida no es válida.");
              newPath = `/blog`;
            }
          }
        } catch (error: unknown) {
          // Un cambio posterior tiene prioridad y no debe ser reemplazado por este resultado tardío.
          if (localeChangeSequence !== localeChangeSequenceRef.current) return;

          console.error("Error al obtener la traducción del artículo:", getErrorMessageForLog(error));
          // En caso de error, podríamos redirigir al blog principal
          newPath = `/blog`;
        }
      }

      if (localeChangeSequence !== localeChangeSequenceRef.current) return;

      // Si el usuario ha consentido la personalización, actualiza la cookie antes de navegar.
      // Así getServerSideProps recibe ya el nuevo idioma y no redirige de vuelta por leer la preferencia anterior.
      const previousLocalePreference = getCookieValue("_locale");
      let localePreferenceUpdated = false;
      if (cookieConsentPersonalization) {
        saveLocalePreference(newLocale);
        localePreferenceUpdated = true;
      }

      const restorePreviousLocalePreference = (): void => {
        if (!localePreferenceUpdated || localeChangeSequence !== localeChangeSequenceRef.current) {
          return;
        }

        if (previousLocalePreference && SUPPORTED_LOCALES.has(previousLocalePreference)) {
          saveLocalePreference(previousLocalePreference);
        } else {
          clearLocalePreference();
        }
      };

      // Espera a que termine la navegación para que la promesa del manejador represente el cambio real de idioma.
      try {
        const navigationCompleted = await router.push(newPath, newPath, { locale: newLocale });
        if (localeChangeSequence === localeChangeSequenceRef.current && !navigationCompleted) {
          restorePreviousLocalePreference();
          console.error("El cambio de idioma fue cancelado antes de completar la navegación.");
        }
      } catch (error: unknown) {
        if (localeChangeSequence === localeChangeSequenceRef.current) {
          restorePreviousLocalePreference();
          console.error("No se pudo completar el cambio de idioma:", getErrorMessageForLog(error));
        }
      }
    },
    [router, cookieConsentPersonalization]
  );

  return handleLocaleChange;
}
