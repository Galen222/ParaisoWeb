// pages/contacto.tsx

import React from "react";
import type { NextPage, GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Localization from "../components/Localization";
import LegalInfo from "../components/LegalInfo";
import Form from "../components/Form";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { redirectByCookie } from "../utils/redirectByCookie";
import { NextSeo, OrganizationJsonLd } from "next-seo";
import getSEOConfig from "../config/next-seo.config";
import useCurrentUrl from "../hooks/useCurrentUrl";
import styles from "../styles/pages/contacto.module.css";
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
export type ContactoPageComponent = NextPage & { pageTitleText?: string };

/**
 * Componente funcional para la página de Contacto.
 * Incluye información de contacto, un formulario, detalles legales y ubicaciones.
 *
 * @returns {JSX.Element} Página de Contacto.
 */
const ContactoPage: NextPage & { pageTitleText?: string } = (): JSX.Element => {
  const intl = useIntl(); // Hook de internacionalización para acceder a las funciones de traducción
  const currentUrl = useCurrentUrl(); // Hook para obtener la página web actual
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";
  const currentLocale = intl.locale || "es"; // Fallback a 'es' si no está definido
  const currentMessages = messages[currentLocale] || messages["es"];

  // Seguimiento de la visita a la página "Contacto" para análisis interno y Google Analytics
  useVisitedPageTracking("contacto");
  useVisitedPageTrackingGA("contacto");

  /**
   * Función para manejar el envío del formulario de contacto.
   * Aquí se pueden agregar acciones adicionales tras el envío.
   */
  const handleFormSubmit = () => {};

  return (
    <div className="pageContainer">
      {/* Configuración de SEO específica de la página */}
      <NextSeo
        {...getSEOConfig(currentLocale, currentMessages)}
        title={intl.formatMessage({ id: "contacto_SEO_Titulo" })}
        description={intl.formatMessage({ id: "contacto_SEO_Descripcion" })}
        openGraph={{
          title: intl.formatMessage({ id: "contacto_SEO_Titulo" }),
          description: intl.formatMessage({ id: "contacto_SEO_Descripcion" }),
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
            telephone: "+34 91 532 83 50",
            email: "info@paraisodeljamon.com",
          },
        ]}
      />
      {/* Información introductoria de contacto */}
      <div>
        <div>
          <h1 className="ti-20p">{intl.formatMessage({ id: "contacto_Titulo" })}</h1>
        </div>
        <div className="mt-25p">
          <p className="ti-20p">{intl.formatMessage({ id: "contacto_Texto1" })}</p>
        </div>
        <p className="ti-20p">
          {intl.formatMessage({ id: "contacto_Texto2a" })}
          <span className="fw-bold">{intl.formatMessage({ id: "contacto_Texto2b" })}</span>
          {intl.formatMessage({ id: "contacto_Texto2c" })}
        </p>
        <p className="ti-20p">
          {intl.formatMessage({ id: "contacto_Texto3a" })}
          <span className="fw-bold">{intl.formatMessage({ id: "contacto_Texto3b" })}</span>
          {intl.formatMessage({ id: "contacto_Texto3c" })}
        </p>
        <p className="ti-20p">{intl.formatMessage({ id: "contacto_Texto4" })}</p>
      </div>
      {/* Formulario de contacto */}
      <div className={styles.formContainer}>
        <Form onSubmit={handleFormSubmit} />
      </div>
      {/* Información legal */}
      <div>
        <LegalInfo />
      </div>
      {/* Información adicional de contacto y enlaces de email */}
      <div>
        <p className="ti-20p">
          {intl.formatMessage({ id: "contacto_Texto4_1" })}
          <a className={styles.link} href="mailto:info@paraisodeljamon.com">
            {intl.formatMessage({ id: "contacto_texto4_enlace" })}
          </a>
          {intl.formatMessage({ id: "contacto_Texto4_2" })}
        </p>
      </div>
      {/* Localizaciones de las sedes del negocio */}
      <div>
        <Localization localizationName="san-bernardo" />
        <Localization localizationName="bravo-murillo" />
        <Localization localizationName="reina-victoria" />
        <Localization localizationName="arenal" />
      </div>
      {/* Botón de desplazamiento hacia arriba */}
      <ScrollToTopButton />
    </div>
  );
};

// Define `pageTitleText` como una propiedad estática del componente `ContactPage`
ContactoPage.pageTitleText = "contacto";

/**
 * Obtiene las propiedades del servidor para la página de Contacto.
 * Aplica redirección basada en cookies.
 *
 * @param {GetServerSidePropsContext} context - Contexto de la página de Next.js.
 * @returns {Promise<{ props: {} } | { redirect: { destination: string, permanent: boolean } }>} Propiedades o redirección.
 */
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> => {
  // Aplicar redirección basada en cookies
  const redirectResponse = redirectByCookie(context, "/contacto");
  if (redirectResponse.redirect) {
    return redirectResponse;
  }

  return {
    props: {},
  };
};

export default ContactoPage; // Exporta el componente para su uso en la aplicación
