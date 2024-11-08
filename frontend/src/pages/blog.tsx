// pages/blog.tsx

import React from "react";
import Link from "next/link";
import type { ComponentType } from "react";
import Loader from "../components/Loader";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import { useFetchBlog } from "../hooks/useFetchBlog";
import useScrollToTop from "../hooks/useScrollToTop";
import errorStyles from "../styles/pages/error.module.css";
import styles from "../styles/pages/blog.module.css";

/**
 * Propiedades para el componente `BlogPage`.
 * @property {boolean} loadingMessages - Indica si los mensajes están en proceso de carga.
 */
export interface BlogPageProps {
  loadingMessages: boolean;
}

/**
 * Tipo de componente para `BlogPage` que incluye una propiedad opcional `pageTitleText`.
 */
export type BlogPageComponent = ComponentType<BlogPageProps> & { pageTitleText?: string };

/**
 * Componente funcional para la página del blog.
 * Muestra una lista de publicaciones del blog en formato de tarjetas enlazadas a sus detalles.
 *
 * @param {BlogPageProps} props - Propiedades para el componente `BlogPage`.
 * @returns {JSX.Element} Página del Blog.
 */
const BlogPage: BlogPageComponent = ({ loadingMessages }: BlogPageProps) => {
  // Hook para obtener las publicaciones del blog
  const { data: blogs, loading: loadingBlog, error } = useFetchBlog();

  // Hook para manejar el botón de desplazamiento hacia arriba
  const { isScrollButtonVisible, scrollButtonStyle, scrollToTop } = useScrollToTop(); // Hook para manejar el botón de scroll

  // Seguimiento de la visita a la página "blog" para análisis interno y Google Analytics
  useVisitedPageTracking("blog");
  useVisitedPageTrackingGA("blog");

  // Muestra un loader si los mensajes o los blogs están en proceso de carga
  if (loadingMessages || loadingBlog) {
    return <Loader className="BD" />;
  }

  // Ruta de la imagen de error
  const imageError = "/images/web/error.png";

  // Renderiza un mensaje de error si ocurre un error en la carga de datos
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
    <div className={styles.blogContainer}>
      <div className={styles.content}>
        {blogs?.map((blog) => (
          <Link className={styles.blogLink} href={`/blog/${blog.slug}`} key={blog.id_noticia} passHref>
            <div className={styles.blogCard}>
              <div className={styles.imageContainer}>
                <img src={blog.imagen_url} alt={blog.titulo} className={styles.blogImage} />
              </div>
              <div className={styles.blogText}>
                <p>{blog.titulo}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {/* Botón de desplazamiento hacia arriba */}
      <div className="scrollToTopContainer">
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollToTop" style={scrollButtonStyle}>
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

// Asigna un texto de título de página específico
BlogPage.pageTitleText = "blog";

export default BlogPage; // Exporta el componente para su uso en la aplicación
