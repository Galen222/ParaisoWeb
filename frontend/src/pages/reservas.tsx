// Importación de librerías y componentes necesarios
import React from "react";
import type { NextPage, GetServerSideProps, GetServerSidePropsContext } from "next"; // Tipos de Next.js
import Localization from "../components/Localization"; // Componente de localización de sucursales
import ScrollToTopButton from "../components/ScrollToTopButton"; // Botón para volver al inicio de la página
import { useIntl } from "react-intl"; // Hook de internacionalización
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking"; // Hook de seguimiento de visitas
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA"; // Hook de seguimiento de visitas para Google Analytics
import { NextSeo, OrganizationJsonLd } from "next-seo"; // Componente para la configuración de SEO
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
 * Tipo del componente que incluye `pageTitleText` como propiedad estática.
 */
export type ReservasPageComponent = NextPage & { pageTitleText?: string };

/**
 * Componente de la página de reservas de la aplicación.
 * Este componente muestra textos internacionalizados, secciones de localización y un botón para desplazarse hacia arriba.
 * También realiza seguimiento de la visita a la página para propósitos de analítica.
 *
 * @returns {JSX.Element} - Elemento JSX de la página de reservas.
 */
const ReservasPage: NextPage & { pageTitleText?: string } = (): JSX.Element => {
  const intl = useIntl(); // Hook de internacionalización para acceder a las funciones de traducción
  const currentUrl = useCurrentUrl(); // Hook para obtener la página web actual
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";
  const currentLocale = intl.locale || "es"; // Fallback a 'es' si no está definido
  const currentMessages = messages[currentLocale] || messages["es"];

  // Invoca el seguimiento de la visita a la página "Reservas" para analítica
  useVisitedPageTracking("reservas");
  useVisitedPageTrackingGA("reservas");

  return (
    <div className="pageContainer">
      {/* Configuración de SEO específica de la página */}
      {/* Configuración de SEO específica de la página */}
      <NextSeo
        {...getSEOConfig(currentLocale, currentMessages)}
        title={intl.formatMessage({ id: "reservas_SEO_Titulo" })}
        description={intl.formatMessage({ id: "reservas_SEO_Descripcion" })}
        openGraph={{
          title: intl.formatMessage({ id: "reservas_SEO_Titulo" }),
          description: intl.formatMessage({ id: "reservas_SEO_Descripcion" }),
          locale: currentUrl,
        }}
      />
      {/* JSON-LD para Organización */}
      <OrganizationJsonLd
        type="Organization"
        id={currentUrl}
        name="El Paraíso Del Jamón"
        url={currentUrl}
        logo={`${siteUrl}/images/navbar/imagenLogo.png`}
        contactPoint={[
          {
            telephone: "+34 532 83 50",
            email: "info@paraisodeljamon.com",
          },
        ]}
      />
      {/* Contenido de la página de reservas con textos internacionalizados */}
      <div>
        <p className="ti-20p">{intl.formatMessage({ id: "reservas_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "reservas_Texto2" })}</p>
      </div>
      {/* Sección de localización para mostrar las distintas ubicaciones */}
      <div className="mt-25p">
        <Localization localizationName="san-bernardo" />
        <Localization localizationName="bravo-murillo" />
        <Localization localizationName="reina-victoria" />
        <Localization localizationName="arenal" />
      </div>
      {/* Botón para desplazarse hacia arriba */}
      <ScrollToTopButton />
    </div>
  );
};

// Asigna `pageTitleText` como propiedad estática del componente `Reservas`
ReservasPage.pageTitleText = "reservas";

/**
 * Obtiene las propiedades del lado del servidor para la página de reservas.
 * Realiza redirecciones si es necesario.
 *
 * @param {GetServerSidePropsContext} context - Contexto de la página de Next.js.
 * @returns {Promise<GetServerSidePropsResult<{}>>} Propiedades de la página o redirección.
 */
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  // Aplicar redirección basada en cookies
  const redirectResponse = redirectByCookie(context, "/reservas");
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

// Exporta el componente para que pueda ser usado en otras partes de la aplicación
export default ReservasPage;
