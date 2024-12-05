// services/blogLoader.ts

import { getBlogPostBySlug, getBlogPostById, BlogPost } from "../services/blogService";
import { getTimedToken } from "../services/tokenService";

/**
 * Carga los datos de un artículo del blog.
 * Realiza la redirección si el idioma del blog no coincide con el idioma actual.
 *
 * @param {string} slug - Slug del artículo.
 * @param {string} locale - Idioma actual.
 * @returns {Promise<{ redirect?: { destination: string, permanent: boolean }, blogDetails?: BlogPost | null, error?: string | null }>}
 *          Objeto con detalles del artículo, redirección o error.
 */
export async function loadBlogData(
  slug: string,
  locale: string
): Promise<{
  redirect?: { destination: string; permanent: boolean };
  blogDetails?: BlogPost | null;
  error?: string | null;
}> {
  try {
    const token = await getTimedToken();
    const blogDetails = await getBlogPostBySlug(slug, token, locale);

    // Si el idioma del blog no coincide con el idioma actual
    if (blogDetails.idioma !== locale) {
      const translatedBlogPost = await getBlogPostById(blogDetails.id_noticia, locale, token);

      if (translatedBlogPost) {
        return {
          redirect: {
            destination: `/blog/${translatedBlogPost.slug}`,
            permanent: false,
          },
        };
      }
    }

    return {
      blogDetails,
      error: null,
    };
  } catch (err) {
    console.error("Error al cargar los datos del blog:", err);

    return {
      blogDetails: null,
      error: "Error al cargar el artículo.",
    };
  }
}
