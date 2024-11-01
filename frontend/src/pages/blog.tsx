import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import type { ComponentType } from "react";
import { getBlogPosts, BlogPost } from "../services/blogService";
import ReactMarkdown from "react-markdown";
import errorStyles from "../styles/error.module.css";
import BlogStyles from "../styles/blog.module.css";

interface BlogPageProps {
  loadingMessages: boolean;
}

type BlogPageComponent = ComponentType<BlogPageProps> & { pageTitleText?: string };

const BlogPage: BlogPageComponent = ({ loadingMessages }: BlogPageProps) => {
  const intl = useIntl();
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();
  const [blogs, setBlog] = useState<BlogPost[]>([]);
  const [loadingBlog, setLoadingBlog] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useVisitedPageTracking("blog");
  useVisitedPageTrackingGA("blog");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const idioma = intl.locale;
        const data = await getBlogPosts(idioma);
        setBlog(data);
      } catch (error) {
        setError(intl.formatMessage({ id: "blog_Error" }));
      } finally {
        setLoadingBlog(false);
      }
    };
    fetchBlog();
  }, [intl.locale]);

  if (loadingMessages || loadingBlog) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className={errorStyles.errorContainer}>
        <p className={errorStyles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div className="pageContainer">
      <div className={BlogStyles.blogGrid}>
        {blogs.map((blog) => (
          <Link
            href={`/blog/${blog.id_noticia}-${encodeURIComponent(blog.titulo.toLowerCase().replace(/\s+/g, "-").substring(0, 30))}`}
            key={blog.id_noticia}
            passHref
          >
            <div className={BlogStyles.blogCard}>
              <img src={blog.imagen_url} alt={blog.titulo} className={BlogStyles.blogImage} />
              <div className={BlogStyles.blogContent}>
                <h2>{blog.titulo}</h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div>
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollTop">
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

BlogPage.pageTitleText = "blog";

export default BlogPage;
