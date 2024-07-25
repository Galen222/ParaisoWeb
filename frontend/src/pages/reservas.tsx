import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl, que permite la internacionalización de la aplicación.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import styles from "../styles/reservas.module.css"; // Importa estilos CSS específicos para la página de reservas.

interface ReservasPageProps {
  loadingMessages: boolean; // Nuevo prop para el estado de carga
}

// Define el componente funcional ReservasPage.
const ReservasPage = ({ loadingMessages }: ReservasPageProps) => {
  const intl = useIntl(); // Inicia el hook de internacionalización para acceder a las funciones de traducción.

  useVisitedPageTracking("reservas");
  useVisitedPageTrackingGA("reservas");

  if (loadingMessages) {
    return <Loader />;
  }

  // Renderiza el componente con la estructura de la página de reservas.
  return (
    <div className="pageContainer">
      <h1>{intl.formatMessage({ id: "reservas_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "reservas_Descripcion" })}</p>
    </div>
  );
};

export default ReservasPage; // Exporta el componente para que pueda ser utilizado en otras partes de la aplicación.
