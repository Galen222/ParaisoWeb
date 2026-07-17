// services/blogService.ts

/**
 * Servicio para manejar las operaciones relacionadas con el blog.
 */

import axios from "axios";
import { requestWithTimedToken } from "./timedTokenRequest";
import { isValidApiDateString } from "../utils/apiDate";
import { READ_REQUEST_TIMEOUT_MS, requirePublicApiUrl } from "../config/api.config";
import { normalizeBlogSlug } from "../utils/blogSlug";
import { isSafePublicAssetPath } from "../utils/publicAssetPath";
import { isSafePublicMultilineText, isSafePublicSingleLineText } from "../utils/publicText";
import { clientLogger } from "../logging/clientLogger";

/**
 * Interfaz para representar los datos de una publicación de blog.
 */
export interface BlogPost {
  id_noticia: number; // Identificador único de la noticia.
  idioma: string; // Idioma de la noticia.
  slug: string; // Slug utilizado para generar la URL amigable de la noticia.
  titulo: string; // Título de la noticia.
  contenido: string; // Contenido completo de la noticia.
  autor: string; // Autor de la noticia.
  imagen_url: string; // URL de la imagen principal de la noticia.
  imagen_url_2?: string | null; // URL de una segunda imagen (opcional).
  fecha_publicacion: string; // Fecha de publicación de la noticia.
  fecha_actualizacion: string | null; // Puede ser nula en publicaciones antiguas sin actualización.
}

/**
 * URL base de la API de blogs, obtenida desde una variable de entorno.
 */
const API_URL = process.env.NEXT_PUBLIC_API_BLOG_URL;

const SUPPORTED_LANGUAGES = new Set(["es", "en", "de"]);

interface ExpectedBlogIdentity {
  id?: number;
  idioma?: string;
  slug?: string;
}

/** Acepta ausencia real o cadenas vacías heredadas en una imagen que es opcional. */
const isOptionalPublicAssetPath = (value: unknown): value is string | null | undefined =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && (value.trim() === "" || isSafePublicAssetPath(value)));

/** Valida los idiomas que existen en las rutas y en la base de datos. */
const requireSupportedLanguage = (idioma: string): string => {
  if (!SUPPORTED_LANGUAGES.has(idioma)) {
    throw new Error(`El idioma "${idioma}" no es válido. Solo se permiten: es, en, de.`);
  }

  return idioma;
};

/** Normaliza y valida el slug antes de construir la ruta de la API. */
const requireValidSlug = (slug: string): string => {
  const normalizedSlug = normalizeBlogSlug(slug);
  if (normalizedSlug === null) {
    throw new Error("El slug del artículo no es válido.");
  }

  return normalizedSlug;
};


/**
 * Obtiene la URL configurada sin hacer fallar la importación del módulo durante el build.
 */
const getApiUrl = (): string =>
  requirePublicApiUrl(API_URL, "NEXT_PUBLIC_API_BLOG_URL");

/** Comprueba en tiempo de ejecución que una respuesta conserva el contrato del blog. */
const isBlogPost = (value: unknown, expected: ExpectedBlogIdentity = {}): value is BlogPost => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const post = value as Record<string, unknown>;
  const normalizedExpectedSlug = expected.slug === undefined ? undefined : normalizeBlogSlug(expected.slug);
  const normalizedResponseSlug = normalizeBlogSlug(post.slug);

  return (
    Number.isInteger(post.id_noticia) &&
    typeof post.id_noticia === "number" &&
    post.id_noticia > 0 &&
    typeof post.idioma === "string" &&
    SUPPORTED_LANGUAGES.has(post.idioma) &&
    normalizedResponseSlug !== null &&
    isSafePublicSingleLineText(post.titulo) &&
    isSafePublicMultilineText(post.contenido) &&
    isSafePublicSingleLineText(post.autor) &&
    isSafePublicAssetPath(post.imagen_url) &&
    isOptionalPublicAssetPath(post.imagen_url_2) &&
    isValidApiDateString(post.fecha_publicacion) &&
    (post.fecha_actualizacion === null || isValidApiDateString(post.fecha_actualizacion)) &&
    (expected.id === undefined || post.id_noticia === expected.id) &&
    (expected.idioma === undefined || post.idioma === expected.idioma) &&
    (normalizedExpectedSlug === undefined || normalizedResponseSlug === normalizedExpectedSlug)
  );
};

/** Rechaza respuestas 2xx mal formadas antes de que provoquen un error durante el render. */
const normalizeBlogPost = (value: BlogPost): BlogPost => ({
  ...value,
  slug: normalizeBlogSlug(value.slug) as string,
  // Algunos registros antiguos representan la ausencia de la segunda imagen como
  // cadena vacía. No debe invalidarse todo el artículo por un campo opcional vacío.
  imagen_url_2:
    typeof value.imagen_url_2 === "string" && value.imagen_url_2.trim() === ""
      ? null
      : value.imagen_url_2,
});

const requireBlogPost = (value: unknown, expected: ExpectedBlogIdentity = {}): BlogPost => {
  if (!isBlogPost(value, expected)) {
    throw new Error("La respuesta del servidor para el blog no tiene el formato esperado.");
  }

  return normalizeBlogPost(value);
};

/**
 * Obtiene la lista de publicaciones del blog en el idioma especificado.
 *
 * @param {string} idioma - El idioma en el cual se desean obtener las publicaciones.
 * @param {string} [token] - (Opcional) El token temporal para la autenticación.
 * @returns {Promise<BlogPost[]>} - Una promesa que resuelve a un array de objetos BlogPost.
 * @throws {Error} - Si falla la solicitud.
 */
export const getBlogPosts = async (
  idioma: string,
  token?: string,
  signal?: AbortSignal
): Promise<BlogPost[]> => {
  try {
    const apiUrl = getApiUrl();
    const validatedLanguage = requireSupportedLanguage(idioma);

    const response = await requestWithTimedToken(
      (authToken) =>
        axios.get<unknown>(apiUrl, {
          headers: {
            "x-timed-token": authToken,
          },
          params: { idioma: validatedLanguage },
          timeout: READ_REQUEST_TIMEOUT_MS,
          signal,
        }),
      token,
      signal
    );
    if (!Array.isArray(response.data)) {
      throw new Error("La respuesta del servidor para el listado del blog no tiene el formato esperado.");
    }

    const validPosts = response.data.filter((post) =>
      isBlogPost(post, { idioma: validatedLanguage })
    );
    const discardedPosts = response.data.length - validPosts.length;
    if (discardedPosts > 0) {
      clientLogger.error(`Se omitieron ${discardedPosts} artículos de blog con datos no válidos.`);
    }

    // Una respuesta repetida no debe duplicar tarjetas, claves React ni rutas. Se
    // conserva la primera aparición porque la API ya entrega el orden editorial esperado.
    const seenIds = new Set<number>();
    const seenSlugs = new Set<string>();
    const uniquePosts: BlogPost[] = [];
    let duplicatePosts = 0;

    for (const post of validPosts) {
      const normalizedSlug = normalizeBlogSlug(post.slug) as string;
      if (seenIds.has(post.id_noticia) || seenSlugs.has(normalizedSlug)) {
        duplicatePosts += 1;
        continue;
      }

      seenIds.add(post.id_noticia);
      seenSlugs.add(normalizedSlug);
      uniquePosts.push(normalizeBlogPost({ ...post, slug: normalizedSlug }));
    }

    if (duplicatePosts > 0) {
      clientLogger.error(`Se omitieron ${duplicatePosts} artículos de blog con identificador o slug duplicado.`);
    }

    return uniquePosts;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene una publicación de blog específica por su ID y en el idioma especificado.
 *
 * @param {number} id - El identificador único de la publicación de blog.
 * @param {string} idioma - El idioma en el cual se desea obtener la publicación.
 * @param {string} [token] - (Opcional) El token temporal para la autenticación.
 * @returns {Promise<BlogPost>} - Una promesa que resuelve al objeto BlogPost correspondiente.
 * @throws {Error} - Si falla la solicitud.
 */
export const getBlogPostById = async (
  id: number,
  idioma: string,
  token?: string,
  signal?: AbortSignal
): Promise<BlogPost> => {
  try {
    const apiUrl = getApiUrl();
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("El identificador del artículo debe ser un entero mayor que cero.");
    }
    const validatedLanguage = requireSupportedLanguage(idioma);
    const response = await requestWithTimedToken(
      (authToken) =>
        axios.get<unknown>(`${apiUrl}/by-id/${id}`, {
          headers: {
            "x-timed-token": authToken,
          },
          params: { idioma: validatedLanguage },
          timeout: READ_REQUEST_TIMEOUT_MS,
          signal,
        }),
      token,
      signal
    );
    return requireBlogPost(response.data, { id, idioma: validatedLanguage });
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene una publicación de blog específica por su slug y en el idioma especificado.
 *
 * @param {string} slug - El slug único de la publicación de blog.
 * @param {string} [token] - (Opcional) El token temporal para la autenticación.
 * @param {string} [idioma] - (Opcional) El idioma en el cual se desea obtener la publicación. Solo se aceptan "es", "en" o "de".
 * @returns {Promise<BlogPost>} - Una promesa que resuelve al objeto BlogPost correspondiente.
 * @throws {Error} - Si falla la solicitud o las entradas son inválidas.
 */
export const getBlogPostBySlug = async (
  slug: string,
  token?: string,
  idioma?: string,
  signal?: AbortSignal
): Promise<BlogPost> => {
  try {
    const apiUrl = getApiUrl();

    const normalizedSlug = requireValidSlug(slug);
    const validatedLanguage = idioma ? requireSupportedLanguage(idioma) : undefined;

    // Codificar el slug normalizado para que la ruta y la comparación de identidad
    // utilicen la misma representación Unicode que el backend y la base de datos.
    const encodedSlug = encodeURIComponent(normalizedSlug);

    // Construir la URL incluyendo el slug en la ruta y el idioma como parámetro de consulta
    const url = `${apiUrl}/${encodedSlug}`;
    const params = validatedLanguage ? { idioma: validatedLanguage } : undefined;

    const response = await requestWithTimedToken(
      (authToken) =>
        axios.get<unknown>(url, {
          headers: {
            "x-timed-token": authToken,
          },
          params,
          timeout: READ_REQUEST_TIMEOUT_MS,
          signal,
        }),
      token,
      signal
    );

    return requireBlogPost(response.data, {
      idioma: validatedLanguage,
      slug: normalizedSlug,
    });
  } catch (error) {
    throw error;
  }
};
