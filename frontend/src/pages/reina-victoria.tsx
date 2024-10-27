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

interface ReinaVictoriaPageProps {
  loadingMessages: boolean;
  mapLocale: string;
}

// Define el tipo del componente para incluir `pageTitleText`
type ReinaVictoriaPageComponent = ComponentType<ReinaVictoriaPageProps> & { pageTitleText?: string };

const ReinaVictoriaPage: ReinaVictoriaPageComponent = ({ loadingMessages, mapLocale }) => {
  let restaurante = "reina-victoria";
  const intl = useIntl();

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();
  const locationKey = restaurante;

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <div>{intl.formatMessage({ id: "reina-victoria_Texto" })}</div>
      <br></br>
      <div>
        <Localization localizationName="reina-victoria" />
      </div>
      <br></br>
      <div>
        <Carousel carouselType="reina-victoria" />
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

// Define `pageTitleText` como una propiedad estática del componente `ReinaVictoriaPage`
ReinaVictoriaPage.pageTitleText = "reina-victoria";

export default ReinaVictoriaPage;
