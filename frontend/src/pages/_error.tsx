// pages/_error.tsx

import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl"; // Hook para internacionalización
import { NextPageContext } from "next"; // Tipo para el contexto de la página de Next.js
import Loader from "../components/Loader";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import styles from "../styles/pages/error.module.css"; // Importa los estilos específicos para el módulo de error

/**
 * Interfaz para las propiedades de ErrorPage.
 * @property {number} statusCode - Código de estado HTTP que causó el error.
 * @property {boolean} loadingMessages - Estado de carga de los mensajes.
 */
interface ErrorPageProps {
  statusCode: number;
  loadingMessages: boolean;
}

/**
 * Componente funcional para manejar y mostrar páginas de error con mensajes internacionalizados.
 * También incluye seguimiento de visitas a páginas de error.
 *
 * @param {ErrorPageProps} props - Propiedades del componente ErrorPage.
 * @returns {JSX.Element} Componente de página de error.
 */
const ErrorPage = ({ statusCode, loadingMessages }: ErrorPageProps) => {
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

  const imageFileName = "/images/web/error.png"; // Ruta de la imagen de error

  if (loadingMessages) {
    return <Loader />; // Muestra un loader mientras los mensajes están cargando
  }

  return (
    <div className="pageContainer">
      <h1>{statusCode}</h1> {/* Muestra el código de estado HTTP */}
      <p className="text-center">{message}</p> {/* Muestra el mensaje de error */}
      <div className={styles.imageContainer}>
        <img src={imageFileName} alt={`Error ${statusCode}`} /> {/* Muestra la imagen de error */}
      </div>
    </div>
  );
};

/**
 * Método para obtener las propiedades iniciales del componente de error.
 * Determina el código de estado HTTP a partir de la respuesta del servidor o del error.
 *
 * @param {NextPageContext} context - Contexto de la página de Next.js.
 * @returns {{ statusCode: number }} Código de estado HTTP como una propiedad.
 */
ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage; // Exporta el componente ErrorPage como predeterminado
