// frontend/src/hooks/useFetchBlog.ts

import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { getBlogPosts, BlogPost } from "../services/blogService";

interface UseFetchBlogReturn {
  data: BlogPost[] | null;
  loading: boolean;
  error: string | null;
}

export function useFetchBlog(): UseFetchBlogReturn {
  const intl = useIntl();
  const [data, setData] = useState<BlogPost[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const idioma = intl.locale;
        const result = await getBlogPosts(idioma);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(intl.formatMessage({ id: "blog_Error" }));
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
