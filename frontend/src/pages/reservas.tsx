// pages/reservas.tsx

import React from "react";
import type { ComponentType } from "react";
import Loader from "../components/Loader";
import Localization from "../components/Localization";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useIntl } from "react-intl"; // Importa el hook useIntl, que permite la internacionalización de la aplicación.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";

/**
 * Interfaz para las propiedades del componente de reservas.
 */
export interface ReservasPageProps {
  loadingMessages: boolean; // Indica si los mensajes están en estado de carga.
}

/**
 * Tipo del componente que incluye `pageTitleText` como propiedad estática.
 */
export type ReservasPageComponent = ComponentType<ReservasPageProps> & { pageTitleText?: string };

/**
 * Componente funcional para la página de reservas.
 *
 * @param {ReservasPageProps} props - Las propiedades del componente.
 * @param {boolean} props.loadingMessages - Estado de carga de los mensajes.
 * @returns {JSX.Element} El componente de la página de reservas.
 */
const ReservasPage: ReservasPageComponent = ({ loadingMessages }: ReservasPageProps): JSX.Element => {
  const intl = useIntl(); // Inicia el hook de internacionalización para acceder a las funciones de traducción.

  // Realiza el seguimiento de la visita a la página de reservas.
  useVisitedPageTracking("reservas");
  useVisitedPageTrackingGA("reservas");

  // Muestra el cargador mientras los mensajes están en proceso de carga.
  if (loadingMessages) {
    return <Loader />;
  }

  // Renderiza el componente con la estructura de la página de reservas.
  return (
    <div className="pageContainer">
      {/* Texto de la página de reservas, con mensajes internacionalizados */}
      <div>
        <p className="ti-20p">{intl.formatMessage({ id: "reservas_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "reservas_Texto2" })}</p>
      </div>
      {/* Sección de localización para las distintas ubicaciones */}
      <div className="mt-25p">
        <Localization localizationName="san-bernardo" />
        <Localization localizationName="bravo-murillo" />
        <Localization localizationName="reina-victoria" />
        <Localization localizationName="arenal" />
      </div>
      {/* Botón para desplazarse hacia arriba */}
      <ScrollToTopButton /> {/* Usa el componente de scroll-to-top */}
    </div>
  );
};

// Define `pageTitleText` como una propiedad estática del componente `Reservas`.
ReservasPage.pageTitleText = "reservas";

export default ReservasPage; // Exporta el componente para que pueda ser utilizado en otras partes de la aplicación.
