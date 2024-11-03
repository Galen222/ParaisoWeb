// pages/blog.tsx

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

/**
 * Propiedades para el componente `BlogPage`.
 * @property {boolean} loadingMessages - Indica si los mensajes están en proceso de carga.
 */
interface BlogPageProps {
  loadingMessages: boolean;
}

/**
 * Tipo de componente para `BlogPage` que incluye una propiedad opcional `pageTitleText`.
 */
type BlogPageComponent = ComponentType<BlogPageProps> & { pageTitleText?: string };

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
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  // Seguimiento de la visita a la página "blog" para análisis interno y Google Analytics
  useVisitedPageTracking("blog");
  useVisitedPageTrackingGA("blog");

  // Muestra un loader si los mensajes o los blogs están en proceso de carga
  if (loadingMessages || loadingBlog) {
    return <Loader />;
  }

  // Ruta de la imagen de error
  const imageFileName = "/images/web/error.png";

  // Renderiza un mensaje de error si ocurre un error en la carga de datos
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
      <div className={BlogStyles.content}>
        {blogs?.map((blog) => (
          <Link className={BlogStyles.blogLink} href={`/blog/${blog.slug}`} key={blog.id_noticia} passHref>
            <div className={BlogStyles.blogCard}>
              <div className={BlogStyles.imageContainer}>
                <img src={blog.imagen_url} alt={blog.titulo} className={BlogStyles.blogImage} />
              </div>
              <div className={BlogStyles.blogText}>
                <p>{blog.titulo}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {/* Botón de desplazamiento hacia arriba */}
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

// Asigna un texto de título de página específico
BlogPage.pageTitleText = "blog";

export default BlogPage; // Exporta el componente para su uso en la aplicación
