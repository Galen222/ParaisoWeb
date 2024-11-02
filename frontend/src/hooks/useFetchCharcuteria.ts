// frontend/src/hooks/useFetchCharcuteria.ts

import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { getCharcuteriaProducts, CharcuteriaProduct } from "../services/charcuteriaService";

interface UseFetchCharcuteriaReturn {
  data: CharcuteriaProduct[] | null;
  loading: boolean;
  error: string | null;
}

export function useFetchCharcuteria(): UseFetchCharcuteriaReturn {
  const intl = useIntl();
  const [data, setData] = useState<CharcuteriaProduct[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const idioma = intl.locale;
        const result = await getCharcuteriaProducts(idioma);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(intl.formatMessage({ id: "charcuteria_Error" }));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [intl.locale]);

  return { data, loading, error };
}
