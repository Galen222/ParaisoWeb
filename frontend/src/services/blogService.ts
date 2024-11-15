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
  imagen_url_2?: string; // URL de una segunda imagen (opcional).
  fecha_publicacion: string; // Fecha de publicación de la noticia.
  fecha_actualizacion: string; // Fecha de la última actualización de la noticia.
}

/**
 * URL base de la API de blogs, obtenida desde una variable de entorno.
 */
const API_URL = process.env.NEXT_PUBLIC_API_BLOG_URL;

// Verifica que la URL de la API esté definida en las variables de entorno.
if (!API_URL) {
  throw new Error("La variable de entorno NEXT_PUBLIC_API_BLOG_URL no está definida.");
}

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
    // Si no se proporciona el token, lo obtenemos
    const authToken = token || (await getTimedToken());
    const response = await axios.get<BlogPost[]>(`${API_URL}?idioma=${idioma}`, {
      headers: {
        "x-timed-token": authToken,
      },
    });
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
    const authToken = token || (await getTimedToken());
    const response = await axios.get<BlogPost>(`${API_URL}/by-id/${id}?idioma=${idioma}`, {
      headers: {
        "x-timed-token": authToken,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene una publicación de blog específica por su slug y en el idioma especificado.
 *
 * @param {string} slug - El slug único de la publicación de blog.
 * @param {string} [token] - (Opcional) El token temporal para la autenticación.
 * @param {string} [idioma] - (Opcional) El idioma en el cual se desea obtener la publicación.
 * @returns {Promise<BlogPost>} - Una promesa que resuelve al objeto BlogPost correspondiente.
 * @throws {Error} - Si falla la solicitud.
 */
export const getBlogPostBySlug = async (slug: string, token?: string, idioma?: string): Promise<BlogPost> => {
  try {
    const authToken = token || (await getTimedToken());
    const url = idioma ? `${API_URL}/${slug}?idioma=${idioma}` : `${API_URL}/${slug}`;
    const response = await axios.get<BlogPost>(url, {
      headers: {
        "x-timed-token": authToken,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
