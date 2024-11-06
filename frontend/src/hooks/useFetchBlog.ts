// hooks/useFetchBlog.ts

import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { getBlogPosts, BlogPost } from "../services/blogService";

/**
 * Interfaz para el valor de retorno del hook `useFetchBlog`.
 * @property {BlogPost[] | null} data - Array de publicaciones del blog o `null` si no se han cargado.
 * @property {boolean} loading - Indica si los datos están en proceso de carga.
 * @property {string | null} error - Mensaje de error, si ocurre uno, o `null` si no hay error.
 */
export interface UseFetchBlogReturn {
  data: BlogPost[] | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook personalizado para obtener las publicaciones del blog en función del idioma actual.
 * Gestiona el estado de carga, el error y los datos obtenidos desde el servicio de blog.
 *
 * @returns {UseFetchBlogReturn} Objeto con los datos, estado de carga y mensaje de error (si existe).
 */
export function useFetchBlog(): UseFetchBlogReturn {
  const intl = useIntl(); // Hook para obtener el idioma actual y la función de internacionalización
  const [data, setData] = useState<BlogPost[] | null>(null); // Estado para almacenar las publicaciones del blog
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado para almacenar mensajes de error

  useEffect(() => {
    let isMounted = true; // Variable para evitar actualizaciones de estado en componentes desmontados

    /**
     * Función asíncrona para obtener las publicaciones del blog en el idioma actual.
     * Actualiza el estado `data` con los resultados o `error` si ocurre una falla.
     */
    const fetchData = async () => {
      setLoading(true);
      try {
        const idioma = intl.locale; // Obtiene el idioma actual desde `intl`
        const result = await getBlogPosts(idioma); // Llama al servicio para obtener las publicaciones del blog
        if (isMounted) {
          setData(result); // Actualiza el estado con los datos obtenidos
        }
      } catch (err) {
        if (isMounted) {
          setError(intl.formatMessage({ id: "blog_Error" })); // Establece un mensaje de error en el idioma actual
        }
      } finally {
        if (isMounted) {
          setLoading(false); // Finaliza el estado de carga
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Marca el componente como desmontado para evitar actualizaciones de estado
    };
  }, [intl.locale]); // Ejecuta el efecto cada vez que cambia el idioma

  return { data, loading, error }; // Retorna el estado de datos, carga y error
}
