// pages/arenal.tsx

import React from "react";
import type { ComponentType } from "react";
import Loader from "../components/Loader";
import Map from "../components/Map";
import Carousel from "../components/Carousel";
import Localization from "../components/Localization";
import Transport from "../components/Transport";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";

/**
 * Propiedades para el componente `ArenalPage`.
 * @property {boolean} loadingMessages - Indica si los mensajes de la página están en proceso de carga.
 * @property {string} mapLocale - Idioma del mapa, usado en el componente `Map`.
 */
export interface ArenalPageProps {
  loadingMessages: boolean;
  mapLocale: string;
}

/**
 * Tipo de componente para `ArenalPage` que incluye una propiedad opcional `pageTitleText`.
 */
export type ArenalPageComponent = ComponentType<ArenalPageProps> & { pageTitleText?: string };

/**
 * Componente de la página del restaurante "Arenal".
 * Muestra información y elementos específicos de localización, como un mapa, carrusel y detalles de transporte.
 *
 * @param {ArenalPageProps} props - Propiedades para el componente `ArenalPage`.
 * @returns {JSX.Element} Página del restaurante "Arenal".
 */
const ArenalPage: ArenalPageComponent = ({ loadingMessages, mapLocale }: ArenalPageProps): JSX.Element => {
  const restaurante = "arenal"; // Nombre del restaurante
  const intl = useIntl(); // Hook para la internacionalización

  // Seguimiento de la visita a la página "Arenal" para análisis interno y Google Analytics
  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  // Muestra un loader si los mensajes están en proceso de carga
  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <div>{intl.formatMessage({ id: "arenal_Texto" })}</div> {/* Texto principal de la página */}
      <div className="mt-25p">
        <Localization localizationName="arenal" /> {/* Componente de localización específico para "Arenal" */}
      </div>
      <div className="mt-25p">
        <Carousel carouselType="arenal" /> {/* Carrusel de imágenes para el restaurante "Arenal" */}
      </div>
      <div className="mt-25p">
        <Transport transportName="arenal" /> {/* Componente de transporte con información sobre cómo llegar */}
      </div>
      <div className="mt-25p">
        <Map locationKey={restaurante} mapLocale={mapLocale} /> {/* Mapa del restaurante "Arenal" */}
      </div>
      <ScrollToTopButton /> {/* Usa el componente de scroll-to-top */}
    </div>
  );
};

// Define `pageTitleText` como una propiedad estática del componente `ArenalPage`
ArenalPage.pageTitleText = "arenal";

export default ArenalPage; // Exporta el componente para su uso en la aplicación
