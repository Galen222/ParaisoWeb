// pages/arenal.tsx

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
import styles from "../styles/arenal.module.css";
import type { ComponentType } from "react";

interface ArenalPageProps {
  loadingMessages: boolean;
  mapLocale: string;
}

// Define el tipo del componente para incluir `pageTitleText`
type ArenalPageComponent = ComponentType<ArenalPageProps> & { pageTitleText?: string };

const ArenalPage: ArenalPageComponent = ({ loadingMessages, mapLocale }) => {
  let restaurante = "arenal";
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
      <div>{intl.formatMessage({ id: "arenal_Texto" })}</div>
      <div className="mt-25p">
        <Localization localizationName="arenal" />
      </div>
      <div className="mt-25p">
        <Carousel carouselType="arenal" />
      </div>
      <div className="mt-25p">
        <Transport transportName="arenal" />
      </div>
      <div className="mt-25p">
        <Map locationKey={locationKey} mapLocale={mapLocale} />
      </div>
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

// Define `pageTitleText` como una propiedad estática del componente `ArenalPage`
ArenalPage.pageTitleText = "arenal";

export default ArenalPage;
