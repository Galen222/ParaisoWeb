// services/blogLoader.ts

import axios from "axios";
import { getBlogPostBySlug, getBlogPostById, BlogPost } from "../services/blogService";
import { getTimedToken } from "../services/tokenService";
import { normalizeBlogSlug } from "../utils/blogSlug";
import { buildLocalizedBlogPath } from "../utils/blogPath";
import { getBlogFallbackLocales, isSupportedBlogLocale } from "../utils/blogLocaleFallback";

interface BlogDataResult {
  redirect?: { destination: string; permanent: boolean };
  blogDetails?: BlogPost | null;
  error?: string | null;
  notFound?: boolean;
  statusCode?: number;
}

/** Comprueba que la traducción recibida sea utilizable para el idioma solicitado. */
const isValidTranslatedPost = (
  post: BlogPost | null | undefined,
  locale: string,
  expectedId: number
): post is BlogPost =>
  Boolean(
    post &&
      post.id_noticia === expectedId &&
      post.idioma === locale &&
      normalizeBlogSlug(post.slug) !== null
  );

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
 * @param {string} routeSuffix - Query original que debe conservar una redirección canónica.
 * @returns {Promise<BlogDataResult>} Objeto con detalles del artículo, redirección, 404 o error.
 */
export async function loadBlogData(
  slug: string,
  locale: string,
  routeSuffix = ""
): Promise<BlogDataResult> {
  // Evita solicitar la API con parámetros que no pueden corresponder a una ruta válida.
  const normalizedSlug = normalizeBlogSlug(slug);
  if (normalizedSlug === null || !isSupportedBlogLocale(locale)) {
    return {
      blogDetails: null,
      error: null,
      notFound: true,
    };
  }

  try {
    const token = await getTimedToken();
    let blogDetails: BlogPost | null = null;

    try {
      blogDetails = await getBlogPostBySlug(normalizedSlug, token, locale);
    } catch (error: unknown) {
      if (!(axios.isAxiosError(error) && error.response?.status === 404)) {
        throw error;
      }
    }

    // Un enlace guardado o compartido puede conservar el slug de otro idioma. Si el
    // artículo no existe con el locale actual, se localiza su noticia equivalente y
    // se redirige a la URL canónica traducida en vez de devolver un 404 falso.
    if (blogDetails === null) {
      const fallbackLocales = getBlogFallbackLocales(locale);

      for (const fallbackLocale of fallbackLocales) {
        try {
          blogDetails = await getBlogPostBySlug(normalizedSlug, token, fallbackLocale);
          break;
        } catch (error: unknown) {
          if (!(axios.isAxiosError(error) && error.response?.status === 404)) {
            throw error;
          }
        }
      }
    }

    if (blogDetails === null) {
      return {
        blogDetails: null,
        error: null,
        notFound: true,
      };
    }

    // Si el slug encontrado pertenece a otro idioma, se busca su traducción equivalente.
    if (blogDetails.idioma !== locale) {
      const translatedBlogPost = await getBlogPostById(blogDetails.id_noticia, locale, token);

      const normalizedTranslatedSlug = normalizeBlogSlug(translatedBlogPost?.slug);
      if (
        !isValidTranslatedPost(translatedBlogPost, locale, blogDetails.id_noticia) ||
        normalizedTranslatedSlug === null
      ) {
        console.error("La API devolvió una traducción de blog inválida para el idioma solicitado.");
        return {
          blogDetails: null,
          error: null,
          notFound: true,
        };
      }

      return {
        redirect: {
          destination: buildLocalizedBlogPath(locale, normalizedTranslatedSlug, routeSuffix),
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
      // Una dependencia temporalmente no disponible no debe generar una página de error
      // con HTTP 200, porque navegadores y buscadores podrían almacenarla como contenido válido.
      statusCode: 503,
    };
  }
}
