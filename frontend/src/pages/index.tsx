// pages/index.tsx

import React from "react";
import type { ComponentType } from "react";
import Loader from "../components/Loader";
import Carousel from "../components/Carousel";
import Banner from "../components/Banner";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import ScrollToTopButton from "../components/ScrollToTopButton"; // Importa el componente reutilizable
import { NextSeo } from "next-seo"; // Importa NextSeo
import useLocaleFormatted from "../hooks/useLocaleFormatted"; // Importa el hook personalizado

/**
 * Propiedades para el componente `Home`.
 * @property {boolean} loadingMessages - Estado de carga de los mensajes de internacionalización.
 */
export interface HomeProps {
  loadingMessages: boolean;
}

/**
 * Componente de la página principal de la aplicación.
 * Incluye un título, texto de bienvenida, un carrusel de imágenes y varios banners para distintas secciones.
 * Realiza seguimiento de la visita a la página y muestra un botón para volver al inicio al hacer scroll.
 *
 * @param {HomeProps} props - Propiedades del componente `Home`.
 * @returns {JSX.Element} - Página de inicio.
 */
const Home: ComponentType<HomeProps> & { pageTitleText?: string } = ({ loadingMessages }: HomeProps): JSX.Element => {
  const intl = useIntl(); // Hook de internacionalización
  const locale = intl.locale.split("-")[0]; // Obtener el código del idioma (e.g., 'es', 'en', 'de')
  const formattedLocale = useLocaleFormatted(locale); // Pasar el locale como parámetro

  console.log("Idioma formateado: ", formattedLocale);

  // Seguimiento de la visita a la página "Inicio" para analítica
  useVisitedPageTracking("inicio");
  useVisitedPageTrackingGA("inicio");

  // Muestra el loader si los mensajes están en proceso de carga
  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      {/* Configuración de SEO específica de la página */}
      <NextSeo
        title={`${intl.formatMessage({ id: "inicio_Titulo_Texto1" })} ${intl.formatMessage({
          id: "inicio_Titulo_Texto2",
        })}`}
        description={intl.formatMessage({ id: "inicio_SEO_descripcion" })}
        canonical={`${process.env.NEXT_PUBLIC_SITE_URL}/`}
        openGraph={{
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
          title: `${intl.formatMessage({ id: "inicio_Titulo_Texto1" })} ${intl.formatMessage({
            id: "inicio_Titulo_Texto2",
          })}`,
          description: intl.formatMessage({ id: "inicio_SEO_descripcion" }),
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/navbar/imagenLogo.png`,
              width: 1200,
              height: 630,
              alt: "Logo de El Paraíso Del Jamón",
            },
          ],
          locale: formattedLocale, // Ya retorna 'es-ES'
          siteName: "El Paraíso Del Jamón",
        }}
        twitter={{
          /* 
          handle: "@tuusuario",
          site: "@tusitio",
          */
          cardType: "summary_large_image",
        }}
      />
      {/* Título de bienvenida */}
      <div>
        <h1 className="text-center">{intl.formatMessage({ id: "inicio_Titulo1" })}</h1>
      </div>
      {/* Texto descriptivo */}
      <div className="mt-25p">
        <p className="ti-20p">{intl.formatMessage({ id: "inicio_Texto1" })}</p>
      </div>
      {/* Carrusel de imágenes principal */}
      <div>
        <Carousel carouselType="inicio" />
      </div>
      {/* Banners para las distintas secciones */}
      <Banner bannerType="restaurantes" />
      <Banner bannerType="gastronomia" />
      <Banner bannerType="charcuteria" />
      <Banner bannerType="nosotros" />
      <Banner bannerType="empleo" />
      {/* Botón para desplazarse hacia arriba */}
      <ScrollToTopButton /> {/* Usa el componente de scroll-to-top */}
    </div>
  );
};

// Asigna `pageTitleText` como propiedad estática de `Home`
Home.pageTitleText = "inicio";

export default Home; // Exporta el componente para su uso en la aplicación
