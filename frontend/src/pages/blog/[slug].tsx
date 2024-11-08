// pages/blog/[slug].tsx

import React, { useState } from "react";
import Link from "next/link";
import type { ComponentType } from "react";
import Loader from "../../components/Loader";
import ShareLink from "../../components/ShareLink";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/router";
import { useIntl } from "react-intl";
import { useFetchBlogDetails } from "../../hooks/useFetchBlogDetails";
import useScrollToTop from "../../hooks/useScrollToTop";
import { useVisitedPageTracking } from "../../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../../hooks/useTrackingGA";
import { useHandleLanguageChange } from "../../hooks/useHandleLanguageChange";
import errorStyles from "../../styles/pages/error.module.css";
import styles from "../../styles/pages/slug.module.css";

/**
 * Propiedades para el componente BlogDetailsPage.
 * @property {boolean} loadingMessages - Indica si los mensajes de la página están cargando.
 */
export interface BlogDetailsPageProps {
  loadingMessages: boolean;
}

/**
 * Tipo extendido de componente para BlogDetailsPage con una propiedad opcional `pageTitleText`.
 */
export type BlogDetailsPageComponent = ComponentType<BlogDetailsPageProps> & { pageTitleText?: string };

/**
 * Componente para la página de detalles de un blog.
 * Muestra el contenido de una publicación específica, permite compartir la publicación,
 * y realiza el seguimiento del cambio de idioma.
 *
 * @param {BlogDetailsPageProps} props - Propiedades para el componente BlogDetailsPage.
 * @returns {JSX.Element} Página de detalles de la publicación del blog.
 */
const BlogDetailsPage: BlogDetailsPageComponent = ({ loadingMessages }: BlogDetailsPageProps) => {
  const router = useRouter();
  const { slug } = router.query;
  const intl = useIntl();
  const { isScrollButtonVisible, scrollButtonStyle, scrollToTop } = useScrollToTop(); // Hook para manejar el botón de scroll
  const [isPushingBack, setIsPushingBack] = useState(false); // Estado para animaciones del botón de regreso

  useVisitedPageTracking("blog-noticia");
  useVisitedPageTrackingGA("blog-noticia");

  // Usa el hook para obtener los detalles de la publicación
  const { data: blogDetails, loadingBlogDetails, error } = useFetchBlogDetails(slug as string);

  // Usa el hook para manejar el cambio de idioma
  useHandleLanguageChange(blogDetails);

  /**
   * Maneja la animación del botón de regreso.
   */
  const handleBack = async () => {
    setIsPushingBack(true);
  };

  // Muestra un loader si los mensajes o los blogs están en proceso de carga
  if (loadingMessages || loadingBlogDetails) {
    return <Loader className="BD" />;
  }

  const imageError = "/images/web/error.png"; // Imagen de error por defecto

  if (error) {
    return (
      <div className={errorStyles.errorContainer}>
        <p className={errorStyles.errorText}>{error}</p>
        <div className={errorStyles.imageContainer}>
          <img src={imageError} alt="Error" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.blogDetailsContainer}>
      {blogDetails && (
        <div>
          <div className="mt-25p">
            <h1 className={styles.blogTitle}>{blogDetails.titulo}</h1>
          </div>
          <div className="mt-25p">
            <p className={styles.blogAuthor}>
              {intl.formatMessage({ id: "blog_details_Autor" })} {blogDetails.autor}
            </p>
            <p className={styles.blogDate}>
              {intl.formatMessage({ id: "blog_details_Publicado" })} {new Date(blogDetails.fecha_publicacion).toLocaleDateString()}
              {blogDetails.fecha_actualizacion &&
                ` | ${intl.formatMessage({ id: "blog_details_Actualizado" })} ${new Date(blogDetails.fecha_actualizacion).toLocaleDateString()}`}
            </p>
          </div>
          <div className="mt-25p">
            <ShareLink url={typeof window !== "undefined" ? window.location.href : ""} title={blogDetails.titulo} />
          </div>
          <div className="mt-25p">
            <img src={blogDetails.imagen_url} alt={blogDetails.titulo} className={styles.blogImage} />
          </div>
          <div className={`mt-25p ${styles.blogText}`}>
            <ReactMarkdown>{blogDetails.contenido}</ReactMarkdown>
          </div>
          <div className="mt-25p">
            {blogDetails.imagen_url_2 && <img src={blogDetails.imagen_url_2} alt={blogDetails.titulo} className={styles.blogImage} />}
          </div>
          <div>
            <ShareLink url={typeof window !== "undefined" ? window.location.href : ""} title={blogDetails.titulo} />
          </div>
          <div className="text-center mt-25p">
            <Link href="/blog">
              <button
                className={`btn btn-outline-secondary mx-auto ${styles.backButton} ${isPushingBack ? "animate-push" : ""}`}
                onAnimationEnd={() => setIsPushingBack(false)} // Resetea el estado de animación
                onClick={handleBack}
              >
                {intl.formatMessage({ id: "blog_Details_Boton" })} {/* Texto del botón */}
              </button>
            </Link>
          </div>
          <div className="scrollToTopContainer">
            {isScrollButtonVisible && (
              <button onClick={scrollToTop} className="scrollToTop" style={scrollButtonStyle}>
                <img src="/images/web/flechaArriba.png" alt="Subir" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Título de la página
BlogDetailsPage.pageTitleText = "blog";

export default BlogDetailsPage;
