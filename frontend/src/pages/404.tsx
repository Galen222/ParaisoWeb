// pages/404.tsx

import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import styles from "../styles/error.module.css";

/**
 * Componente para la página personalizada de error 404.
 * Muestra un mensaje de error y una imagen, además de realizar el seguimiento de la visita a la página.
 *
 * @returns {JSX.Element} Página de error 404.
 */
const Custom404 = () => {
  const intl = useIntl(); // Hook para manejar la internacionalización
  const [loading, setLoading] = React.useState(true); // Estado de carga de la página

  // Realiza el seguimiento de la visita a la página de error 404
  useVisitedPageTracking("404");
  useVisitedPageTrackingGA("404");

  // Maneja el estado de carga en función de la disponibilidad de `intl`
  React.useEffect(() => {
    if (intl) {
      setLoading(false); // Finaliza el estado de carga cuando `intl` está disponible
    }
  }, [intl]);

  if (loading) {
    return <Loader />; // Muestra un loader mientras `intl` se inicializa
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

export default Custom404;
