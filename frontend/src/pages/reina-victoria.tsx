// pages/reina-victoria.tsx

import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import Map from "../components/Map";
import Carousel from "../components/Carousel";
import Localization from "../components/Localization";
import Transport from "../components/Transport";
import styles from "../styles/reina-victoria.module.css";
import type { ComponentType } from "react";

/**
 * Interfaz para las propiedades de la página Reina Victoria.
 */
interface ReinaVictoriaPageProps {
  loadingMessages: boolean;
  mapLocale: string;
}

/**
 * Tipo del componente para incluir `pageTitleText` como una propiedad estática.
 */
type ReinaVictoriaPageComponent = ComponentType<ReinaVictoriaPageProps> & { pageTitleText?: string };

/**
 * Componente que representa la página Reina Victoria.
 *
 * @param {ReinaVictoriaPageProps} props - Las propiedades del componente.
 * @param {boolean} props.loadingMessages - Indica si los mensajes están cargando.
 * @param {string} props.mapLocale - Locale para el mapa a mostrar.
 * @returns {JSX.Element} El componente de la página Reina Victoria.
 */
const ReinaVictoriaPage: ReinaVictoriaPageComponent = ({ loadingMessages, mapLocale }) => {
  /**
   * Nombre del restaurante para su uso en tracking y otros componentes.
   */
  let restaurante = "reina-victoria";

  const intl = useIntl();

  // Seguimiento de la visita a la página "reina-victoria".
  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  /**
   * Hooks para manejar la visibilidad del botón de scroll y la acción de desplazarse hacia arriba.
   */
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  /**
   * Clave de localización para el componente de mapa.
   */
  const locationKey = restaurante;

  /**
   * Muestra el cargador mientras se están cargando los mensajes.
   */
  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      {/* Texto descriptivo del restaurante Reina Victoria */}
      <div>{intl.formatMessage({ id: "reina-victoria_Texto" })}</div>

      {/* Sección de localización del restaurante */}
      <div className="mt-25p">
        <Localization localizationName="reina-victoria" />
      </div>

      {/* Carrusel de imágenes del restaurante */}
      <div className="mt-25p">
        <Carousel carouselType="reina-victoria" />
      </div>

      {/* Sección de transporte cercano al restaurante */}
      <div className="mt-25p">
        <Transport transportName="reina-victoria" />
      </div>

      {/* Mapa de ubicación del restaurante */}
      <div className="mt-25p">
        <Map locationKey={locationKey} mapLocale={mapLocale} />
      </div>

      {/* Botón para desplazarse hacia arriba cuando es visible */}
      <div>
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollTop">
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

// Define `pageTitleText` como una propiedad estática del componente `ReinaVictoriaPage`
ReinaVictoriaPage.pageTitleText = "reina-victoria";

export default ReinaVictoriaPage;
