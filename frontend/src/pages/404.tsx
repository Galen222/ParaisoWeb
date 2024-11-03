// pages/404.tsx

import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import styles from "../styles/error.module.css";
import type { ComponentType } from "react";

/**
 * Propiedades para el componente `Custom404Page`.
 * @property {boolean} loadingMessages - Indica si los mensajes de la página están en proceso de carga.
 */
interface Custom404PageProps {
  loadingMessages: boolean;
}

/**
 * Componente para la página personalizada de error 404.
 * Muestra un mensaje de error y una imagen, además de realizar el seguimiento de la visita a la página.
 *
 * @param {Custom404PageProps} props - Propiedades para el componente `Custom404`.
 * @returns {JSX.Element} Página de error 404.
 */
const Custom404Page = ({ loadingMessages }: Custom404PageProps) => {
  const intl = useIntl(); // Hook para manejar la internacionalización

  // Realiza el seguimiento de la visita a la página de error 404
  useVisitedPageTracking("404");
  useVisitedPageTrackingGA("404");

  // Muestra un loader si los mensajes están en proceso de carga
  if (loadingMessages) {
    return <Loader />;
  }

  // Mensaje de error para la página 404
  const message = intl.formatMessage({ id: "error_Error404" });
  const imagePath = `/images/web/404.png`; // Ruta de la imagen de error 404

  return (
    <div className="pageContainer">
      <p className="text-center">{message}</p> {/* Muestra el mensaje de error */}
      <div className={styles.imageContainer}>
        <img src={imagePath} alt="Error 404" /> {/* Muestra la imagen de error 404 */}
      </div>
    </div>
  );
};

export default Custom404Page; // Exporta el componente para su uso en la aplicación
