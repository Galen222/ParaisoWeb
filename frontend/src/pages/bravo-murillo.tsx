import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para la internacionalización de texto.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import Map from "../components/Map";
import styles from "../styles/bravo-murillo.module.css"; // Importa los estilos CSS específicos para esta página.

interface BravoMurilloPageProps {
  loadingMessages: boolean;
  mapLocale: string;
}

// Define el componente funcional BravoMurilloPage.
const BravoMurilloPage = ({ loadingMessages, mapLocale }: BravoMurilloPageProps) => {
  let restaurante = "bravo-murillo";
  const intl = useIntl(); // Utiliza el hook de internacionalización para obtener funciones de traducción.

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const locationKey = restaurante;

  if (loadingMessages) {
    return <Loader />;
  }

  // Devuelve el JSX que construye la UI de la página.
  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "bravoMurillo_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "bravoMurillo_Descripcion" })}</p>
      <Map locationKey={locationKey} mapLocale={mapLocale} />
    </div>
  );
};

export default BravoMurilloPage; // Exporta BravoMurilloPage para que pueda ser utilizado en otros lugares de la aplicación.
