import React, { useEffect, useState } from "react";
// Importa el hook useIntl de react-intl para la internacionalización
import { useIntl } from "react-intl";
// Importa el tipo NextPageContext de Next.js
import { NextPageContext } from "next";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
// Importa los estilos específicos del módulo
import styles from "../styles/error.module.css";

// Define la interfaz para las props del componente ErrorPage
interface ErrorPageProps {
  statusCode: number; // Propiedad que contiene el código de estado HTTP
  loadingMessages: boolean; // Nuevo prop para el estado de carga
}

// Define el componente funcional ErrorPage
const ErrorPage = ({ statusCode, loadingMessages }: ErrorPageProps) => {
  // Obtiene el objeto intl usando el hook useIntl para manejar la internacionalización
  const intl = useIntl();
  const [loading, setLoading] = useState(true);

  useVisitedPageTracking("error");
  useVisitedPageTrackingGA("error");
  // Variable para almacenar el mensaje de error
  let message;
  // Utiliza un switch para determinar el mensaje basado en el código de estado
  switch (statusCode) {
    case 400:
      message = intl.formatMessage({ id: "error_Error400" }); // Mensaje para error 400
      break;
    case 401:
      message = intl.formatMessage({ id: "error_Error401" }); // Mensaje para error 401
      break;
    case 403:
      message = intl.formatMessage({ id: "error_Error403" }); // Mensaje para error 403
      break;
    case 404:
      message = intl.formatMessage({ id: "error_Error404" }); // Mensaje para error 404
      break;
    case 408:
      message = intl.formatMessage({ id: "error_Error408" }); // Mensaje para error 408
      break;
    case 500:
      message = intl.formatMessage({ id: "error_Error500" }); // Mensaje para error 500
      break;
    case 501:
      message = intl.formatMessage({ id: "error_Error501" }); // Mensaje para error 501
      break;
    case 502:
      message = intl.formatMessage({ id: "error_Error502" }); // Mensaje para error 502
      break;
    case 503:
      message = intl.formatMessage({ id: "error_Error503" }); // Mensaje para error 503
      break;
    case 504:
      message = intl.formatMessage({ id: "error_Error504" }); // Mensaje para error 504
      break;
    default:
      // Mensaje genérico para otros códigos de estado
      message = `${statusCode} - ${intl.formatMessage({ id: "error_Other" })}`;
      break;
  }
  // Renderiza el componente de error
  useEffect(() => {
    if (intl) {
      setLoading(false);
    }
  }, [intl]);

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <h1>{statusCode}</h1> {/* Muestra el código de estado */}
      <p>{message}</p> {/* Muestra el mensaje de error */}
    </div>
  );
};

// Define el método getInitialProps para obtener las props iniciales de la página
ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  // Determina el código de estado HTTP basado en la respuesta o el error
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  // Retorna el código de estado como una propiedad
  return { statusCode };
};

// Exporta el componente ErrorPage como el componente por defecto
export default ErrorPage;
