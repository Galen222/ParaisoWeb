import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import type { ComponentType } from "react";
import styles from "../styles/about.module.css"; // Importa los estilos específicos para la página About

interface AboutPageProps {
  loadingMessages: boolean; // Nuevo prop para el estado de carga
}

// Define el tipo del componente para incluir `pageTitletext`
type AboutPageComponent = ComponentType<AboutPageProps> & { pageTitletext?: string };

const AboutPage: AboutPageComponent = ({ loadingMessages }: AboutPageProps) => {
  const intl = useIntl(); // Inicializa el hook de internacionalización para usar en este componente

  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  useVisitedPageTracking("about");
  useVisitedPageTrackingGA("about");

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <p>{intl.formatMessage({ id: "about_Descripcion" })}</p>
      {isScrollButtonVisible && (
        <button onClick={scrollToTop} className="scrollTop">
          <img src="/images/web/flechaArriba.png" alt="Subir" />
        </button>
      )}
      <br></br>
    </div>
  );
};

AboutPage.pageTitletext = "about";

export default AboutPage; // Exporta el componente para ser usado en otras partes de la aplicación
