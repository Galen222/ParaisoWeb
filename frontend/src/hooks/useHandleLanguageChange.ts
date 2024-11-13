// hooks/useHandleLanguageChange.ts

import { useEffect } from "react";
import { useIntl } from "react-intl";
import { useRouter } from "next/router";
import { getBlogPostById } from "../services/blogService";

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

  useEffect(() => {
    /**
     * Maneja el cambio de idioma.
     * Si el idioma actual de la aplicación no coincide con el de la noticia,
     * intenta obtener la noticia en el nuevo idioma y redirige a su URL.
     */
    const handleLanguageChange = async () => {
      if (blogDetails) {
        const newIdioma = intl.locale; // Nuevo idioma seleccionado
        if (newIdioma !== blogDetails.idioma) {
          try {
            // Obtiene la noticia en el nuevo idioma usando el ID de la noticia
            const newBlogPost = await getBlogPostById(blogDetails.id_noticia, newIdioma);
            if (newBlogPost) {
              // Redirige al usuario a la URL de la noticia traducida
              router.push(`/blog/${newBlogPost.slug}`);
            } else {
              // Opcional: Manejo del caso donde no existe traducción en el idioma seleccionado
              /* console.warn("No se encontró la traducción de la noticia en el idioma seleccionado."); */
            }
          } catch (err) {
            /* // console.error("Error al cambiar de idioma:", err); */
          }
        }
      }
    };

    handleLanguageChange();
  }, [intl.locale, blogDetails, router]); // Ejecuta el efecto cuando cambian el idioma o los detalles del blog
};
