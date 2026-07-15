// services/blogService.ts

/**
 * Servicio para manejar las operaciones relacionadas con el blog.
 */

import axios from "axios";
import { getTimedToken } from "./tokenService";

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
const MAX_SLUG_LENGTH = 150;
const VALID_SLUG_PATTERN = /^[\p{L}\p{N}\p{M}-]+$/u;

interface ExpectedBlogIdentity {
  id?: number;
  idioma?: string;
  slug?: string;
}

/** Valida los idiomas que existen en las rutas y en la base de datos. */
const requireSupportedLanguage = (idioma: string): string => {
  if (!SUPPORTED_LANGUAGES.has(idioma)) {
    throw new Error(`El idioma "${idioma}" no es válido. Solo se permiten: es, en, de.`);
  }

  return idioma;
};


/**
 * Obtiene la URL configurada sin hacer fallar la importación del módulo durante el build.
 */
const getApiUrl = (): string => {
  if (!API_URL) {
    throw new Error("La variable de entorno NEXT_PUBLIC_API_BLOG_URL no está definida.");
  }

  return API_URL;
};

/** Comprueba en tiempo de ejecución que una respuesta conserva el contrato del blog. */
const isBlogPost = (value: unknown, expected: ExpectedBlogIdentity = {}): value is BlogPost => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const post = value as Record<string, unknown>;
  const normalizedExpectedSlug = expected.slug?.normalize("NFC");
  const normalizedResponseSlug = typeof post.slug === "string" ? post.slug.normalize("NFC") : null;

  return (
    Number.isInteger(post.id_noticia) &&
    typeof post.id_noticia === "number" &&
    post.id_noticia > 0 &&
    typeof post.idioma === "string" &&
    SUPPORTED_LANGUAGES.has(post.idioma) &&
    typeof post.slug === "string" &&
    post.slug.length > 0 &&
    post.slug.length <= MAX_SLUG_LENGTH &&
    VALID_SLUG_PATTERN.test(post.slug) &&
    typeof post.titulo === "string" &&
    typeof post.contenido === "string" &&
    typeof post.autor === "string" &&
    typeof post.imagen_url === "string" &&
    (post.imagen_url_2 === undefined || post.imagen_url_2 === null || typeof post.imagen_url_2 === "string") &&
    typeof post.fecha_publicacion === "string" &&
    (post.fecha_actualizacion === null || typeof post.fecha_actualizacion === "string") &&
    (expected.id === undefined || post.id_noticia === expected.id) &&
    (expected.idioma === undefined || post.idioma === expected.idioma) &&
    (normalizedExpectedSlug === undefined || normalizedResponseSlug === normalizedExpectedSlug)
  );
};

/** Rechaza respuestas 2xx mal formadas antes de que provoquen un error durante el render. */
const requireBlogPost = (value: unknown, expected: ExpectedBlogIdentity = {}): BlogPost => {
  if (!isBlogPost(value, expected)) {
    throw new Error("La respuesta del servidor para el blog no tiene el formato esperado.");
  }

  return value;
};

/**
 * Obtiene la lista de publicaciones del blog en el idioma especificado.
 *
 * @param {string} idioma - El idioma en el cual se desean obtener las publicaciones.
 * @param {string} [token] - (Opcional) El token temporal para la autenticación.
 * @returns {Promise<BlogPost[]>} - Una promesa que resuelve a un array de objetos BlogPost.
 * @throws {Error} - Si falla la solicitud.
 */
export const getBlogPosts = async (idioma: string, token?: string): Promise<BlogPost[]> => {
  try {
    const apiUrl = getApiUrl();
    const validatedLanguage = requireSupportedLanguage(idioma);

    // Si no se proporciona el token, lo obtenemos
    const authToken = token || (await getTimedToken());
    const response = await axios.get<unknown>(apiUrl, {
      headers: {
        "x-timed-token": authToken,
      },
      params: { idioma: validatedLanguage },
    });
    if (
      !Array.isArray(response.data) ||
      !response.data.every((post) => isBlogPost(post, { idioma: validatedLanguage }))
    ) {
      throw new Error("La respuesta del servidor para el listado del blog no tiene el formato esperado.");
    }

    return response.data;
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
export const getBlogPostById = async (id: number, idioma: string, token?: string): Promise<BlogPost> => {
  try {
    const apiUrl = getApiUrl();
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("El identificador del artículo debe ser un entero mayor que cero.");
    }
    const validatedLanguage = requireSupportedLanguage(idioma);
    const authToken = token || (await getTimedToken());
    const response = await axios.get<unknown>(`${apiUrl}/by-id/${id}`, {
      headers: {
        "x-timed-token": authToken,
      },
      params: { idioma: validatedLanguage },
    });
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
export const getBlogPostBySlug = async (slug: string, token?: string, idioma?: string): Promise<BlogPost> => {
  try {
    const apiUrl = getApiUrl();

    // Validar y sanitizar los inputs
    if (slug.length === 0 || slug.length > MAX_SLUG_LENGTH || !VALID_SLUG_PATTERN.test(slug)) {
      // Caracteres inválidos individuales
      const invalidChars = slug.match(/[^\p{L}\p{N}\p{M}-]/gu) || [];
      const invalidList = Array.from(new Set(invalidChars)).join(", ");

      // Vista resaltada del slug, envolviendo los inválidos entre corchetes
      const highlighted = Array.from(slug)
        .map((ch) => (/[\p{L}\p{N}\p{M}-]/u.test(ch) ? ch : `[${ch}]`))
        .join("");

      throw new Error(`El slug "${slug}" contiene caracteres no permitidos: ${invalidList}. Vista resaltada: ${highlighted}`);
    }

    const validatedLanguage = idioma ? requireSupportedLanguage(idioma) : undefined;

    // Si no se proporciona el token, lo obtenemos
    const authToken = token || (await getTimedToken());

    // Codificar el slug para incluirlo de forma segura en la URL
    const encodedSlug = encodeURIComponent(slug);

    // Construir la URL incluyendo el slug en la ruta y el idioma como parámetro de consulta
    const url = `${apiUrl}/${encodedSlug}`;
    const params = validatedLanguage ? { idioma: validatedLanguage } : undefined;

    const response = await axios.get<unknown>(url, {
      headers: {
        "x-timed-token": authToken,
      },
      params,
    });

    return requireBlogPost(response.data, {
      idioma: validatedLanguage,
      slug,
    });
  } catch (error) {
    throw error;
  }
};
