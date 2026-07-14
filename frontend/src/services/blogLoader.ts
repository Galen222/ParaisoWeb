// services/blogLoader.ts

import axios from "axios";
import { getBlogPostBySlug, getBlogPostById, BlogPost } from "../services/blogService";
import { getTimedToken } from "../services/tokenService";

const DEFAULT_LOCALE = "es";
const SUPPORTED_LOCALES = new Set(["es", "en", "de"]);
const VALID_SLUG_PATTERN = /^[a-zA-Z0-9-]+$/;

interface BlogDataResult {
  redirect?: { destination: string; permanent: boolean };
  blogDetails?: BlogPost | null;
  error?: string | null;
  notFound?: boolean;
}

/** Construye la ruta pública del artículo respetando que español no lleva prefijo. */
const buildLocalizedBlogPath = (locale: string, slug: string): string =>
  `${locale === DEFAULT_LOCALE ? "" : `/${locale}`}/blog/${slug}`;

/** Comprueba que la traducción recibida sea utilizable para el idioma solicitado. */
const isValidTranslatedPost = (post: BlogPost | null | undefined, locale: string): post is BlogPost =>
  Boolean(post && post.idioma === locale && VALID_SLUG_PATTERN.test(post.slug));

/** Devuelve un texto técnico acotado sin volcar cabeceras, respuestas o tokens completos. */
const getErrorMessageForLog = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Error desconocido";
};

/**
 * Carga los datos de un artículo del blog.
 * Realiza la redirección si el idioma del blog no coincide con el idioma actual.
 *
 * @param {string} slug - Slug del artículo.
 * @param {string} locale - Idioma actual.
 * @returns {Promise<BlogDataResult>} Objeto con detalles del artículo, redirección, 404 o error.
 */
export async function loadBlogData(slug: string, locale: string): Promise<BlogDataResult> {
  // Evita solicitar la API con parámetros que no pueden corresponder a una ruta válida.
  if (!VALID_SLUG_PATTERN.test(slug) || !SUPPORTED_LOCALES.has(locale)) {
    return {
      blogDetails: null,
      error: null,
      notFound: true,
    };
  }

  try {
    const token = await getTimedToken();
    const blogDetails = await getBlogPostBySlug(slug, token, locale);

    // Si el idioma del blog no coincide con el idioma actual, se busca su traducción equivalente.
    if (blogDetails.idioma !== locale) {
      const translatedBlogPost = await getBlogPostById(blogDetails.id_noticia, locale, token);

      if (!isValidTranslatedPost(translatedBlogPost, locale)) {
        console.error("La API devolvió una traducción de blog inválida para el idioma solicitado.");
        return {
          blogDetails: null,
          error: null,
          notFound: true,
        };
      }

      return {
        redirect: {
          destination: buildLocalizedBlogPath(locale, translatedBlogPost.slug),
          permanent: false,
        },
      };
    }

    return {
      blogDetails,
      error: null,
    };
  } catch (error: unknown) {
    // Una publicación inexistente debe producir un 404 real de Next.js, no una página de error con estado 200.
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        blogDetails: null,
        error: null,
        notFound: true,
      };
    }

    console.error("Error al cargar los datos del blog:", getErrorMessageForLog(error));

    return {
      blogDetails: null,
      error: "Error al cargar el artículo.",
    };
  }
}
