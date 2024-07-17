import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import styles from "../styles/about.module.css"; // Importa los estilos específicos para la página About

interface AboutPageProps {
  loadingMessages: boolean; // Nuevo prop para el estado de carga
}

const AboutPage = ({ loadingMessages }: AboutPageProps) => {
  const intl = useIntl(); // Inicializa el hook de internacionalización para usar en este componente

  useVisitedPageTracking("about");
  useVisitedPageTrackingGA("about");

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "about_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "about_Descripcion" })}</p>
    </div>
  );
};

export default AboutPage; // Exporta el componente para ser usado en otras partes de la aplicación
