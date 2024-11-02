// frontend/src/pages/blog/[slug].tsx

import React from "react";
import { useRouter } from "next/router";
import { useIntl } from "react-intl";
import Loader from "../../components/Loader";
import { useFetchBlogDetails } from "../../hooks/useFetchBlogDetails";
import useScrollToTop from "../../hooks/useScrollToTop";
import ReactMarkdown from "react-markdown";
import errorStyles from "../../styles/error.module.css";
import blogStyles from "../../styles/blogDetails.module.css";
import type { ComponentType } from "react";

interface BlogDetailsPageProps {
  loadingMessages: boolean;
}

type BlogDetailsPageComponent = ComponentType<BlogDetailsPageProps> & { pageTitleText?: string };

const BlogDetailsPage: BlogDetailsPageComponent = ({ loadingMessages }: BlogDetailsPageProps) => {
  const router = useRouter();
  const { slug } = router.query;
  const intl = useIntl();
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  // Usa el nuevo hook para obtener los detalles del post
  const { data: blogDetails, loadingBlogDetails, error } = useFetchBlogDetails(slug as string);

  if (loadingMessages || loadingBlogDetails) {
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
    <div className={blogStyles.blogDetailsContainer}>
      {blogDetails && (
        <div>
          <div className="mt-25p">
            <h1 className={blogStyles.blogTitle}>{blogDetails.titulo}</h1>
          </div>
          <div className="mt-25p">
            <p className={blogStyles.blogAuthor}>
              {intl.formatMessage({ id: "blog_details_Autor" })} {blogDetails.autor}
            </p>
            <p className={blogStyles.blogDate}>
              {intl.formatMessage({ id: "blog_details_Publicado" })} {new Date(blogDetails.fecha_publicacion).toLocaleDateString()}
              {blogDetails.fecha_actualizacion &&
                ` | ${intl.formatMessage({ id: "blog_details_Actualizado" })} ${new Date(blogDetails.fecha_actualizacion).toLocaleDateString()}`}
            </p>
          </div>
          <div className="mt-25p">
            <img src={blogDetails.imagen_url} alt={blogDetails.titulo} className={blogStyles.blogImage} />
          </div>
          <div className={`mt-25p ${blogStyles.blogText}`}>
            <ReactMarkdown>{blogDetails.contenido}</ReactMarkdown>
          </div>
          <div className="mt-25p">
            {blogDetails.imagen_url_2 && <img src={blogDetails.imagen_url_2} alt={blogDetails.titulo} className={blogStyles.blogImage} />}
          </div>
        </div>
      )}
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

BlogDetailsPage.pageTitleText = "blog";

export default BlogDetailsPage;
