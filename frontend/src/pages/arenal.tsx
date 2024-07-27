import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para utilizar internacionalización
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import AnimatedTitle from "../components/AnimatedTitle";
import Map from "../components/Map";
import styles from "../styles/arenal.module.css"; // Importa los estilos CSS específicos para la página Arenal

interface ArenalPageProps {
  cookiesModalClosed: boolean;
  loadingMessages: boolean;
  mapLocale: string;
}

// Define el componente funcional ArenalPage utilizando una función flecha de ES6
const ArenalPage = ({ loadingMessages, mapLocale, cookiesModalClosed }: ArenalPageProps) => {
  let restaurante = "arenal";
  const intl = useIntl(); // Inicializa el hook de internacionalización para utilizar en este componente

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const locationKey = restaurante;

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <AnimatedTitle text1Id="arenal_Titulo_Texto1" text2Id="arenal_Titulo_Texto2" cookiesModalClosed={cookiesModalClosed} />
      <p>{intl.formatMessage({ id: "arenal_Descripcion" })}</p>
      <Map locationKey={locationKey} mapLocale={mapLocale} />
    </div>
  );
};

export default ArenalPage; // Exporta ArenalPage para que pueda ser utilizado en otros componentes o páginas de la aplicación
