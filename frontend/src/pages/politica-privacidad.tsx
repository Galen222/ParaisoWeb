import React from "react";
import { useRouter } from "next/router";
import type { NextPage, GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"; // Tipos de Next.js
import Link from "next/link";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import { redirectByCookie } from "../utils/redirectByCookie"; // Función de redirección basada en cookies
import styles from "../styles/pages/politica-privacidad.module.css";
import { NextSeo, OrganizationJsonLd } from "next-seo";
import getSEOConfig from "../config/next-seo.config";
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
 * Interfaz para las propiedades de la página de Política de Privacidad.
 * @property {Record<string, any>} messages - Mensajes de localización.
 */
export interface PoliticaPrivacidadPageProps {
  messages: Record<string, any>;
}

/**
 * Tipo del componente que incluye `pageTitleText` como propiedad estática.
 */
export type PoliticaPrivacidadPageComponent = NextPage & { pageTitleText?: string };

/**
 * Componente que representa la página de Política de Privacidad.
 *
 * @returns {JSX.Element} El componente de la página de Política de Privacidad.
 */
const PoliticaPrivacidadPage: NextPage & { pageTitleText?: string } = (): JSX.Element => {
  const intl = useIntl(); // Hook de internacionalización para acceder a las funciones de traducción
  const currentUrl = useCurrentUrl(); // Hook para obtener la página web actual
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";
  const currentLocale = intl.locale || "es"; // Fallback a 'es' si no está definido
  const currentMessages = messages[currentLocale] || messages["es"];

  // Hooks para el seguimiento de la página visitada.
  useVisitedPageTracking("politica-privacidad");
  useVisitedPageTrackingGA("politica-privacidad");

  return (
    <div className="pageContainer">
      {/* Configuración de SEO específica de la página */}
      <NextSeo
        {...getSEOConfig(currentLocale, currentMessages)}
        title={intl.formatMessage({ id: "politica-privacidad_SEO_Titulo" })}
        description={intl.formatMessage({ id: "politica-privacidad_SEO_Descripcion" })}
        openGraph={{
          title: intl.formatMessage({ id: "politica-privacidad_SEO_Titulo" }),
          description: intl.formatMessage({ id: "politica-privacidad_SEO_Descripcion" }),
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
      {/* Título principal de la página */}
      <div>
        <h1 className="text-center">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Titulo" })}</h1>
      </div>
      {/* Sección principal de la política de privacidad */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Texto3" })}</p>
      </div>
      {/* Sección de datos identificativos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Titulo" })}</h3>
        <ul className={`text-left ${styles.listas}`}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto3" })}</li>
          {/*<li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto4" })}</li> */}
          <li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto5" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto6" })}</li>
          <li>
            {intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto7" })}
            <a className={styles.link} href={`mailto:${intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto7_Enlace" })}`}>
              {intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto7_Enlace" })}
            </a>
          </li>
        </ul>
      </div>
      {/* Sección de principios de privacidad */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Principios_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Principios_Texto" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Principios_Texto_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Principios_Texto_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Principios_Texto_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Principios_Texto_Punto4" })}</li>
        </ul>
      </div>
      {/* Sección de datos personales */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Datos_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Datos_Texto" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Datos_Texto_Punto1" })}</li>
        </ul>
      </div>
      {/* Sección de derechos de los usuarios */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto1" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto1_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto1_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto1_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto1_Punto4" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto1_Punto5" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto2" })}</p>
        <p className="ti-20p">
          {intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto3_1" })}
          <a className={styles.link} href={`mailto:${intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto3_Enlace" })}`}>
            {intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto3_Enlace" })}
          </a>
          {intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto3_2" })}
        </p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto4" })}</p>
      </div>
      {/* Sección de finalidad del tratamiento de datos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto2" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto2_Punto1" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto3" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto3_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto3_Punto2" })}</li>
          <li>
            {intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto3_Punto3" })}
            <Link href="/politica-cookies" className={styles.link}>
              {intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto3_Punto3_Enlace" })}
            </Link>
            .
          </li>
          {/* <li>{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto3_Punto4" })}</li> */}
        </ul>
        {/* 
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4" })}</p>
        <ul className={styles.listas}>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto1_Enlace" })} target="_blank" rel="noopener noreferrer">
              {intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto1" })}
            </a>
          </li>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto2_Enlace" })} target="_blank" rel="noopener noreferrer">
              {intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto2" })}
            </a>
          </li>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto3_Enlace" })} target="_blank" rel="noopener noreferrer">
              {intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto3" })}
            </a>
          </li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto5" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto6" })}</p> 
        */}
      </div>
      {/* Sección de seguridad de los datos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Seguridad_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Seguridad_Texto1" })}</p>
        <p className="ti-20p">
          {intl.formatMessage({ id: "politicaPrivacidad_Seguridad_Texto2_1" })}
          <a
            className={styles.link}
            href={intl.formatMessage({ id: "politicaPrivacidad_Seguridad_Texto2_2_Enlace" })}
            target="_blank"
            rel="noopener noreferrer"
          >
            {intl.formatMessage({ id: "politicaPrivacidad_Seguridad_Texto2_2" })}
          </a>
          {intl.formatMessage({ id: "politicaPrivacidad_Seguridad_Texto2_3" })}
        </p>
      </div>
      {/* Sección de contenido de la política de privacidad */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Contenido_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Contenido_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Contenido_Texto2" })}</p>
      </div>
      {/* Sección de política de cookies */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_PoliticaCookies_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_PoliticaCookies_Texto1" })}</p>
        <p className="ti-20p">
          {intl.formatMessage({ id: "politicaPrivacidad_PoliticaCookies_Texto2_1" })}
          <Link href="/politica-cookies" className={styles.link}>
            {intl.formatMessage({ id: "politicaPrivacidad_PoliticaCookies_Texto2_2" })}
          </Link>
          {intl.formatMessage({ id: "politicaPrivacidad_PoliticaCookies_Texto2_3" })}
        </p>
      </div>
      {/* Sección de legitimación para el tratamiento de datos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Legitimacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Legitimacion_Texto1" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Legitimacion_Texto1_Punto1" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Legitimacion_Texto2" })}</p>
      </div>
      {/* Sección de categorías de datos personales */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Categorias_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Categorias_Texto" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Categorias_Texto_Punto1" })}</li>
        </ul>
      </div>
      {/* Sección de conservación de datos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Conservacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Conservacion_Texto" })}</p>
      </div>
      {/* Sección de destinatarios de los datos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Destinatarios_Titulo" })}</h3>
        <ul className={styles.listas}>
          <li>
            {intl.formatMessage({ id: "politicaPrivacidad_Destinatarios_Punto1_1" })}
            <a
              className={styles.link}
              href={intl.formatMessage({ id: "politicaPrivacidad_Destinatarios_Punto1_2_Enlace" })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.formatMessage({ id: "politicaPrivacidad_Destinatarios_Punto1_2" })}
            </a>
            {intl.formatMessage({ id: "politicaPrivacidad_Destinatarios_Punto1_3" })}
          </li>
        </ul>
      </div>
      {/* Sección de navegación y uso de cookies */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Navegacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Navegacion_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Navegacion_Texto2" })}</p>
        <ul className={styles.listas}>
          <li>
            <a
              className={styles.link}
              href={intl.formatMessage({ id: "politicaPrivacidad_Navegacion_Texto2_Punto1_Enlace" })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.formatMessage({ id: "politicaPrivacidad_Navegacion_Texto2_Punto1" })}
            </a>
          </li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Navegacion_Texto3" })}</p>
      </div>
      {/* Sección de veracidad de la información */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Veracidad_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Veracidad_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Veracidad_Texto2" })}</p>
      </div>
      {/* Sección de aceptación de la política de privacidad */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Aceptacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Aceptacion_Texto" })}</p>
      </div>
      {/* Sección de revocabilidad del consentimiento */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Revocabilidad_Titulo" })}</h3>
        <p className="ti-20p">
          {intl.formatMessage({ id: "politicaPrivacidad_Revocabilidad_Texto1_1" })}
          <a className={styles.link} href={`mailto:${intl.formatMessage({ id: "politicaPrivacidad_Revocabilidad_Texto1_Enlace" })}`}>
            {intl.formatMessage({ id: "politicaPrivacidad_Revocabilidad_Texto1_Enlace" })}
          </a>
          {intl.formatMessage({ id: "politicaPrivacidad_Revocabilidad_Texto1_2" })}
        </p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Revocabilidad_Texto2" })}</p>
      </div>
      {/* Sección de actualización de la política de privacidad */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Actualizacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Actualizacion_Texto" })}</p>
      </div>
      {/* Botón para desplazarse hacia arriba */}
      <ScrollToTopButton />
    </div>
  );
};

// Define `pageTitleText` como propiedad estática del componente `PoliticaPrivacidadPage`
PoliticaPrivacidadPage.pageTitleText = "default";

/**
 * Obtiene las propiedades del lado del servidor para la página de Política de Privacidad.
 * Aplica redirección basada en cookies.
 *
 * @param {GetServerSidePropsContext} context - Contexto de la página de Next.js.
 * @returns {Promise<GetServerSidePropsResult<{}>>} Propiedades de la página o redirección.
 */
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> => {
  // Aplicar redirección basada en cookies
  const redirectResponse = redirectByCookie(context, "/politica-privacidad");
  if (redirectResponse.redirect) {
    return {
      redirect: redirectResponse.redirect,
    };
  }

  return {
    props: {},
  };
};

export default PoliticaPrivacidadPage;
