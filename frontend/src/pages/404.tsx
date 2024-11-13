// pages/404.tsx

import React from "react";
import type { NextPage } from "next";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import styles from "../styles/pages/error.module.css";

const Custom404Page: NextPage = () => {
  const intl = useIntl(); // Hook para manejar la internacionalización
  const statusCode = 404;

  // Realiza el seguimiento de visitas a la página de error 404 para análisis interno y Google Analytics
  useVisitedPageTracking(`error_${statusCode}`);
  useVisitedPageTrackingGA(`error_${statusCode}`);

  const message = intl.formatMessage({ id: "error_Error404" });
  const imageError = "/images/web/404.png"; // Ruta de la imagen de error 404

  return (
    <div className="pageContainer">
      {/* Título que muestra el código de estado HTTP */}
      {/* Mensaje de error internacionalizado */}
      <h1 className="text-center">{message}</h1> {/* Muestra el mensaje de error */}
      {/* Imagen ilustrativa del error 404 */}
      <div className={styles.imageContainer}>
        <img src={imageError} alt="Error 404" /> {/* Muestra la imagen de error 404 */}
      </div>
    </div>
  );
};

export default Custom404Page;
