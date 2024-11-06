// pages/bravo-murillo.tsx

import React from "react";
import type { ComponentType } from "react";
import Loader from "../components/Loader";
import Map from "../components/Map";
import Carousel from "../components/Carousel";
import Localization from "../components/Localization";
import Transport from "../components/Transport";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import useScrollToTop from "../hooks/useScrollToTop";

/**
 * Propiedades para el componente `BravoMurilloPage`.
 * @property {boolean} loadingMessages - Indica si los mensajes están en proceso de carga.
 * @property {string} mapLocale - Idioma del mapa, usado en el componente `Map`.
 */
export interface BravoMurilloPageProps {
  loadingMessages: boolean;
  mapLocale: string;
}

/**
 * Tipo de componente para `BravoMurilloPage` que incluye una propiedad opcional `pageTitleText`.
 */
export type BravoMurilloPageComponent = ComponentType<BravoMurilloPageProps> & { pageTitleText?: string };

/**
 * Componente funcional para la página del restaurante "Bravo Murillo".
 * Muestra información detallada del restaurante, incluyendo un mapa, carrusel de imágenes,
 * opciones de transporte y localización.
 *
 * @param {BravoMurilloPageProps} props - Propiedades para el componente `BravoMurilloPage`.
 * @returns {JSX.Element} Página del restaurante "Bravo Murillo".
 */
const BravoMurilloPage: BravoMurilloPageComponent = ({ loadingMessages, mapLocale }) => {
  const restaurante = "bravo-murillo"; // Identificador del restaurante
  const intl = useIntl(); // Hook para la internacionalización
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop(); // Hook para el botón de desplazamiento hacia arriba

  // Seguimiento de la visita a la página "Bravo Murillo" para análisis interno y Google Analytics
  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const locationKey = restaurante; // Clave de localización para el mapa

  // Muestra un loader si los mensajes están en proceso de carga
  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <div>{intl.formatMessage({ id: "bravo-murillo_Texto" })}</div> {/* Texto descriptivo de la página */}
      <div className="mt-25p">
        <Localization localizationName="bravo-murillo" /> {/* Información de localización del restaurante */}
      </div>
      <div className="mt-25p">
        <Carousel carouselType="bravo-murillo" /> {/* Carrusel de imágenes del restaurante */}
      </div>
      <div className="mt-25p">
        <Transport transportName="bravo-murillo" /> {/* Opciones de transporte cercanas */}
      </div>
      <div className="mt-25p">
        <Map locationKey={locationKey} mapLocale={mapLocale} /> {/* Mapa de la ubicación del restaurante */}
      </div>
      <div>
        {/* Botón de desplazamiento hacia arriba */}
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollToTop">
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

// Define `pageTitleText` como una propiedad estática del componente `BravoMurilloPage`
BravoMurilloPage.pageTitleText = "bravo-murillo";

export default BravoMurilloPage; // Exporta el componente para su uso en la aplicación
