// frontend/src/pages/blog.tsx

import React from "react";
import Link from "next/link";
import { useFetchBlog } from "../hooks/useFetchBlog";
import { BlogPost } from "../services/blogService";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import type { ComponentType } from "react";
import errorStyles from "../styles/error.module.css";
import BlogStyles from "../styles/blog.module.css";

interface BlogPageProps {
  loadingMessages: boolean;
}

type BlogPageComponent = ComponentType<BlogPageProps> & { pageTitleText?: string };

const BlogPage: BlogPageComponent = ({ loadingMessages }: BlogPageProps) => {
  const { data: blogs, loading: loadingBlog, error } = useFetchBlog();
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  useVisitedPageTracking("blog");
  useVisitedPageTrackingGA("blog");

  if (loadingMessages || loadingBlog) {
    return <Loader />;
  }

  const imageFileName = "/images/web/error.png";

  if (error) {
    return (
      <div className={errorStyles.errorContainer}>
        <p className={errorStyles.errorText}>{error}</p>
        <div className={errorStyles.imageContainer}>
          <img src={imageFileName} alt="Error" />
        </div>
      </div>
    );
  }

  return (
    <div className={BlogStyles.blogContainer}>
      <div className={BlogStyles.blogGrid}>
        {blogs?.map((blog) => (
          <Link href={`/blog/${blog.slug}`} key={blog.id_noticia} passHref>
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
