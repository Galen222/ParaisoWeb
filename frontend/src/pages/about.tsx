import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import Carousel from "../components/Carousel";
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
        <p className="ti-20p">{intl.formatMessage({ id: "about_Texto1" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "about_Titulo2" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "about_Texto2a" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "about_Texto2b" })}</p>
        <div className={`${styles.imageContainer}`}>
          <img src="/images/about/nosotros1.png" alt={intl.formatMessage({ id: "about_Carousel_Alt1" })} className={styles.responsiveImage} />
          <img src="/images/about/nosotros2.png" alt={intl.formatMessage({ id: "about_Carousel_Alt2" })} className={styles.responsiveImage} />
          <img src="/images/about/nosotros3.png" alt={intl.formatMessage({ id: "about_Carousel_Alt3" })} className={styles.responsiveImage} />
        </div>
        <p className="ti-20p">{intl.formatMessage({ id: "about_Texto2c" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "about_Texto2d" })}</p>
        <div className={styles.mobileCarousel}>
          <Carousel carouselType="about1" />
        </div>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "about_Titulo3" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "about_Texto3" })}</p>
        <ul className={`text-left ${styles.listas}`}>
          <li>{intl.formatMessage({ id: "about_Texto3_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "about_Texto3_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "about_Texto3_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "about_Texto3_Punto4" })}</li>
        </ul>
      </div>
      <div>
        <h3 className="mb-10p">{intl.formatMessage({ id: "about_Titulo4" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "about_Texto4" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "about_Texto5" })}</p>
        <div className={`${styles.imageContainer}`}>
          <img src="/images/about/nosotros4.png" alt={intl.formatMessage({ id: "about_Carousel_Alt4" })} className={styles.responsiveImage} />
          <img src="/images/about/nosotros5.png" alt={intl.formatMessage({ id: "about_Carousel_Alt5" })} className={styles.responsiveImage} />
        </div>
        <div className={styles.mobileCarousel}>
          <Carousel carouselType="about2" />
        </div>
      </div>
      <div className="mt-25p">
        <h3 className="ti-20p">{intl.formatMessage({ id: "about_Texto6" })}</h3>
      </div>
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

AboutPage.pageTitleText = "about";

export default AboutPage; // Exporta el componente para ser usado en otras partes de la aplicación
