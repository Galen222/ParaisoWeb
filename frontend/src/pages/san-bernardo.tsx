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

interface SanBernardoPageProps {
  loadingMessages: boolean;
  mapLocale: string;
}

// Define el tipo de componente para incluir `pageTitleText`
type SanBernardoPageComponent = ComponentType<SanBernardoPageProps> & { pageTitleText?: string };

const SanBernardoPage: SanBernardoPageComponent = ({ loadingMessages, mapLocale }) => {
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
      <div className="mt-25p">
        <Localization localizationName="san-bernardo" />
      </div>
      <div className="mt-25p">
        <Carousel carouselType="san-bernardo" />
      </div>
      <div className="mt-25p">
        <Transport transportName="san-bernardo" />
      </div>
      <div className="mt-25p">
        <Map locationKey={locationKey} mapLocale={mapLocale} />
      </div>
      <div className="mb-25p">
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollTop">
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

// Define `pageTitleText` como una propiedad estática del componente `SanBernardo`
SanBernardoPage.pageTitleText = "san-bernardo";

export default SanBernardoPage;
