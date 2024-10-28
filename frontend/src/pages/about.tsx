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

// Define el tipo del componente para incluir `pageTitleText`
type AboutPageComponent = ComponentType<AboutPageProps> & { pageTitleText?: string };

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
      <div>
        <p>{intl.formatMessage({ id: "about_Texto1" })}</p>
        <h3>{intl.formatMessage({ id: "about_Titulo2" })}</h3>
        <p>{intl.formatMessage({ id: "about_Texto2" })}</p>
        <h3>{intl.formatMessage({ id: "about_Titulo3" })}</h3>
        <p>{intl.formatMessage({ id: "about_Texto3" })}</p>
        <ul className={`text-left ${styles.listas}`}>
          <li>{intl.formatMessage({ id: "about_Texto3_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "about_Texto3_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "about_Texto3_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "about_Texto3_Punto4" })}</li>
        </ul>
        <h3>{intl.formatMessage({ id: "about_Titulo4" })}</h3>
        <p>{intl.formatMessage({ id: "about_Texto4" })}</p>
        <p>{intl.formatMessage({ id: "about_Texto5" })}</p>
      </div>
      <div className="mb-25p">
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollTop">
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

AboutPage.pageTitleText = "about";

export default AboutPage; // Exporta el componente para ser usado en otras partes de la aplicación
