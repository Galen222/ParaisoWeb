import React from "react"; // Importa React para crear componentes y utilizar JSX.
import { useIntl } from "react-intl"; // Importa el hook useIntl para internacionalización.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import styles from "../styles/reina-victoria.module.css"; // Importa los estilos CSS específicos para la página Reina Victoria.

// Define el componente funcional ReinaVictoriaPage utilizando una función flecha.
const ReinaVictoriaPage = () => {
  const intl = useIntl(); // Inicializa el hook de internacionalización para usarlo en este componente.
  useVisitedPageTracking("reina-victoria");
  useVisitedPageTrackingGA("reina-victoria");
  // Devuelve el JSX que construye la interfaz de usuario de la página.
  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "reinaVictoria_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "reinaVictoria_Descripcion" })}</p>
    </div>
  );
};

export default ReinaVictoriaPage; // Exporta ReinaVictoriaPage para que pueda ser utilizado en otros lugares de la aplicación.
