// frontend/src/hooks/useFetchBlogDetails.ts

import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { getBlogPostBySlug, BlogPost } from "../services/blogService";

interface UseFetchBlogDetailsReturn {
  data: BlogPost | null;
  loadingBlogDetails: boolean;
  error: string | null;
}

export function useFetchBlogDetails(slug: string): UseFetchBlogDetailsReturn {
  const intl = useIntl();
  const [data, setData] = useState<BlogPost | null>(null);
  const [loadingBlogDetails, setLoadingBlogDetails] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoadingBlogDetails(true);
      try {
        const result = await getBlogPostBySlug(slug);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(intl.formatMessage({ id: "blog_Details_Error" }));
        }
      } finally {
        if (isMounted) {
          setLoadingBlogDetails(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [intl.locale, slug]);

  return { data, loadingBlogDetails, error };
}
