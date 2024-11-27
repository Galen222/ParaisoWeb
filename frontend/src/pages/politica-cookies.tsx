// pages/politica-cookies.tsx

import React, { useState } from "react";
import Link from "next/link";
import type { NextPage, GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"; // Tipos de Next.js
import { useCookieConsent } from "../contexts/CookieContext";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA, useButtonClickTrackingGA } from "../hooks/useTrackingGA";
import useDeviceType from "../hooks/useDeviceType";
import { useToastMessage } from "../hooks/useToast";
import { deleteCookies } from "../utils/cookieUtils";
import { NextSeo, OrganizationJsonLd } from "next-seo"; // Componente para la configuración de SEO
import { redirectByCookie } from "../utils/redirectByCookie"; // Función de redirección basada en cookies
import styles from "../styles/pages/politica-cookies.module.css";
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
 * Interfaz para las propiedades de la página de Política de Cookies.
 */
export interface PoliticaCookiesPageProps {
  messages: Record<string, any>;
}

/**
 * Tipo del componente que incluye `pageTitleText` como propiedad estática.
 */
export type PoliticaCookiesPageComponent = NextPage & { pageTitleText?: string };

/**
 * Componente que representa la página de Política de Cookies.
 *
 * @returns {JSX.Element} El componente de la página de Política de Cookies.
 */
const PoliticaCookiesPage: NextPage & { pageTitleText?: string } = (): JSX.Element => {
  const intl = useIntl(); // Hook de internacionalización para acceder a las funciones de traducción
  const currentUrl = useCurrentUrl(); // Hook para obtener la página web actual
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";
  const currentLocale = intl.locale || "es"; // Fallback a 'es' si no está definido
  const currentMessages = messages[currentLocale] || messages["es"];

  const { showToast } = useToastMessage(); // Utiliza el hook para mostrar las notificaciones

  // Estado para indicar si se está ejecutando la acción de borrar cookies.
  const [isPushingDelCookies, setIsPushingDelCookies] = useState(false);
  // Hook personalizado para determinar el tipo de dispositivo.
  const deviceType = useDeviceType();
  const isMobile = deviceType === "mobile";

  // Contexto para manejar el consentimiento de cookies.
  const {
    setAcceptCookieAnalysis,
    setAcceptCookieAnalysisGoogle,
    setAcceptCookiePersonalization,
    cookieConsentAnalysis,
    setCookieConsentAnalysis,
    cookieConsentAnalysisGoogle,
    setCookieConsentAnalysisGoogle,
    cookieConsentPersonalization,
    setCookieConsentPersonalization,
  } = useCookieConsent();

  // Estado que representa si alguna de las cookies está consentida.
  const cookiesState = cookieConsentAnalysis || cookieConsentPersonalization || cookieConsentAnalysisGoogle;

  // Hooks para el seguimiento de la página visitada.
  useVisitedPageTracking("politica-cookies");
  useVisitedPageTrackingGA("politica-cookies");

  // Hook para el seguimiento de clics en botones a través de Google Analytics.
  const trackButtonClick = useButtonClickTrackingGA();

  // Maneja la eliminación de cookies y actualiza el estado correspondiente.
  const handleDeleteCookies = async () => {
    trackButtonClick("Borrar Cookies");
    setIsPushingDelCookies(true);
    const success = await deleteCookies(
      intl,
      setAcceptCookiePersonalization,
      cookieConsentAnalysis,
      setAcceptCookieAnalysis,
      setCookieConsentAnalysis,
      cookieConsentAnalysisGoogle,
      setAcceptCookieAnalysisGoogle,
      setCookieConsentAnalysisGoogle,
      cookieConsentPersonalization,
      setCookieConsentPersonalization
    );

    if (success) {
      // Notificación de éxito al borrar cookies.
      showToast("cookie_Borrado_Ok", 4000, "success"); // Muestra el toast utilizando el hook
    } else {
      // Notificación de error si la eliminación de cookies falla.
      showToast("cookie_Borrado_Error", 4000, "error"); // Muestra el toast utilizando el hook
    }

    setIsPushingDelCookies(false);
  };

  /**
   * Tabla de cookies para dispositivos móviles.
   */
  const mobileTable = (
    <table className="table table-dark table-striped-columns rounded-3 overflow-hidden">
      <tbody>
        {Array.from({ length: 4 }, (_, i) => (
          <React.Fragment key={i}>
            <tr>
              <td>Nombre</td>
              <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Nombre${i + 1}` })}</td>
            </tr>
            <tr>
              <td>Titular</td>
              <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Titular${i + 1}` })}</td>
            </tr>
            <tr>
              <td>Finalidad</td>
              <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Finalidad${i + 1}` })}</td>
            </tr>
            <tr>
              <td>Duración</td>
              <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Duracion${i + 1}` })}</td>
            </tr>
            {i < 3 && ( // Condición para no mostrar el separador en el último grupo
              <tr className={styles.tableSeparator}>
                <td colSpan={2}></td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );

  /**
   * Tabla de cookies para dispositivos de escritorio.
   */
  const desktopTable = (
    <table className="table table-dark table-striped-columns rounded-3 overflow-hidden">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Titular</th>
          <th>Finalidad</th>
          <th>Duración</th>
        </tr>
      </thead>
      <tbody className="table-group-divider">
        {Array.from({ length: 4 }, (_, i) => i + 1).map((index) => (
          <tr key={index}>
            <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Nombre${index}` })}</td>
            <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Titular${index}` })}</td>
            <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Finalidad${index}` })}</td>
            <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Duracion${index}` })}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  return (
    <div className="pageContainer">
      {/* Configuración de SEO específica de la página */}
      <NextSeo
        {...getSEOConfig(currentLocale, currentMessages)}
        title={intl.formatMessage({ id: "politica-cookies_SEO_Titulo" })}
        description={intl.formatMessage({ id: "politica-cookies_SEO_Descripcion" })}
        openGraph={{
          title: intl.formatMessage({ id: "politica-cookies_SEO_Titulo" }),
          description: intl.formatMessage({ id: "politica-cookies_SEO_Descripcion" }),
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
      <div>
        <h1 className="text-center">{intl.formatMessage({ id: "politicaCookies_Principal_Titulo" })}</h1>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaCookies_Principal_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Principal_Texto" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaCookies_Informacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Informacion_Texto" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaCookies_Clasificacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Clasificacion1_Texto1" })}</p>
        <ul className={styles.listas}>
          <li>
            {intl.formatMessage({
              id: "politicaCookies_Clasificacion1_Texto1_Punto1",
            })}
          </li>
          <li>
            {intl.formatMessage({
              id: "politicaCookies_Clasificacion1_Texto1_Punto2",
            })}
          </li>
        </ul>
        <p className="ti-20p">
          {intl.formatMessage({
            id: "politicaCookies_Clasificacion1_Texto2",
          })}
        </p>
        <p className="ti-20p">
          {intl.formatMessage({
            id: "politicaCookies_Clasificacion2_Texto",
          })}
        </p>
        <ul className={styles.listas}>
          <li>
            {intl.formatMessage({
              id: "politicaCookies_Clasificacion2_Texto_Punto1",
            })}
          </li>
          <li>
            {intl.formatMessage({
              id: "politicaCookies_Clasificacion2_Texto_Punto2",
            })}
          </li>
        </ul>
        <p className="ti-20p">
          {intl.formatMessage({
            id: "politicaCookies_Clasificacion3_Texto",
          })}
        </p>
        <ul className={styles.listas}>
          <li>
            {intl.formatMessage({
              id: "politicaCookies_Clasificacion3_Texto_Punto1",
            })}
          </li>
          <li>
            {intl.formatMessage({
              id: "politicaCookies_Clasificacion3_Texto_Punto2",
            })}
          </li>
          <li>
            {intl.formatMessage({
              id: "politicaCookies_Clasificacion3_Texto_Punto3",
            })}
          </li>
          <li>
            {intl.formatMessage({
              id: "politicaCookies_Clasificacion3_Texto_Punto4",
            })}
          </li>
          <li>
            {intl.formatMessage({
              id: "politicaCookies_Clasificacion3_Texto_Punto5",
            })}
          </li>
          <li>
            {intl.formatMessage({
              id: "politicaCookies_Clasificacion3_Texto_Punto6",
            })}
          </li>
        </ul>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">
          {intl.formatMessage({
            id: "politicaCookies_Utilizadas_Titulo",
          })}
        </h3>
        <div className="table-responsive">{isMobile ? mobileTable : desktopTable}</div>
        <p className="ti-20p">
          {intl.formatMessage({
            id: "politicaCookies_Utilizadas_texto1",
          })}
          <a
            className={styles.link}
            href={intl.formatMessage({
              id: "politicaCookies_Utilizadas_texto1_Enlace",
            })}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Analytics
          </a>
          .
        </p>
        {/* <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Utilizadas_texto2" })}</p> */}
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">
          {intl.formatMessage({
            id: "politicaCookies_Aceptacion_Titulo",
          })}
        </h3>
        <p className="ti-20p">
          {intl.formatMessage({
            id: "politicaCookies_Aceptacion_Texto1",
          })}
        </p>
        <p className="ti-20p">
          {intl.formatMessage({
            id: "politicaCookies_Aceptacion_Texto2",
          })}
        </p>
        <p className="ti-20p">
          {intl.formatMessage({
            id: "politicaCookies_Aceptacion_Texto3",
          })}
        </p>
        <ul className={styles.listas}>
          <li>
            {intl.formatMessage({
              id: "politicaCookies_Aceptacion_Texto3_Punto1",
            })}
          </li>
          <li>
            {intl.formatMessage({
              id: "politicaCookies_Aceptacion_Texto3_Punto2",
            })}
          </li>
          <li>
            {intl.formatMessage({
              id: "politicaCookies_Aceptacion_Texto3_Punto3",
            })}
          </li>
          <li>
            {intl.formatMessage({
              id: "politicaCookies_Aceptacion_Texto3_Punto4",
            })}
            <Link href="/politica-privacidad" className={styles.link}>
              <span>
                {intl.formatMessage({
                  id: "politicaCookies_Aceptacion_Texto3_Punto4_Enlace",
                })}
              </span>
            </Link>
            .
          </li>
        </ul>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">
          {intl.formatMessage({
            id: "politicaCookies_Denegacion_Titulo",
          })}
        </h3>
        <p className="ti-20p">
          {intl.formatMessage({
            id: "politicaCookies_Denegacion_Texto",
          })}
        </p>
      </div>
      <div className="text-center">
        <button
          className={`btn btn-primary mx-auto ${styles.deleteButton} ${isPushingDelCookies ? "animate-push" : ""} ${
            !cookiesState ? styles.disabledButton : ""
          }`}
          disabled={!cookiesState}
          onClick={() => handleDeleteCookies()}
          onAnimationEnd={() => setIsPushingDelCookies(false)}
        >
          {intl.formatMessage({
            id: "politicaCookies_BotonBorrar",
          })}
        </button>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">
          {intl.formatMessage({
            id: "politicaCookies_Desactivacion_Titulo",
          })}
        </h3>
        <p className="ti-20p">
          {intl.formatMessage({
            id: "politicaCookies_Desactivacion_Texto1",
          })}
        </p>
        <p className="ti-20p">
          {intl.formatMessage({
            id: "politicaCookies_Desactivacion_Texto2",
          })}
        </p>
        <p className="ti-20p">
          {intl.formatMessage({
            id: "politicaCookies_Desactivacion_Texto3",
          })}
        </p>
        <ul className={`text-left ${styles.listas}`}>
          <li>
            <a
              className={styles.link}
              href={intl.formatMessage({
                id: "politicaCookies_Desactivacion_Texto3_Punto1_Enlace",
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.formatMessage({
                id: "politicaCookies_Desactivacion_Texto3_Punto1",
              })}
            </a>
          </li>
          <li>
            <a
              className={styles.link}
              href={intl.formatMessage({
                id: "politicaCookies_Desactivacion_Texto3_Punto2_Enlace",
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.formatMessage({
                id: "politicaCookies_Desactivacion_Texto3_Punto2",
              })}
            </a>
          </li>
          <li>
            <a
              className={styles.link}
              href={intl.formatMessage({
                id: "politicaCookies_Desactivacion_Texto3_Punto3_Enlace",
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.formatMessage({
                id: "politicaCookies_Desactivacion_Texto3_Punto3",
              })}
            </a>
          </li>
          <li>
            <a
              className={styles.link}
              href={intl.formatMessage({
                id: "politicaCookies_Desactivacion_Texto3_Punto4_Enlace",
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.formatMessage({
                id: "politicaCookies_Desactivacion_Texto3_Punto4",
              })}
            </a>
          </li>
          <li>
            <a
              className={styles.link}
              href={intl.formatMessage({
                id: "politicaCookies_Desactivacion_Texto3_Punto5_Enlace",
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.formatMessage({
                id: "politicaCookies_Desactivacion_Texto3_Punto5",
              })}
            </a>
          </li>
        </ul>
        <p className="ti-20p">
          {intl.formatMessage({
            id: "politicaCookies_Desactivacion_Texto4",
          })}
        </p>
        <ul className={styles.listas}>
          <li>
            <a
              className={styles.link}
              href={intl.formatMessage({
                id: "politicaCookies_Desactivacion_Texto4_Punto1_Enlace",
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.formatMessage({
                id: "politicaCookies_Desactivacion_Texto4_Punto1",
              })}
            </a>
          </li>
          <li>
            <a
              className={styles.link}
              href={intl.formatMessage({
                id: "politicaCookies_Desactivacion_Texto4_Punto2_Enlace",
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.formatMessage({
                id: "politicaCookies_Desactivacion_Texto4_Punto2",
              })}
            </a>
          </li>
        </ul>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">
          {intl.formatMessage({
            id: "politicaCookies_Actualizacion_Titulo",
          })}
        </h3>
        <p className="ti-20p">
          {intl.formatMessage({
            id: "politicaCookies_Actualizacion_Texto",
          })}
        </p>
      </div>
      <ScrollToTopButton />
    </div>
  );
};

PoliticaCookiesPage.pageTitleText = "default";

/**
 * Obtiene las propiedades del lado del servidor para la página de Política de Cookies.
 * Realiza redirecciones si es necesario.
 *
 * @param {GetServerSidePropsContext} context - Contexto de la página de Next.js.
 * @returns {Promise<GetServerSidePropsResult<{}>>} Propiedades de la página o redirección.
 */
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> => {
  const redirectResponse = redirectByCookie(context, "/politica-cookies");
  if (redirectResponse.redirect) {
    return { redirect: redirectResponse.redirect };
  }

  return { props: {} };
};

export default PoliticaCookiesPage;
