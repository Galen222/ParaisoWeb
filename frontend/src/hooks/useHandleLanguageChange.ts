// hooks/useHandleLanguageChange.ts

import { useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { useRouter } from "next/router";
import { getBlogPostById } from "../services/blogService";
import { normalizeBlogSlug } from "../utils/blogSlug";

const SUPPORTED_LOCALES = new Set(["es", "en", "de"]);

/** Devuelve un mensaje seguro y breve para depurar sin registrar el objeto de error completo. */
const getErrorMessageForLog = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Error desconocido";
};

/** Conserva query y fragmento al sustituir solamente el slug traducido. */
const getRouteSuffix = (asPath: string): string => {
  const queryIndex = asPath.indexOf("?");
  const hashIndex = asPath.indexOf("#");
  const indexes = [queryIndex, hashIndex].filter((index) => index >= 0);
  return indexes.length > 0 ? asPath.slice(Math.min(...indexes)) : "";
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
  const activeRequestControllerRef = useRef<AbortController | null>(null);

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

    // Cancela la lectura anterior para que un cambio rápido de locale no siga consumiendo
    // token, conexión y rate limit ni pueda navegar después de una solicitud más reciente.
    activeRequestControllerRef.current?.abort();
    const controller = new AbortController();
    activeRequestControllerRef.current = controller;
    const requestSequence = ++requestSequenceRef.current;
    let cancelled = false;

    const isCurrentRequest = (): boolean =>
      !cancelled &&
      !controller.signal.aborted &&
      requestSequence === requestSequenceRef.current;

    const handleLanguageChange = async () => {
      try {
        // Obtiene la noticia en el nuevo idioma usando el ID de la noticia.
        const newBlogPost = await getBlogPostById(
          blogId,
          newIdioma,
          undefined,
          controller.signal
        );
        if (!isCurrentRequest()) return;

        // Evita navegar con una respuesta incompleta o perteneciente a otro idioma.
        const normalizedNewSlug = normalizeBlogSlug(newBlogPost.slug);
        if (
          newBlogPost.id_noticia !== blogId ||
          newBlogPost.idioma !== newIdioma ||
          normalizedNewSlug === null
        ) {
          console.error("Cambio automático de idioma cancelado: la traducción recibida no es válida.");
          return;
        }

        // Conserva filtros, parámetros y anclas al sustituir el slug por su traducción canónica.
        const routeSuffix = getRouteSuffix(router.asPath);
        const navigationCompleted = await router.push(
          `/blog/${normalizedNewSlug}${routeSuffix}`,
          undefined,
          { locale: newIdioma }
        );

        if (isCurrentRequest() && !navigationCompleted) {
          console.error("No se pudo completar la navegación al artículo traducido.");
        }
      } catch (error: unknown) {
        // Una navegación posterior o el desmontaje cancelan intencionadamente la lectura.
        if (isCurrentRequest()) {
          console.error("Error al cambiar automáticamente el idioma del artículo:", getErrorMessageForLog(error));
        }
      } finally {
        if (activeRequestControllerRef.current === controller) {
          activeRequestControllerRef.current = null;
        }
      }
    };

    void handleLanguageChange();

    return () => {
      cancelled = true;
      controller.abort();
      if (activeRequestControllerRef.current === controller) {
        activeRequestControllerRef.current = null;
      }
    };
  }, [blogId, blogLocale, intl.locale, router]); // Ejecuta el efecto cuando cambian el idioma o los detalles del blog
};
