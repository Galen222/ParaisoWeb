// pages/aviso-legal.tsx

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { NextPage, GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import { NextSeo, OrganizationJsonLd } from "next-seo"; // Importa NextSeo para la gestión de SEO
import { redirectByCookie } from "../utils/redirectByCookie"; // Importa la función de redirección
import styles from "../styles/pages/aviso-legal.module.css";
import getSEOConfig from "../next-seo.config";
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
 * Tipo de componente para `AvisoLegalPage` que incluye una propiedad opcional `pageTitleText`.
 */
export type AvisoLegalComponent = NextPage & { pageTitleText?: string };

/**
 * Componente funcional para la página de "Aviso Legal".
 * Muestra información legal y de privacidad, incluyendo enlaces a otras políticas.
 *
 * @returns {JSX.Element} Página de Aviso Legal.
 */
const AvisoLegalPage: NextPage & { pageTitleText?: string } = (): JSX.Element => {
  const intl = useIntl(); // Hook de internacionalización para acceder a las funciones de traducción
  const currentUrl = useCurrentUrl(); // Hook para obtener la página web actual
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";
  const currentLocale = intl.locale || "es"; // Fallback a 'es' si no está definido
  const currentMessages = messages[currentLocale] || messages["es"];

  const router = useRouter(); // Hook de Next.js para acceder al enrutador

  // Seguimiento de la visita a la página "Aviso Legal" para análisis interno y Google Analytics
  useVisitedPageTracking("aviso-legal");
  useVisitedPageTrackingGA("aviso-legal");

  return (
    <div className="pageContainer">
      {/* Configuración de SEO específica de la página */}
      <NextSeo
        {...getSEOConfig(currentLocale, currentMessages)}
        title={intl.formatMessage({ id: "aviso-legal_SEO_Titulo" })}
        description={intl.formatMessage({ id: "aviso-legal_SEO_Descripcion" })}
        openGraph={{
          title: intl.formatMessage({ id: "aviso-legal_SEO_Titulo" }),
          description: intl.formatMessage({ id: "aviso-legal_SEO_Descripcion" }),
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
      <div>
        <h1 className="text-center">{intl.formatMessage({ id: "avisoLegal_Principal_Titulo" })}</h1>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Principal_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Principal_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Principal_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Principal_Texto3" })}</p>
      </div>
      {/* Datos Identificativos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Titulo" })}</h3>
        <ul className={`text-left ${styles.listas}`}>
          <li>{intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto5" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto6" })}</li>
          <li>
            {intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto7" })}
            <a className={styles.link} href={`mailto:${intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto7_Enlace" })}`}>
              {intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto7_Enlace" })}
            </a>
          </li>
        </ul>
      </div>
      {/* Secciones adicionales de contenido legal */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Objeto_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Objeto_Texto" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Privacidad_Titulo" })}</h3>
        <p className="ti-20p">
          {intl.formatMessage({ id: "avisoLegal_Privacidad_Texto" })}
          <Link href="/politica-privacidad" locale={router.locale} className={styles.link}>
            {intl.formatMessage({ id: "avisoLegal_Privacidad_Texto_Enlace" })}
          </Link>
          .
        </p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Propiedad_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Propiedad_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Propiedad_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Propiedad_Texto3" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Propiedad_Texto4" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Obligaciones_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1_Punto1" })}</li>
          <ul className={styles.listas2}>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1_Punto1_1" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1_Punto1_2" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1_Punto1_3" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1_Punto1_4" })}</li>
          </ul>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1_Punto3" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto4" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto5" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto6" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto7" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto8" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9" })}</li>
          <ul className={styles.listas2}>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_1" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_2" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_3" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_4" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_5" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_6" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_7" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_8" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_9" })}</li>
          </ul>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto3" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto3" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto3_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto3_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto3_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto3_Punto4" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto4" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto5" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto3" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto3_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto3_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto3_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto3_Punto4" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto4" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto5" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Proteccion_Titulo" })}</h3>
        <p className="ti-20p">
          {intl.formatMessage({ id: "avisoLegal_Proteccion_Texto" })}
          <Link href="/politica-privacidad" locale={router.locale} className={styles.link}>
            {intl.formatMessage({ id: "avisoLegal_Proteccion_Texto_Enlace" })}
          </Link>
          .
        </p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Cookies_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Cookies_Texto1" })}</p>
        <p className="ti-20p">
          {intl.formatMessage({ id: "avisoLegal_Cookies_Texto2" })}
          <Link href="/politica-cookies" locale={router.locale} className={styles.link}>
            {intl.formatMessage({ id: "avisoLegal_Cookies_Texto2_Enlace" })}
          </Link>
          .
        </p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Cookies_Texto3" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Declaraciones_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Declaraciones_Texto" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Fuerza_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Fuerza_Texto" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Resolucion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Resolucion_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Resolucion_Texto2" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Actualizacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Actualizacion_Texto" })}</p>
      </div>
      <ScrollToTopButton /> {/* Usa el componente de scroll-to-top */}
    </div>
  );
};

// Asigna `pageTitleText` como propiedad estática del componente `AvisoLegalPage`
AvisoLegalPage.pageTitleText = "default";

/**
 * Función `getServerSideProps` para manejar la redirección basada en cookies.
 *
 * @param {GetServerSidePropsContext} context - Contexto de la página de Next.js.
 * @returns {Promise<GetServerSidePropsResult<{}>>} Redirección o props vacíos.
 */
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> => {
  // Aplicar redirección basada en cookies
  const redirectResponse = redirectByCookie(context, "/aviso-legal");
  if (redirectResponse.redirect) {
    return redirectResponse;
  }

  // Retorna props vacíos, ya que la carga de mensajes se maneja globalmente
  return {
    props: {},
  };
};

export default AvisoLegalPage; // Exporta el componente para su uso en la aplicación
