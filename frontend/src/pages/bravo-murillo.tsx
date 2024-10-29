// pages/bravo-murillo.tsx

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
import styles from "../styles/bravo-murillo.module.css";
import type { ComponentType } from "react";

interface BravoMurilloPageProps {
  loadingMessages: boolean;
  mapLocale: string;
}

// Define el tipo del componente para incluir `pageTitleText`
type BravoMurilloPageComponent = ComponentType<BravoMurilloPageProps> & { pageTitleText?: string };

const BravoMurilloPage: BravoMurilloPageComponent = ({ loadingMessages, mapLocale }) => {
  let restaurante = "bravo-murillo";
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
      <div>{intl.formatMessage({ id: "bravo-murillo_Texto" })}</div>
      <div className="mt-25p">
        <Localization localizationName="bravo-murillo" />
      </div>
      <div className="mt-25p">
        <Carousel carouselType="bravo-murillo" />
      </div>
      <div className="mt-25p">
        <Transport transportName="bravo-murillo" />
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

// Define `pageTitleText` como una propiedad estática del componente `BravoMurilloPage`
BravoMurilloPage.pageTitleText = "bravo-murillo";

export default BravoMurilloPage;
