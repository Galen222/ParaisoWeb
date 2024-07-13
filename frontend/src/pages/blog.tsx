import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para internacionalización.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import styles from "../styles/blog.module.css"; // Importa estilos CSS específicos para la página de blog.

// Define el componente funcional BlogPage.
const BlogPage = () => {
  const intl = useIntl(); // Utiliza el hook de internacionalización para obtener funciones de traducción.
  const [loading, setLoading] = useState(true);

  useVisitedPageTracking("blog");
  useVisitedPageTrackingGA("blog");

  // Renderiza la interfaz de la página del blog.

  useEffect(() => {
    if (intl) {
      setLoading(false);
    }
  }, [intl]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "blog_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "blog_Descripcion" })}</p>
    </div>
  );
};

export default BlogPage; // Exporta el componente para su uso en otras partes de la aplicación.
