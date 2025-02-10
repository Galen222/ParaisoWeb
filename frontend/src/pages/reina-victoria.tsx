// pages/reina-victoria.tsx

import React from "react";
import type { NextPage, GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Map from "../components/Map";
import Carousel from "../components/Carousel";
import Localization from "../components/Localization";
import Transport from "../components/Transport";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import { NextSeo, OrganizationJsonLd, LocalBusinessJsonLd } from "next-seo"; // Importa NextSeo para la gestión de SEO
import getSEOConfig from "../config/next-seo.config";
import { redirectByCookie } from "../utils/redirectByCookie"; // Importa la función de redirección
import { useMapLocale } from "../hooks/useMapLocale"; // Hook para obtener el locale del mapa
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
 * Tipo del componente que incluye `pageTitleText` como propiedad estática.
 */
export type ReinaVictoriaPageComponent = NextPage & { pageTitleText?: string };

/**
 * Componente que representa la página Reina Victoria.
 * Muestra información y elementos específicos de localización, como un mapa, carrusel y detalles de transporte.
 *
 * @returns {JSX.Element} El componente de la página Reina Victoria.
 */
const ReinaVictoriaPage: NextPage & { pageTitleText?: string } = (): JSX.Element => {
  /**
   * Nombre del restaurante para su uso en tracking y otros componentes.
   */
  const restaurante = "reina-victoria";

  const intl = useIntl(); // Hook de internacionalización para acceder a las funciones de traducción
  const currentUrl = useCurrentUrl(); // Hook para obtener la página web actual
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";
  const currentLocale = intl.locale || "es"; // Fallback a 'es' si no está definido
  const currentMessages = messages[currentLocale] || messages["es"];

  const mapLocale = useMapLocale(); // Obtiene el locale para el mapa

  // Seguimiento de la visita a la página "reina-victoria".
  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  /**
   * Clave de localización para el componente de mapa.
   */
  const locationKey = restaurante;

  // Renderiza el componente con la estructura de la página Reina Victoria.
  return (
    <div className="pageContainer">
      {/* Configuración de SEO específica de la página */}
      <NextSeo
        {...getSEOConfig(currentLocale, currentMessages)}
        title={intl.formatMessage({ id: "reina-victoria_SEO_Titulo" })}
        description={intl.formatMessage({ id: "reina-victoria_SEO_Descripcion" })}
        openGraph={{
          title: intl.formatMessage({ id: "reina-victoria_SEO_Titulo" }),
          description: intl.formatMessage({ id: "reina-victoria_SEO_Descripcion" }),
          images: [
            {
              url: "/images/carousel/rv/carousel-rv-1.png",
              alt: intl.formatMessage({ id: "reina-victoria_Carousel_Alt1" }),
            },
          ],
          locale: currentUrl,
        }}
      />
      {/* JSON-LD para Organización */}
      <OrganizationJsonLd
        type="Organization"
        id={currentUrl}
        name="Paraíso Del Jamón III"
        url={currentUrl}
        logo={`${siteUrl}/images/navbar/imagenLogo.png`}
        contactPoint={[
          {
            telephone: "+34 91 532 83 50",
            email: "info@paraisodeljamon.com",
          },
        ]}
      />
      {/* JSON-LD para LocalBusiness */}
      <LocalBusinessJsonLd
        type="Restaurant"
        id={currentUrl}
        name="Paraíso Del Jamón III"
        description={intl.formatMessage({ id: "reina-victoria_SEO_Descripcion" })}
        url={currentUrl}
        telephone="+34 91 534 91 08"
        address={{
          streetAddress: "Reina Victoria, 3",
          addressLocality: "Madrid",
          addressRegion: "Madrid",
          postalCode: "28003",
          addressCountry: "ES",
        }}
        geo={{
          latitude: 40.44667864352768,
          longitude: -3.704447234180926,
        }}
        priceRange="$€"
        servesCuisine={[intl.formatMessage({ id: "reina-victoria_SEO_Cocina" })]}
        images={[`${siteUrl}/images/carousel/rv/carousel-rv-1.png`]}
        openingHours={[
          {
            dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: "07:00",
            closes: "24:00",
          },
        ]}
      />
      {/* Texto principal de la página */}
      <div>
        <h1>{intl.formatMessage({ id: "reina-victoria_Titulo" })}</h1>
      </div>
      {/* Texto descriptivo */}
      <div className="mt-25p">
        <p className="ti-20p">{intl.formatMessage({ id: "reina-victoria_Texto" })}</p>
      </div>
      {/* Sección de localización del restaurante */}
      <div className="mt-25p">
        <Localization localizationName="reina-victoria" />
      </div>
      {/* Carrusel de imágenes del restaurante */}
      <div className="mt-25p">
        <Carousel carouselType="reina-victoria" />
      </div>
      {/* Sección de transporte cercano al restaurante */}
      <div className="mt-25p">
        <Transport transportName="reina-victoria" />
      </div>
      {/* Mapa de ubicación del restaurante */}
      <div className="mt-25p">
        <Map locationKey={locationKey} mapLocale={mapLocale} />
      </div>
      {/* Botón para desplazarse hacia arriba */}
      <ScrollToTopButton /> {/* Usa el componente de scroll-to-top */}
    </div>
  );
};

// Define `pageTitleText` como una propiedad estática del componente `ReinaVictoriaPage`
ReinaVictoriaPage.pageTitleText = "reina-victoria";

/**
 * Función `getServerSideProps` para la redirección basada en cookies.
 *
 * @param {GetServerSidePropsContext} context - Contexto de Next.js que contiene información de la solicitud.
 * @returns {Promise<GetServerSidePropsResult<Record<string, any>>>} Propiedades de la página o redirección.
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Aplicar redirección basada en cookies
  const redirectResponse = redirectByCookie(context, "/reina-victoria");
  if (redirectResponse.redirect) {
    return redirectResponse;
  }

  return {
    props: {},
  };
};

export default ReinaVictoriaPage; // Exporta el componente para su uso en la aplicación
