// pages/nosotros.tsx

import React from "react";
import type { NextPage, GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Carousel from "../components/Carousel";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import styles from "../styles/pages/nosotros.module.css"; // Importa los estilos específicos para la página nosotros
import { NextSeo, OrganizationJsonLd } from "next-seo"; // Importa NextSeo para la gestión de SEO
import getSEOConfig from "../config/next-seo.config";
import { redirectByCookie } from "../utils/redirectByCookie"; // Importa la función de redirección
import useCurrentUrl from "../hooks/useCurrentUrl";
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
 * Tipo de componente para nosotrosPage que incluye una propiedad opcional `pageTitleText`.
 */
export type NosotrosPageComponent = NextPage & { pageTitleText?: string };

/**
 * Componente funcional para la página "nosotros" de la aplicación.
 * Muestra información sobre la empresa, incluyendo texto internacionalizado, imágenes y carruseles de imágenes.
 * También incluye la funcionalidad para desplazarse hasta la parte superior de la página.
 *
 * @returns {JSX.Element} Componente de la página "Nosotros".
 */
const NosotrosPage: NextPage & { pageTitleText?: string } = (): JSX.Element => {
  const intl = useIntl(); // Hook de internacionalización para acceder a las funciones de traducción
  const currentUrl = useCurrentUrl(); // Hook para obtener la página web actual
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";
  const currentLocale = intl.locale || "es"; // Fallback a 'es' si no está definido
  const currentMessages = messages[currentLocale] || messages["es"];

  // Realiza el seguimiento de la visita a la página "nosotros"
  useVisitedPageTracking("nosotros");
  useVisitedPageTrackingGA("nosotros");

  // Constantes para las imágenes y los textos alternativos internacionalizados
  const images = [
    { src: "/images/nosotros/nosotros1.png", alt: intl.formatMessage({ id: "nosotros_Carousel_Alt1" }) },
    { src: "/images/nosotros/nosotros2.png", alt: intl.formatMessage({ id: "nosotros_Carousel_Alt2" }) },
    { src: "/images/nosotros/nosotros3.png", alt: intl.formatMessage({ id: "nosotros_Carousel_Alt3" }) },
    { src: "/images/nosotros/nosotros4.png", alt: intl.formatMessage({ id: "nosotros_Carousel_Alt4" }) },
    { src: "/images/nosotros/nosotros5.png", alt: intl.formatMessage({ id: "nosotros_Carousel_Alt5" }) },
  ];

  return (
    <div className="pageContainer">
      {/* Configuración de SEO específica de la página */}
      <NextSeo
        {...getSEOConfig(currentLocale, currentMessages)}
        title={intl.formatMessage({ id: "nosotros_SEO_Titulo" })}
        description={intl.formatMessage({ id: "nosotros_SEO_Descripcion" })}
        openGraph={{
          title: intl.formatMessage({ id: "nosotros_SEO_Titulo" }),
          description: intl.formatMessage({ id: "nosotros_SEO_Descripcion" }),
          images: [
            {
              url: "/images/nosotros/nosotros4.png",
              alt: intl.formatMessage({ id: "nosotros_Carousel_Alt4" }),
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
      <div>
        <h1>{intl.formatMessage({ id: "nosotros_Titulo" })}</h1>
      </div>
      <div className="mt-25p">
        <p className="ti-20p">{intl.formatMessage({ id: "nosotros_Texto1" })}</p>
      </div>
      <div className="mt-25p">
        <h2 className="mb-10p">{intl.formatMessage({ id: "nosotros_Titulo2" })}</h2>
        <p className="ti-20p">{intl.formatMessage({ id: "nosotros_Texto2a" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "nosotros_Texto2b" })}</p>
        <div className={`${styles.imageContainer}`}>
          {images.slice(0, 3).map((image, index) => (
            <img key={index} src={image.src} alt={image.alt} className={styles.responsiveImage} />
          ))}
        </div>
        <p className="ti-20p">{intl.formatMessage({ id: "nosotros_Texto2c" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "nosotros_Texto2d" })}</p>
        <div className={styles.mobileCarousel}>
          <Carousel carouselType="nosotros1" /> {/* Carrusel para dispositivos móviles */}
        </div>
      </div>
      <div className="mt-25p">
        <h2 className="mb-10p">{intl.formatMessage({ id: "nosotros_Titulo3" })}</h2>
        <p className="ti-20p">{intl.formatMessage({ id: "nosotros_Texto3" })}</p>
        <ul className={`text-left ${styles.listas}`}>
          <li>{intl.formatMessage({ id: "nosotros_Texto3_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "nosotros_Texto3_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "nosotros_Texto3_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "nosotros_Texto3_Punto4" })}</li>
        </ul>
      </div>
      <div>
        <h2 className="mb-10p">{intl.formatMessage({ id: "nosotros_Titulo4" })}</h2>
        <p className="ti-20p">{intl.formatMessage({ id: "nosotros_Texto4" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "nosotros_Texto5" })}</p>
        <div className={`${styles.imageContainer}`}>
          {images.slice(3).map((image, index) => (
            <img key={index} src={image.src} alt={image.alt} className={styles.responsiveImage} />
          ))}
        </div>
        <div className={styles.mobileCarousel}>
          <Carousel carouselType="nosotros2" /> {/* Segundo carrusel para móviles */}
        </div>
      </div>
      <div className="mt-25p">
        <p className="ti-20p fw-bold">{intl.formatMessage({ id: "nosotros_Texto6" })}</p>
      </div>
      <ScrollToTopButton /> {/* Usa el componente de scroll-to-top */}
    </div>
  );
};

// Define `pageTitleText` como una propiedad estática del componente `NosotrosPage`
NosotrosPage.pageTitleText = "nosotros";

/**
 * Función `getServerSideProps` para manejar la redirección basada en cookies.
 * @param {GetServerSidePropsContext} context - Contexto de Next.js que contiene información de la solicitud.
 * @returns {Promise<GetServerSidePropsResult<{}>>} Redirección o props vacíos.
 */
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> => {
  // Aplicar redirección basada en cookies
  const redirectResponse = redirectByCookie(context, "/nosotros");
  if (redirectResponse.redirect) {
    return redirectResponse;
  }

  // Retorna props vacíos, ya que la carga de mensajes se maneja globalmente
  return {
    props: {},
  };
};

// Exporta el componente `NosotrosPage` como predeterminado
export default NosotrosPage;
