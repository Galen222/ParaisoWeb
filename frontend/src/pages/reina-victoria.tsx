import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para internacionalización.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import AnimatedTitle from "../components/AnimatedTitle";
import Map from "../components/Map";
import Carousel from "../components/Carousel";
import Localization from "../components/Localization";
import Transport from "../components/Transport";
import styles from "../styles/reina-victoria.module.css"; // Importa los estilos CSS específicos para la página Reina Victoria.

interface ReinaVictoriaPageProps {
  cookiesModalClosed: boolean;
  loadingMessages: boolean;
  mapLocale: string;
}

// Define el componente funcional ReinaVictoriaPage utilizando una función flecha.
const ReinaVictoriaPage = ({ loadingMessages, mapLocale, cookiesModalClosed }: ReinaVictoriaPageProps) => {
  let restaurante = "reina-victoria";
  const intl = useIntl(); // Inicializa el hook de internacionalización para usarlo en este componente.

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  const locationKey = restaurante;

  if (loadingMessages) {
    return <Loader />;
  }

  // Devuelve el JSX que construye la interfaz de usuario de la página.
  return (
    <div className="pageContainer">
      <div>
        <AnimatedTitle textName="reina-victoria" cookiesModalClosed={cookiesModalClosed} />
      </div>
      <div>
        <Carousel carouselType="reina-victoria" />
      </div>
      <br></br>
      <div>
        <Localization localizationName="reina-victoria" />
      </div>
      <br></br>
      <div>
        <Transport transportName="reina-victoria" />
      </div>
      <br></br>
      <div>
        <Map locationKey={locationKey} mapLocale={mapLocale} />
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

export default ReinaVictoriaPage; // Exporta ReinaVictoriaPage para que pueda ser utilizado en otros lugares de la aplicación.
