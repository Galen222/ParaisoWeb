// pages/gastronomia.tsx

import React, { useState } from "react";
import type { NextPage, GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"; // Importa GetServerSidePropsResult
import { useIntl } from "react-intl";
import { NextSeo, OrganizationJsonLd } from "next-seo"; // Importa NextSeo para la gestión de SEO
import Carousel from "../components/Carousel";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA, useButtonClickTrackingGA } from "../hooks/useTrackingGA";
import { useDownloadFile } from "../hooks/useDownloadFile";
import ScrollToTopButton from "../components/ScrollToTopButton";
import getSEOConfig from "../config/next-seo.config"; // Importa la configuración de SEO
import useCurrentUrl from "../hooks/useCurrentUrl";
import { redirectByCookie } from "../utils/redirectByCookie"; // Función de redirección basada en cookies
import styles from "../styles/pages/gastronomia.module.css"; // Importa los estilos específicos de la página
// Importa los mensajes de traducción
import esMessages from "../locales/es/common.json";
import enMessages from "../locales/en/common.json";
import deMessages from "../locales/de/common.json";
// Mapea los locales a sus respectivos mensajes
const messages: Record<string, Record<string, string>> = {
  es: esMessages,
  en: enMessages,
  de: deMessages,
};

/**
 * Tipo del componente que incluye `pageTitleText` como propiedad estática.
 */
export type GastronomiaPageComponent = NextPage & { pageTitleText?: string };

/**
 * Componente funcional para la página de gastronomía.
 *
 * @returns {JSX.Element} El componente de la página de gastronomía.
 */
const GastronomiaPage: NextPage & { pageTitleText?: string } = (): JSX.Element => {
  const intl = useIntl(); // Hook de internacionalización para acceder a las funciones de traducción
  const currentUrl = useCurrentUrl(); // Hook para obtener la página web actual
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";
  const currentLocale = intl.locale || "es"; // Fallback a 'es' si no está definido
  const currentMessages = messages[currentLocale] || messages["es"];

  const { downloadFile, isDownloading } = useDownloadFile(); // Hook para manejar la descarga de archivos
  const [isPushingDownloadMenuFile, setIsPushingDownloadMenuFile] = useState(false); // Estado para la animación del botón de descarga

  // Realiza el seguimiento de la visita a la página y de los click en botón de descarga
  useVisitedPageTracking("gastronomia");
  useVisitedPageTrackingGA("gastronomia");
  const trackButtonClick = useButtonClickTrackingGA();

  /**
   * Maneja el clic en el botón de descarga.
   * Realiza el seguimiento del click y activa la animación del botón.
   */
  const handleDownloadMenu = () => {
    trackButtonClick("Descargar Carta");
    setIsPushingDownloadMenuFile(true); // Activar la animación de push
    downloadFile(
      "/files/cartaparaiso.pdf", // Ruta del archivo a descargar
      "cartaparaiso.pdf", // Nombre del archivo descargado
      "gastronomia_Descargar_Carta_Ok", // ID del mensaje de éxito
      "gastronomia_Descargar_Carta_Error" // ID del mensaje de error
    );
  };

  // Definición de las imágenes y los textos alternativos
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

  return (
    <div className="pageContainer">
      {/* Configuración de SEO específica de la página */}
      <NextSeo
        {...getSEOConfig(currentLocale, currentMessages)}
        title={intl.formatMessage({ id: "gastronomia_SEO_Titulo" })}
        description={intl.formatMessage({ id: "gastronomia_SEO_Descripcion" })}
        openGraph={{
          title: intl.formatMessage({ id: "gastronomia_SEO_Titulo" }),
          description: intl.formatMessage({ id: "gastronomia_SEO_Descripcion" }),
          images: [
            {
              url: "/images/gastronomia/raciones2.png",
              alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt2" }),
            },
          ],
          locale: currentUrl,
        }}
      />
      {/* JSON-LD para Organización */}
      <OrganizationJsonLd
        type="Organization"
        id={currentUrl}
        name="Paraíso Del Jamón"
        url={currentUrl}
        logo={`${siteUrl}/images/navbar/imagenLogo.png`}
        contactPoint={[
          {
            telephone: "+34 532 83 50",
            email: "info@paraisodeljamon.com",
          },
        ]}
      />
      {/* Título principal de la página */}
      <div>
        <h1 className="text-center">{intl.formatMessage({ id: "gastronomia_Titulo1" })}</h1>
      </div>
      {/* Sección de introducción y botón de descarga */}
      <div className="mt-25p mb-25p">
        <p className="ti-20p">{intl.formatMessage({ id: "gastronomia_Texto1" })}</p>
        <div className="text-center">
          <button
            className={`btn btn-primary mx-auto ${styles.downloadMenuButton} ${isPushingDownloadMenuFile ? "animate-push" : ""}`}
            onClick={handleDownloadMenu}
            onAnimationEnd={() => setIsPushingDownloadMenuFile(false)} // Resetear el estado de animación del botón
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
      <ScrollToTopButton />
    </div>
  );
};

// Define `pageTitleText` como una propiedad estática del componente `GastronomiaPage`
GastronomiaPage.pageTitleText = "gastronomia";

/**
 * Función `getServerSideProps` para manejar redirecciones basadas en cookies.
 *
 * @param {GetServerSidePropsContext} context - Contexto de Next.js que contiene información de la solicitud.
 * @returns {Promise<{props: Record<string, any>}>} Propiedades para la página o redirección.
 */
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Record<string, any>>> => {
  // Aplicar redirección basada en cookies
  const redirectResponse = redirectByCookie(context, "/gastronomia");
  if (redirectResponse.redirect) {
    // Devuelve un objeto de redirección si es necesario
    return {
      redirect: redirectResponse.redirect,
    };
  }

  return {
    props: {},
  };
};

export default GastronomiaPage; // Exporta el componente para su uso en la aplicación
