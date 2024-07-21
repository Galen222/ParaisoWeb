import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para internacionalización.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import Map from "../components/Map";
import styles from "../styles/reina-victoria.module.css"; // Importa los estilos CSS específicos para la página Reina Victoria.

interface ReinaVictoriaPageProps {
  loadingMessages: boolean;
  mapLocale: string;
}

// Define el componente funcional ReinaVictoriaPage utilizando una función flecha.
const ReinaVictoriaPage = ({ loadingMessages, mapLocale }: ReinaVictoriaPageProps) => {
  let restaurante = "reina-victoria";
  const intl = useIntl(); // Inicializa el hook de internacionalización para usarlo en este componente.

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const locationKey = restaurante;

  if (loadingMessages) {
    return <Loader />;
  }

  // Devuelve el JSX que construye la interfaz de usuario de la página.
  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "reinaVictoria_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "reinaVictoria_Descripcion" })}</p>
      <Map locationKey={locationKey} mapLocale={mapLocale} />
    </div>
  );
};

export default ReinaVictoriaPage; // Exporta ReinaVictoriaPage para que pueda ser utilizado en otros lugares de la aplicación.
