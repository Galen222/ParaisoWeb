// pages/san-bernardo.tsx

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
import styles from "../styles/san-bernardo.module.css";
import type { ComponentType } from "react";

/**
 * Interfaz para las propiedades del componente de la página San Bernardo.
 */
interface SanBernardoPageProps {
  loadingMessages: boolean; // Indica si los mensajes están cargando.
  mapLocale: string; // Locale para el mapa a mostrar.
}

/**
 * Tipo del componente que incluye `pageTitleText` como propiedad estática.
 */
type SanBernardoPageComponent = ComponentType<SanBernardoPageProps> & { pageTitleText?: string };

/**
 * Componente que representa la página San Bernardo.
 *
 * @param {SanBernardoPageProps} props - Las propiedades del componente.
 * @param {boolean} props.loadingMessages - Estado de carga de los mensajes.
 * @param {string} props.mapLocale - Locale para el mapa a mostrar.
 * @returns {JSX.Element} El componente de la página San Bernardo.
 */
const SanBernardoPage: SanBernardoPageComponent = ({ loadingMessages, mapLocale }) => {
  /**
   * Nombre del restaurante para su uso en tracking y otros componentes.
   */
  let restaurante = "san-bernardo";

  const intl = useIntl(); // Hook para la internacionalización.
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop(); // Hook para controlar el botón de desplazamiento.

  // Seguimiento de la visita a la página "san-bernardo".
  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  /**
   * Clave de localización para el componente de mapa.
   */
  const locationKey = restaurante;

  // Muestra el cargador mientras los mensajes están en proceso de carga.
  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      {/* Texto descriptivo del restaurante San Bernardo */}
      <div>{intl.formatMessage({ id: "san-bernardo_Texto" })}</div>

      {/* Sección de localización del restaurante */}
      <div className="mt-25p">
        <Localization localizationName="san-bernardo" />
      </div>

      {/* Carrusel de imágenes del restaurante */}
      <div className="mt-25p">
        <Carousel carouselType="san-bernardo" />
      </div>

      {/* Sección de transporte cercano al restaurante */}
      <div className="mt-25p">
        <Transport transportName="san-bernardo" />
      </div>

      {/* Mapa de ubicación del restaurante */}
      <div className="mt-25p">
        <Map locationKey={locationKey} mapLocale={mapLocale} />
      </div>

      {/* Botón para desplazarse hacia arriba, visible según el estado de scroll */}
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

// Define `pageTitleText` como una propiedad estática del componente `SanBernardoPage`
SanBernardoPage.pageTitleText = "san-bernardo";

export default SanBernardoPage;
