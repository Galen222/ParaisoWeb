import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para utilizar internacionalización
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import Map from "../components/Map";
import styles from "../styles/arenal.module.css"; // Importa los estilos CSS específicos para la página Arenal

// Define el componente funcional ArenalPage utilizando una función flecha de ES6
const ArenalPage = () => {
  let restaurante = "arenal";
  const intl = useIntl(); // Inicializa el hook de internacionalización para utilizar en este componente
  const [loading, setLoading] = useState(true);

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const locationKey = restaurante;
  // Retorna JSX que representa el UI de la página Arenal
  useEffect(() => {
    if (intl) {
      setLoading(false);
    }
  }, [intl]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "arenal_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "arenal_Descripcion" })}</p>
      <Map locationKey={locationKey} />
    </div>
  );
};

export default ArenalPage; // Exporta ArenalPage para que pueda ser utilizado en otros componentes o páginas de la aplicación
