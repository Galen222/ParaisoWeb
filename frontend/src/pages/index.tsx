// pages/index.tsx

import React from "react";
import type { ComponentType } from "react";
import Loader from "../components/Loader";
import Carousel from "../components/Carousel";
import Banner from "../components/Banner";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import useScrollToTop from "../hooks/useScrollToTop";
import styles from "../styles/pages/index.module.css";

/**
 * Propiedades para el componente `Home`.
 * @property {boolean} loadingMessages - Estado de carga de los mensajes de internacionalización.
 */
interface HomeProps {
  loadingMessages: boolean;
}

/**
 * Componente de la página principal de la aplicación.
 * Incluye un título, texto de bienvenida, un carousel de imágenes y varios banners para distintas secciones.
 * Realiza seguimiento de la visita a la página y muestra un botón para volver al inicio al hacer scroll.
 *
 * @param {HomeProps} props - Propiedades del componente `Home`.
 * @returns {JSX.Element} - Página de inicio.
 */
const Home: ComponentType<HomeProps> & { pageTitleText?: string } = ({ loadingMessages }) => {
  const intl = useIntl(); // Hook de internacionalización
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop(); // Hook para manejar el botón de scroll

  // Seguimiento de la visita a la página "Inicio" para analítica
  useVisitedPageTracking("inicio");
  useVisitedPageTrackingGA("inicio");

  // Muestra el loader si los mensajes están en proceso de carga
  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      {/* Título de bienvenida */}
      <div>
        <h1 className="text-center">{intl.formatMessage({ id: "inicio_Titulo1" })}</h1>
      </div>

      {/* Texto descriptivo */}
      <div className="mt-25p">
        <p className="ti-20p">{intl.formatMessage({ id: "inicio_Texto1" })}</p>
      </div>

      {/* Carousel de imágenes principal */}
      <div>
        <Carousel carouselType="inicio" />
      </div>

      {/* Banners para las distintas secciones */}
      <Banner bannerType="restaurantes" />
      <Banner bannerType="gastronomia" />
      <Banner bannerType="charcuteria" />
      <Banner bannerType="nosotros" />
      <Banner bannerType="empleo" />

      {/* Botón para desplazarse hacia arriba */}
      <div>
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollToTop">
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

// Asigna `pageTitleText` como propiedad estática de `Home`
Home.pageTitleText = "inicio";

export default Home; // Exporta el componente para su uso en la aplicación
