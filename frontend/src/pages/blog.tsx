import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para internacionalización.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import styles from "../styles/blog.module.css"; // Importa estilos CSS específicos para la página de blog.

interface BlogPageProps {
  loadingMessages: boolean; // Nuevo prop para el estado de carga
}

// Define el componente funcional BlogPage.
const BlogPage = ({ loadingMessages }: BlogPageProps) => {
  const intl = useIntl(); // Utiliza el hook de internacionalización para obtener funciones de traducción.

  useVisitedPageTracking("blog");
  useVisitedPageTrackingGA("blog");

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <h1>{intl.formatMessage({ id: "blog_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "blog_Descripcion" })}</p>
    </div>
  );
};

export default BlogPage; // Exporta el componente para su uso en otras partes de la aplicación.
