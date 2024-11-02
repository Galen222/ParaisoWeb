// frontend/src/hooks/useFetch.ts

import { useEffect, useState } from "react";
import { useIntl } from "react-intl";

interface UseFetchProps<T> {
  fetchFunction: (locale: string) => Promise<T>;
  errorMessagePage: string; // Cambiado de errorMessageId a errorMessagePage
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>({ fetchFunction, errorMessagePage }: UseFetchProps<T>): UseFetchReturn<T> {
  const intl = useIntl();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Para evitar actualizaciones en componentes desmontados

    const fetchData = async () => {
      setLoading(true);
      try {
        const idioma = intl.locale;
        const result = await fetchFunction(idioma);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessageId = `${errorMessagePage}_Error`;
          setError(intl.formatMessage({ id: errorMessageId }));
          console.error("Error accediendo a los datos: ", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Limpieza para evitar actualizaciones si el componente se desmonta
    };
  }, [intl.locale, fetchFunction, errorMessagePage]);

  return { data, loading, error };
}
