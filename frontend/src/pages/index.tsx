// pages/index.tsx

import React from "react";
import type { NextPage, GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Carousel from "../components/Carousel";
import Banner from "../components/Banner";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { NextSeo, OrganizationJsonLd } from "next-seo";
import getSEOConfig from "../config/next-seo.config";
import { redirectByCookie } from "../utils/redirectByCookie";
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
 * Tipo de componente para `Home` que incluye una propiedad opcional `pageTitleText`.
 */
export type HomeComponent = NextPage & { pageTitleText?: string };

/**
 * Componente funcional para la página principal (Home).
 * @returns {JSX.Element} El componente de la página principal.
 */
const Home: NextPage & { pageTitleText?: string } = (): JSX.Element => {
  const intl = useIntl(); // Hook de internacionalización para acceder a las funciones de traducción
  const currentUrl = useCurrentUrl(); // Hook para obtener la página web actual
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";
  const currentLocale = intl.locale || "es"; // Fallback a 'es' si no está definido
  const currentMessages = messages[currentLocale] || messages["es"];

  // Realiza el seguimiento de la visita a la página de inicio
  useVisitedPageTracking("inicio");
  useVisitedPageTrackingGA("inicio");

  return (
    <div className="pageContainer">
      {/* Configuración de SEO específica de la página */}
      <NextSeo
        {...getSEOConfig(currentLocale, currentMessages)}
        title={intl.formatMessage({ id: "inicio_SEO_Titulo" })}
        description={intl.formatMessage({ id: "inicio_SEO_Descripcion" })}
        openGraph={{
          title: intl.formatMessage({ id: "inicio_SEO_Titulo" }),
          description: intl.formatMessage({ id: "inicio_SEO_Descripcion" }),
          url: currentUrl,
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
        <h1 className="text-center">{intl.formatMessage({ id: "inicio_Titulo1" })}</h1>
      </div>
      {/* Texto introductorio */}
      <div className="mt-25p">
        <p className="ti-20p">{intl.formatMessage({ id: "inicio_Texto1" })}</p>
      </div>
      {/* Carrusel de imágenes */}
      <div>
        <Carousel carouselType="inicio" />
      </div>
      {/* Banners de las secciones destacadas */}
      <Banner bannerType="restaurantes" />
      <Banner bannerType="gastronomia" />
      <Banner bannerType="charcuteria" />
      <Banner bannerType="nosotros" />
      <Banner bannerType="empleo" />
      {/* Botón de desplazamiento hacia arriba */}
      <ScrollToTopButton />
    </div>
  );
};

// Define `pageTitleText` como una propiedad estática del componente `Home`
Home.pageTitleText = "inicio";

/**
 * Función `getServerSideProps` para manejar la redirección basada en cookies.
 * @param {GetServerSidePropsContext} context - Contexto de Next.js que contiene información de la solicitud.
 * @returns {Promise<GetServerSidePropsResult<{}>>} Redirección o props vacíos.
 */
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> => {
  // Aplicar redirección basada en cookies
  const redirectResponse = redirectByCookie(context, "");
  if (redirectResponse.redirect) {
    return redirectResponse;
  }

  return {
    props: {},
  };
};

export default Home; // Exporta el componente `Home` como predeterminado
