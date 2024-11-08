// pages/gastronomia.tsx

import React, { useState } from "react";
import type { ComponentType } from "react";
import Loader from "../components/Loader";
import Carousel from "../components/Carousel";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA, useButtonClickTrackingGA } from "../hooks/useTrackingGA";
import { useDownloadFile } from "../hooks/useDownloadFile";
import ScrollToTopButton from "../components/ScrollToTopButton"; // Importa el componente reutilizable
import styles from "../styles/pages/gastronomia.module.css";

/**
 * Propiedades para el componente `GastronomiaPage`.
 * @property {boolean} loadingMessages - Indica si los mensajes están en proceso de carga.
 */
export interface GastronomiaPageProps {
  loadingMessages: boolean;
}

/**
 * Tipo del componente que incluye `pageTitleText` como propiedad estática.
 */
export type GastronomiaPageComponent = ComponentType<GastronomiaPageProps> & { pageTitleText?: string };

/**
 * Componente funcional para la página de gastronomía.
 *
 * @param {GastronomiaPageProps} props - Las propiedades del componente.
 * @param {boolean} props.loadingMessages - Estado de carga de los mensajes.
 * @returns {JSX.Element} El componente de la página de gastronomía.
 */
const GastronomiaPage: GastronomiaPageComponent = ({ loadingMessages }: GastronomiaPageProps): JSX.Element => {
  const intl = useIntl(); // Hook para la internacionalización
  const { downloadFile, isDownloading } = useDownloadFile(); // Hook para descarga de archivos
  const [isPushingDownloadMenuFile, setIsPushingDownloadMenuFile] = useState(false); // Estado para animación

  // Seguimiento de la visita a la página "Gastronomía" y clicks en botones
  useVisitedPageTracking("gastronomia");
  useVisitedPageTrackingGA("gastronomia");
  const trackButtonClick = useButtonClickTrackingGA();

  /**
   * Función para manejar el clic en el botón de descarga del menú.
   * Incluye seguimiento de clics y manejo de animación.
   */
  const handleDownloadMenu = () => {
    trackButtonClick("Descargar Carta");
    setIsPushingDownloadMenuFile(true); // Activar la animación de push
    downloadFile(
      "/files/cartaparaiso.pdf", // Ruta del archivo
      "cartaparaiso.pdf", // Nombre con el que se descargará
      "gastronomia_Descargar_Carta_Ok", // ID del mensaje de éxito
      "gastronomia_Descargar_Carta_Error" // ID del mensaje de error
    );
  };

  // Rutas de las imágenes y textos alternativos
  const images = {
    raciones: [
      { src: "/images/gastronomia/raciones1.png", alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt1" }) },
      { src: "/images/gastronomia/raciones2.png", alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt2" }) },
      { src: "/images/gastronomia/raciones3.png", alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt3" }) },
    ],
    combinados: [
      { src: "/images/gastronomia/combinados1.png", alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt4" }) },
      { src: "/images/gastronomia/combinados2.png", alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt5" }) },
      { src: "/images/gastronomia/combinados3.png", alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt6" }) },
    ],
    bocadillos: [
      { src: "/images/gastronomia/bocadillos1.png", alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt7" }) },
      { src: "/images/gastronomia/bocadillos2.png", alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt8" }) },
      { src: "/images/gastronomia/bocadillos3.png", alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt9" }) },
    ],
  };

  // Muestra un loader si los mensajes están en proceso de carga
  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      {/* Título principal de la sección */}
      <div>
        <h1 className="text-center">{intl.formatMessage({ id: "gastronomia_Titulo1" })}</h1>
      </div>
      {/* Descripción y botón de descarga del menú */}
      <div className="mt-25p mb-25p">
        <p className="ti-20p">{intl.formatMessage({ id: "gastronomia_Texto1" })}</p>
        <div className="text-center">
          <button
            className={`btn btn-primary mx-auto ${styles.downloadMenuButton} ${isPushingDownloadMenuFile ? "animate-push" : ""}`}
            onClick={handleDownloadMenu}
            onAnimationEnd={() => setIsPushingDownloadMenuFile(false)} // Resetear el estado de animación
          >
            {intl.formatMessage({ id: "gastronomia_Boton" })}
          </button>
        </div>
      </div>
      {/* Sección de raciones */}
      <div className="mt-25p mb-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "gastronomia_Titulo2" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "gastronomia_Texto2" })}</p>
        <div className={`${styles.imageContainer}`}>
          {images.raciones.map((image, index) => (
            <img key={index} src={image.src} alt={image.alt} className={styles.responsiveImage} />
          ))}
        </div>
        <div className={styles.mobileCarousel}>
          <Carousel carouselType="gastronomia1" />
        </div>
      </div>
      {/* Sección de platos combinados */}
      <div className="mt-25p mb-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "gastronomia_Titulo4" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "gastronomia_Texto4" })}</p>
        <div className={`${styles.imageContainer}`}>
          {images.combinados.map((image, index) => (
            <img key={index} src={image.src} alt={image.alt} className={styles.responsiveImage} />
          ))}
        </div>
        <div className={styles.mobileCarousel}>
          <Carousel carouselType="gastronomia2" />
        </div>
      </div>
      {/* Sección de bocadillos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "gastronomia_Titulo5" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "gastronomia_Texto5" })}</p>
        <div className={`${styles.imageContainer}`}>
          {images.bocadillos.map((image, index) => (
            <img key={index} src={image.src} alt={image.alt} className={styles.responsiveImage} />
          ))}
        </div>
        <div className={styles.mobileCarousel}>
          <Carousel carouselType="gastronomia3" />
        </div>
      </div>
      {/* Botón de desplazamiento hacia arriba */}
      <ScrollToTopButton /> {/* Usa el componente de scroll-to-top */}
    </div>
  );
};

// Define `pageTitleText` como una propiedad estática del componente `GastronomiaPage`
GastronomiaPage.pageTitleText = "gastronomia";

export default GastronomiaPage; // Exporta el componente para ser usado en la aplicación
