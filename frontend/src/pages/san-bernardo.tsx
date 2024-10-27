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

interface SanBernardoProps {
  loadingMessages: boolean;
  mapLocale: string;
}

// Define el tipo de componente para incluir `pageTitletext`
type SanBernardoComponent = ComponentType<SanBernardoProps> & { pageTitletext?: string };

const SanBernardo: SanBernardoComponent = ({ loadingMessages, mapLocale }) => {
  let restaurante = "san-bernardo";
  const intl = useIntl();
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const locationKey = restaurante;

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <div>{intl.formatMessage({ id: "san-bernardo_Texto" })}</div>
      <br></br>
      <div>
        <Localization localizationName="san-bernardo" />
      </div>
      <br></br>
      <div>
        <Carousel carouselType="san-bernardo" />
      </div>
      <br></br>
      <div>
        <Transport transportName="san-bernardo" />
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

// Define `pageTitletext` como una propiedad estática del componente `SanBernardo`
SanBernardo.pageTitletext = "san-bernardo";

export default SanBernardo;
