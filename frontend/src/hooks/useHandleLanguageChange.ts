// frontend/src/hooks/useHandleLanguageChange.ts

import { useEffect } from "react";
import { useIntl } from "react-intl";
import { useRouter } from "next/router";
import { getBlogPostById } from "../services/blogService";

interface BlogDetails {
  id_noticia: number; // Ahora es de tipo number
  idioma: string;
  slug: string;
}

export const useHandleLanguageChange = (blogDetails: BlogDetails | null) => {
  const intl = useIntl();
  const router = useRouter();

  useEffect(() => {
    const handleLanguageChange = async () => {
      if (blogDetails) {
        const newIdioma = intl.locale;
        if (newIdioma !== blogDetails.idioma) {
          try {
            // Obtiene la noticia correspondiente en el nuevo idioma
            const newBlogPost = await getBlogPostById(blogDetails.id_noticia, newIdioma);
            if (newBlogPost) {
              // Redirige al usuario a la nueva URL con el slug correspondiente
              router.push(`/blog/${newBlogPost.slug}`);
            } else {
              // Opcional: Manejar el caso donde no existe la traducción
              console.warn("No se encontró la traducción de la noticia en el idioma seleccionado.");
            }
          } catch (err) {
            console.error("Error al cambiar de idioma:", err);
            // Opcional: Mostrar un mensaje de error al usuario
          }
        }
      }
    };

    handleLanguageChange();
  }, [intl.locale, blogDetails, router]);
};
