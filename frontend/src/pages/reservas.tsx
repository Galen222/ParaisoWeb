import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl, que permite la internacionalización de la aplicación.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import Localization from "../components/Localization";
import type { ComponentType } from "react";
import styles from "../styles/reservas.module.css"; // Importa estilos CSS específicos para la página de reservas.

interface ReservasProps {
  loadingMessages: boolean; // Nuevo prop para el estado de carga
}

// Define el tipo del componente para incluir `pageTitleText`
type ReservasPageComponent = ComponentType<ReservasProps> & { pageTitleText?: string };

// Define el componente funcional ReservasPage.
const Reservas: ReservasPageComponent = ({ loadingMessages }: ReservasProps) => {
  const intl = useIntl(); // Inicia el hook de internacionalización para acceder a las funciones de traducción.
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();
  useVisitedPageTracking("reservas");
  useVisitedPageTrackingGA("reservas");

  if (loadingMessages) {
    return <Loader />;
  }

  // Renderiza el componente con la estructura de la página de reservas.
  return (
    <div className="pageContainer">
      <div>
        <p>{intl.formatMessage({ id: "reservas_Texto1" })}</p>
        <p>{intl.formatMessage({ id: "reservas_Texto2" })}</p>
      </div>
      <br></br>
      <div>
        <Localization localizationName="san-bernardo" />
        <Localization localizationName="bravo-murillo" />
        <Localization localizationName="reina-victoria" />
        <Localization localizationName="arenal" />
      </div>
      {isScrollButtonVisible && (
        <button onClick={scrollToTop} className="scrollTop">
          <img src="/images/web/flechaArriba.png" alt="Subir" />
        </button>
      )}
      <br></br>
    </div>
  );
};

Reservas.pageTitleText = "reservas";

export default Reservas; // Exporta el componente para que pueda ser utilizado en otras partes de la aplicación.
