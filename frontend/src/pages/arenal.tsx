import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para utilizar internacionalización
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import AnimatedTitle from "../components/AnimatedTitle";
import Map from "../components/Map";
import Carousel from "../components/Carousel";
import Localization from "../components/Localization";
import Transport from "../components/Transport";
import styles from "../styles/arenal.module.css"; // Importa los estilos CSS específicos para la página Arenal

interface ArenalPageProps {
  cookiesModalClosed: boolean;
  loadingMessages: boolean;
  mapLocale: string;
}

// Define el componente funcional ArenalPage utilizando una función flecha de ES6
const ArenalPage = ({ loadingMessages, mapLocale, cookiesModalClosed }: ArenalPageProps) => {
  let restaurante = "arenal";
  const intl = useIntl(); // Inicializa el hook de internacionalización para utilizar en este componente

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  const locationKey = restaurante;

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <div>
        <AnimatedTitle textName="arenal" cookiesModalClosed={cookiesModalClosed} />
      </div>
      <div>
        <Carousel carouselType="arenal" />
      </div>
      <br></br>
      <div>
        <Localization localizationName="arenal" />
      </div>
      <br></br>
      <div>
        <Transport transportName="arenal" />
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

export default ArenalPage; // Exporta ArenalPage para que pueda ser utilizado en otros componentes o páginas de la aplicación
