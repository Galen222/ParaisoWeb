// pages/about.tsx

import React from "react";
import type { ComponentType } from "react";
import Loader from "../components/Loader";
import Carousel from "../components/Carousel";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import styles from "../styles/pages/about.module.css"; // Importa los estilos específicos para la página About

/**
 * Propiedades para el componente AboutPage.
 * @property {boolean} loadingMessages - Indica si los mensajes están en proceso de carga.
 */
export interface AboutPageProps {
  loadingMessages: boolean;
}

/**
 * Tipo de componente para AboutPage que incluye una propiedad opcional `pageTitleText`.
 */
export type AboutPageComponent = ComponentType<AboutPageProps> & { pageTitleText?: string };

/**
 * Componente funcional para la página "About" de la aplicación.
 * Muestra información sobre la empresa, incluyendo texto internacionalizado, imágenes y carruseles de imágenes.
 * También incluye la funcionalidad para desplazarse hasta la parte superior de la página.
 *
 * @param {AboutPageProps} props - Propiedades del componente AboutPage.
 * @returns {JSX.Element} Componente de la página "About".
 */
const AboutPage: AboutPageComponent = ({ loadingMessages }: AboutPageProps): JSX.Element => {
  const intl = useIntl(); // Hook para manejar la internacionalización

  // Seguimiento de visitas a la página "About" para análisis interno y Google Analytics
  useVisitedPageTracking("about");
  useVisitedPageTrackingGA("about");

  // Variables para las imágenes y los textos alternativos internacionalizados
  const images = [
    { src: "/images/about/nosotros1.png", alt: intl.formatMessage({ id: "about_Carousel_Alt1" }) },
    { src: "/images/about/nosotros2.png", alt: intl.formatMessage({ id: "about_Carousel_Alt2" }) },
    { src: "/images/about/nosotros3.png", alt: intl.formatMessage({ id: "about_Carousel_Alt3" }) },
    { src: "/images/about/nosotros4.png", alt: intl.formatMessage({ id: "about_Carousel_Alt4" }) },
    { src: "/images/about/nosotros5.png", alt: intl.formatMessage({ id: "about_Carousel_Alt5" }) },
  ];

  // Muestra un loader si los mensajes están en proceso de carga
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
          {images.slice(0, 3).map((image, index) => (
            <img key={index} src={image.src} alt={image.alt} className={styles.responsiveImage} />
          ))}
        </div>
        <p className="ti-20p">{intl.formatMessage({ id: "about_Texto2c" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "about_Texto2d" })}</p>
        <div className={styles.mobileCarousel}>
          <Carousel carouselType="about1" /> {/* Carrusel para dispositivos móviles */}
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
          {images.slice(3).map((image, index) => (
            <img key={index} src={image.src} alt={image.alt} className={styles.responsiveImage} />
          ))}
        </div>
        <div className={styles.mobileCarousel}>
          <Carousel carouselType="about2" /> {/* Segundo carrusel para móviles */}
        </div>
      </div>
      <div className="mt-25p">
        <h3 className="ti-20p">{intl.formatMessage({ id: "about_Texto6" })}</h3>
      </div>
      <ScrollToTopButton /> {/* Usa el componente de scroll-to-top */}
    </div>
  );
};

// Asigna un texto de título de página específico
AboutPage.pageTitleText = "about";

export default AboutPage; // Exporta el componente para su uso en la aplicación
