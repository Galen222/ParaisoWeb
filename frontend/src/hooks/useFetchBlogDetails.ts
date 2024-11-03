// hooks/useFetchBlogDetails.ts

import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { getBlogPostBySlug, BlogPost } from "../services/blogService";

/**
 * Interfaz para el valor de retorno del hook `useFetchBlogDetails`.
 * @property {BlogPost | null} data - Datos de la publicación del blog o `null` si no se ha cargado.
 * @property {boolean} loadingBlogDetails - Indica si los detalles están en proceso de carga.
 * @property {string | null} error - Mensaje de error, si ocurre uno, o `null` si no hay error.
 */
interface UseFetchBlogDetailsReturn {
  data: BlogPost | null;
  loadingBlogDetails: boolean;
  error: string | null;
}

/**
 * Hook personalizado para obtener los detalles de una publicación específica del blog
 * basada en un slug. Gestiona el estado de carga, el error y los datos obtenidos desde
 * el servicio de blog.
 *
 * @param {string} slug - Slug único que identifica la publicación del blog.
 * @returns {UseFetchBlogDetailsReturn} Objeto con los datos, estado de carga y mensaje de error (si existe).
 */
export function useFetchBlogDetails(slug: string): UseFetchBlogDetailsReturn {
  const intl = useIntl(); // Hook para obtener el idioma actual y la función de internacionalización
  const [data, setData] = useState<BlogPost | null>(null); // Estado para almacenar los detalles de la publicación
  const [loadingBlogDetails, setLoadingBlogDetails] = useState<boolean>(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado para almacenar mensajes de error

  useEffect(() => {
    let isMounted = true; // Variable para evitar actualizaciones de estado en componentes desmontados

    /**
     * Función asíncrona para obtener los detalles de una publicación del blog en base al slug.
     * Actualiza el estado `data` con los resultados o `error` si ocurre una falla.
     */
    const fetchData = async () => {
      setLoadingBlogDetails(true);
      try {
        const result = await getBlogPostBySlug(slug); // Llama al servicio para obtener los detalles de la publicación
        if (isMounted) {
          setData(result); // Actualiza el estado con los datos obtenidos
        }
      } catch (err) {
        if (isMounted) {
          setError(intl.formatMessage({ id: "blog_Details_Error" })); // Establece un mensaje de error en el idioma actual
        }
      } finally {
        if (isMounted) {
          setLoadingBlogDetails(false); // Finaliza el estado de carga
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Marca el componente como desmontado para evitar actualizaciones de estado
    };
  }, [intl.locale, slug]); // Ejecuta el efecto cada vez que cambian el idioma o el slug

  return { data, loadingBlogDetails, error }; // Retorna el estado de datos, carga y error
}
