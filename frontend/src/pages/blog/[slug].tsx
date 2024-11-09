// pages/blog/[slug].tsx

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ComponentType } from "react";
import Loader from "../../components/Loader";
import ShareLink from "../../components/ShareLink";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import ReactMarkdown from "react-markdown";
import { useIntl } from "react-intl";
import { useFetchBlogDetails } from "../../hooks/useFetchBlogDetails";
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

// Define la ruta base de las imágenes
const IMAGE_BASE_URL = "/images/blog/";

/**
 * Componente para la página de detalles de un blog.
 * Muestra el contenido de una publicación específica, permite compartir la publicación,
 * y realiza el seguimiento del cambio de idioma.
 *
 * @param {BlogDetailsPageProps} props - Propiedades para el componente BlogDetailsPage.
 * @returns {JSX.Element} Página de detalles de la publicación del blog.
 */
const BlogDetailsPage: BlogDetailsPageComponent = ({ loadingMessages }: BlogDetailsPageProps): JSX.Element => {
  const router = useRouter();
  const { slug } = router.query;
  const intl = useIntl();
  const [isPushingBack, setIsPushingBack] = useState(false); // Estado para animaciones del botón de regreso

  useVisitedPageTracking("blog-noticia");
  useVisitedPageTrackingGA("blog-noticia");

  // Usa el hook para obtener los detalles de la publicación
  const { data: blogDetails, loadingBlogDetails, error } = useFetchBlogDetails(slug as string);

  // Usa el hook para manejar el cambio de idioma
  useHandleLanguageChange(blogDetails);

  // Imagen de error por defecto
  const imageError = "/images/web/error.png";

  // Maneja la animación del botón de regreso
  const handleBack = async () => {
    setIsPushingBack(true);
  };

  // Muestra un loader si los mensajes o los blogs están en proceso de carga
  if (loadingMessages || loadingBlogDetails) {
    return <Loader className="BD" />;
  }

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
              {/* Verifica si la fecha de actualización es diferente a la de publicación */}
              {blogDetails.fecha_actualizacion &&
                new Date(blogDetails.fecha_actualizacion).toLocaleDateString() !== new Date(blogDetails.fecha_publicacion).toLocaleDateString() &&
                ` | ${intl.formatMessage({ id: "blog_details_Actualizado" })} ${new Date(blogDetails.fecha_actualizacion).toLocaleDateString()}`}
            </p>
          </div>
          <div className="mt-25p">
            <ShareLink url={typeof window !== "undefined" ? window.location.href : ""} title={blogDetails.titulo} />
          </div>
          {/* Imagen principal del blog */}
          {blogDetails.imagen_url && (
            <div className="mt-25p">
              <img src={`${IMAGE_BASE_URL}${blogDetails.imagen_url}`} alt={blogDetails.titulo} className={styles.blogImage} />
            </div>
          )}
          {/* Contenido del blog */}
          <div className={`mt-25p ${styles.blogText}`}>
            <ReactMarkdown>{blogDetails.contenido}</ReactMarkdown>
          </div>
          {/* Imagen secundaria del blog, si está presente */}
          {blogDetails.imagen_url_2 && (
            <div className="mt-25p">
              <img src={`${IMAGE_BASE_URL}${blogDetails.imagen_url_2}`} alt={blogDetails.titulo} className={styles.blogImage} />
            </div>
          )}
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
          {/* Botón para desplazarse hacia arriba */}
          <ScrollToTopButton /> {/* Usa el componente de scroll-to-top */}
        </div>
      )}
    </div>
  );
};

// Título de la página
BlogDetailsPage.pageTitleText = "blog";

export default BlogDetailsPage; // Exporta el componente para ser usado en la aplicación.
