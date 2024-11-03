// pages/blog/[slug].tsx

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useIntl } from "react-intl";
import Loader from "../../components/Loader";
import { useFetchBlogDetails } from "../../hooks/useFetchBlogDetails";
import useScrollToTop from "../../hooks/useScrollToTop";
import { useVisitedPageTracking } from "../../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../../hooks/useTrackingGA";
import ReactMarkdown from "react-markdown";
import errorStyles from "../../styles/error.module.css";
import blogDetailsStyles from "../../styles/blogDetails.module.css";
import type { ComponentType } from "react";
import ShareLink from "../../components/ShareLink";
import { useHandleLanguageChange } from "../../hooks/useHandleLanguageChange"; // Nuevo hook

/**
 * Propiedades para el componente BlogDetailsPage.
 * @property {boolean} loadingMessages - Indica si los mensajes de la página están cargando.
 */
interface BlogDetailsPageProps {
  loadingMessages: boolean;
}

/**
 * Tipo extendido de componente para BlogDetailsPage con una propiedad opcional `pageTitleText`.
 */
type BlogDetailsPageComponent = ComponentType<BlogDetailsPageProps> & { pageTitleText?: string };

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
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();
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

  if (loadingMessages || loadingBlogDetails) {
    return <Loader />; // Muestra un loader mientras los mensajes o datos están cargando
  }

  const imageFileName = "/images/web/error.png"; // Imagen de error por defecto

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
    <div className={blogDetailsStyles.blogDetailsContainer}>
      {blogDetails && (
        <div>
          <div className="mt-25p">
            <h1 className={blogDetailsStyles.blogTitle}>{blogDetails.titulo}</h1>
          </div>
          <div className="mt-25p">
            <p className={blogDetailsStyles.blogAuthor}>
              {intl.formatMessage({ id: "blog_details_Autor" })} {blogDetails.autor}
            </p>
            <p className={blogDetailsStyles.blogDate}>
              {intl.formatMessage({ id: "blog_details_Publicado" })} {new Date(blogDetails.fecha_publicacion).toLocaleDateString()}
              {blogDetails.fecha_actualizacion &&
                ` | ${intl.formatMessage({ id: "blog_details_Actualizado" })} ${new Date(blogDetails.fecha_actualizacion).toLocaleDateString()}`}
            </p>
          </div>
          <div className="mt-25p">
            <ShareLink url={typeof window !== "undefined" ? window.location.href : ""} title={blogDetails.titulo} />
          </div>
          <div className="mt-25p">
            <img src={blogDetails.imagen_url} alt={blogDetails.titulo} className={blogDetailsStyles.blogImage} />
          </div>
          <div className={`mt-25p ${blogDetailsStyles.blogText}`}>
            <ReactMarkdown>{blogDetails.contenido}</ReactMarkdown>
          </div>
          <div className="mt-25p">
            {blogDetails.imagen_url_2 && <img src={blogDetails.imagen_url_2} alt={blogDetails.titulo} className={blogDetailsStyles.blogImage} />}
          </div>
          <div>
            <ShareLink url={typeof window !== "undefined" ? window.location.href : ""} title={blogDetails.titulo} />
          </div>
          <div className="text-center mt-25p">
            <Link href="/blog">
              <button
                className={`btn btn-outline-secondary mx-auto ${blogDetailsStyles.backButton} ${isPushingBack ? "animate-push" : ""}`}
                onAnimationEnd={() => setIsPushingBack(false)} // Resetea el estado de animación
                onClick={handleBack}
              >
                {intl.formatMessage({ id: "blog_Details_Boton" })} {/* Texto del botón */}
              </button>
            </Link>
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

// Título de la página
BlogDetailsPage.pageTitleText = "blog";

export default BlogDetailsPage;
