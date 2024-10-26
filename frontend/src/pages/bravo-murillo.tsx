import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para la internacionalización de texto.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import AnimatedTitle from "../components/AnimatedTitle";
import Map from "../components/Map";
import Carousel from "../components/Carousel";
import Localization from "../components/Localization";
import Transport from "../components/Transport";
import styles from "../styles/bravo-murillo.module.css"; // Importa los estilos CSS específicos para esta página.

interface BravoMurilloPageProps {
  cookiesModalClosed: boolean;
  loadingMessages: boolean;
  mapLocale: string;
}

// Define el componente funcional BravoMurilloPage.
const BravoMurilloPage = ({ loadingMessages, mapLocale, cookiesModalClosed }: BravoMurilloPageProps) => {
  let restaurante = "bravo-murillo";
  const intl = useIntl(); // Utiliza el hook de internacionalización para obtener funciones de traducción.

  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const locationKey = restaurante;

  if (loadingMessages) {
    return <Loader />;
  }

  // Devuelve el JSX que construye la UI de la página.
  return (
    <div className="pageContainer">
      <div>
        <AnimatedTitle textName="bravo-murillo" cookiesModalClosed={cookiesModalClosed} />
      </div>
      <div>
        <Carousel carouselType="bravo-murillo" />
      </div>
      <br></br>
      <div>
        <Localization localizationName="bravo-murillo" />
      </div>
      <br></br>
      <div>
        <Transport transportName="bravo-murillo" />
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

export default BravoMurilloPage; // Exporta BravoMurilloPage para que pueda ser utilizado en otros lugares de la aplicación.
