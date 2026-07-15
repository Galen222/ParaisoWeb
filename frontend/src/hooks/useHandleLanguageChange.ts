// hooks/useHandleLanguageChange.ts

import { useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { useRouter } from "next/router";
import { getBlogPostById } from "../services/blogService";

const SUPPORTED_LOCALES = new Set(["es", "en", "de"]);
const VALID_SLUG_PATTERN = /^[\p{L}\p{N}\p{M}-]+$/u;
const MAX_SLUG_LENGTH = 150;

/** Devuelve un mensaje seguro y breve para depurar sin registrar el objeto de error completo. */
const getErrorMessageForLog = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Error desconocido";
};

/**
 * Interfaz para los detalles del blog.
 * @property {number} id_noticia - ID de la noticia en el idioma actual.
 * @property {string} idioma - Idioma actual de la noticia.
 * @property {string} slug - Slug de la noticia en el idioma actual.
 */
export interface BlogDetails {
  id_noticia: number;
  idioma: string;
  slug: string;
}

/**
 * Hook personalizado para manejar el cambio de idioma en los detalles de una publicación de blog.
 * Al detectar un cambio de idioma, busca la versión correspondiente de la publicación en el nuevo idioma
 * y redirige al usuario a la URL de la traducción.
 *
 * @param {BlogDetails | null} blogDetails - Detalles de la publicación de blog, incluyendo ID, idioma y slug.
 */
export const useHandleLanguageChange = (blogDetails: BlogDetails | null) => {
  const intl = useIntl(); // Hook para obtener el idioma actual
  const router = useRouter(); // Hook para gestionar la navegación
  const requestSequenceRef = useRef(0);

  const blogId = blogDetails?.id_noticia;
  const blogLocale = blogDetails?.idioma;

  useEffect(() => {
    /**
     * Maneja el cambio de idioma.
     * Si el idioma actual de la aplicación no coincide con el de la noticia,
     * intenta obtener la noticia en el nuevo idioma y redirige a su URL.
     */
    const newIdioma = intl.locale;

    if (!router.isReady || blogId === undefined || !blogLocale || newIdioma === blogLocale) {
      return;
    }

    if (!SUPPORTED_LOCALES.has(newIdioma)) {
      console.error(`Cambio automático de idioma ignorado: locale no soportado "${newIdioma}".`);
      return;
    }

    // Cada solicitud invalida las anteriores para impedir que una respuesta lenta revierta el último idioma elegido.
    const requestSequence = ++requestSequenceRef.current;
    let cancelled = false;

    const isCurrentRequest = (): boolean => !cancelled && requestSequence === requestSequenceRef.current;

    const handleLanguageChange = async () => {
      try {
        // Obtiene la noticia en el nuevo idioma usando el ID de la noticia.
        const newBlogPost = await getBlogPostById(blogId, newIdioma);
        if (!isCurrentRequest()) return;

        // Evita navegar con una respuesta incompleta o perteneciente a otro idioma.
        if (
          newBlogPost.id_noticia !== blogId ||
          newBlogPost.idioma !== newIdioma ||
          newBlogPost.slug.length > MAX_SLUG_LENGTH ||
          !VALID_SLUG_PATTERN.test(newBlogPost.slug)
        ) {
          console.error("Cambio automático de idioma cancelado: la traducción recibida no es válida.");
          return;
        }

        // Redirige al usuario a la URL de la noticia traducida indicando el locale de forma explícita.
        const navigationCompleted = await router.push(`/blog/${newBlogPost.slug}`, undefined, {
          locale: newIdioma,
        });

        if (isCurrentRequest() && !navigationCompleted) {
          console.error("No se pudo completar la navegación al artículo traducido.");
        }
      } catch (error: unknown) {
        if (isCurrentRequest()) {
          console.error("Error al cambiar automáticamente el idioma del artículo:", getErrorMessageForLog(error));
        }
      }
    };

    void handleLanguageChange();

    return () => {
      cancelled = true;
    };
  }, [blogId, blogLocale, intl.locale, router]); // Ejecuta el efecto cuando cambian el idioma o los detalles del blog
};
