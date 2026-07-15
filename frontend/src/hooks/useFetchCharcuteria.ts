// hooks/useFetchCharcuteria.ts

import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { getCharcuteriaProducts, CharcuteriaProduct } from "../services/charcuteriaService";

/**
 * Interfaz para el valor de retorno del hook `useFetchCharcuteria`.
 * @property {CharcuteriaProduct[] | null} data - Array de productos de charcutería o `null` si no se han cargado.
 * @property {boolean} loading - Indica si los datos están en proceso de carga.
 * @property {string | null} error - Mensaje de error, si ocurre uno, o `null` si no hay error.
 */
export interface UseFetchCharcuteriaReturn {
  data: CharcuteriaProduct[] | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook personalizado para obtener los productos de charcutería en función del idioma actual.
 * Gestiona el estado de carga, el error y los datos obtenidos desde el servicio de charcutería.
 *
 * @returns {UseFetchCharcuteriaReturn} Objeto con los datos, estado de carga y mensaje de error (si existe).
 */
export function useFetchCharcuteria(): UseFetchCharcuteriaReturn {
  const { locale, formatMessage } = useIntl(); // Hook para obtener el idioma actual y la función de internacionalización
  const [data, setData] = useState<CharcuteriaProduct[] | null>(null); // Estado para almacenar los productos de charcutería
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado para almacenar mensajes de error

  useEffect(() => {
    let isMounted = true; // Evita actualizaciones de estado en componentes desmontados
    const controller = new AbortController(); // Permite cancelar la petición cuando queda obsoleta

    /**
     * Función asíncrona para obtener los productos de charcutería en el idioma actual.
     * Actualiza el estado `data` con los resultados o `error` si ocurre una falla.
     */
    const fetchData = async () => {
      setLoading(true);
      setData(null); // Evita conservar datos del idioma anterior durante la nueva carga.
      setError(null); // Limpia un error anterior antes de volver a intentar la carga
      try {
        const idioma = locale; // Obtiene el idioma actual desde `intl`
        const result = await getCharcuteriaProducts(idioma, controller.signal); // Llama al servicio para obtener los productos de charcutería
        if (isMounted) {
          setData(result); // Actualiza el estado con los datos obtenidos
        }
      } catch {
        if (isMounted) {
          setError(formatMessage({ id: "charcuteria_Error" })); // Establece un mensaje de error en el idioma actual
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
      controller.abort(); // Cancela la lectura obsoleta para no consumir token, red ni rate limit.
    };
  }, [formatMessage, locale]); // Ejecuta el efecto cada vez que cambia el idioma

  return { data, loading, error }; // Retorna el estado de datos, carga y error
}
