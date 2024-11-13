// pages/_error.tsx

import React from "react";
import type { NextPage, NextPageContext } from "next";
import { useIntl } from "react-intl"; // Hook para internacionalización
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking"; // Hook personalizado para seguimiento de visitas
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA"; // Hook personalizado para seguimiento con Google Analytics
import styles from "../styles/pages/error.module.css"; // Importa los estilos específicos para la página de error

/**
 * Interfaz para las propiedades de ErrorPage.
 * @property {number} statusCode - Código de estado HTTP que causó el error.
 */
export interface ErrorPageProps {
  statusCode: number;
}

/**
 * Componente funcional para manejar y mostrar páginas de error con mensajes internacionalizados.
 * Incluye seguimiento de visitas y configuraciones de SEO.
 *
 * @param {ErrorPageProps} props - Propiedades del componente ErrorPage.
 * @returns {JSX.Element} Componente de página de error.
 */
const ErrorPage: NextPage<ErrorPageProps> = ({ statusCode }: ErrorPageProps): JSX.Element => {
  const intl = useIntl(); // Hook para manejar la internacionalización

  // Realiza el seguimiento de visitas a la página de error para análisis interno y Google Analytics
  useVisitedPageTracking(`error_${statusCode}`);
  useVisitedPageTrackingGA(`error_${statusCode}`);

  // Determina el mensaje de error basado en el código de estado HTTP
  let message;
  switch (statusCode) {
    case 400:
      message = intl.formatMessage({ id: "error_Error400" });
      break;
    case 401:
      message = intl.formatMessage({ id: "error_Error401" });
      break;
    case 403:
      message = intl.formatMessage({ id: "error_Error403" });
      break;
    case 408:
      message = intl.formatMessage({ id: "error_Error408" });
      break;
    case 500:
      message = intl.formatMessage({ id: "error_Error500" });
      break;
    case 501:
      message = intl.formatMessage({ id: "error_Error501" });
      break;
    case 502:
      message = intl.formatMessage({ id: "error_Error502" });
      break;
    case 503:
      message = intl.formatMessage({ id: "error_Error503" });
      break;
    case 504:
      message = intl.formatMessage({ id: "error_Error504" });
      break;
    default:
      message = `${statusCode} - ${intl.formatMessage({ id: "error_Other" })}`;
      break;
  }

  const imageError = "/images/web/error.png"; // Ruta de la imagen de error

  return (
    <div className="pageContainer">
      {/* Título que muestra el código de estado HTTP */}
      <h1>{statusCode}</h1>
      {/* Mensaje de error internacionalizado */}
      <p className="text-center">{message}</p>
      {/* Imagen ilustrativa del error */}
      <div className={styles.imageContainer}>
        <img src={imageError} alt={`Error ${statusCode}`} />
      </div>
    </div>
  );
};

/**
 * Método para obtener las propiedades iniciales del componente de error.
 * Determina el código de estado HTTP a partir de la respuesta del servidor o del error.
 *
 * @param {NextPageContext} context - Contexto de la página de Next.js.
 * @returns {ErrorPageProps} Propiedades de la página de error con el código de estado.
 */
ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorPageProps => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return {
    statusCode,
  };
};

export default ErrorPage; // Exporta el componente ErrorPage como predeterminado.
