import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para internacionalización.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import type { ComponentType } from "react";
import styles from "../styles/blog.module.css"; // Importa estilos CSS específicos para la página de blog.

interface BlogPageProps {
  loadingMessages: boolean; // Nuevo prop para el estado de carga
}

type BlogPageComponent = ComponentType<BlogPageProps> & { pageTitleText?: string };

// Define el componente funcional BlogPage.
const BlogPage = ({ loadingMessages }: BlogPageProps) => {
  const intl = useIntl(); // Utiliza el hook de internacionalización para obtener funciones de traducción.
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  useVisitedPageTracking("blog");
  useVisitedPageTrackingGA("blog");

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <p>{intl.formatMessage({ id: "blog_Descripcion" })}</p>
      {isScrollButtonVisible && (
        <button onClick={scrollToTop} className="scrollTop">
          <img src="/images/web/flechaArriba.png" alt="Subir" />
        </button>
      )}
      <br></br>
    </div>
  );
};

BlogPage.pageTitleText = "blog";

export default BlogPage; // Exporta el componente para su uso en otras partes de la aplicación.
