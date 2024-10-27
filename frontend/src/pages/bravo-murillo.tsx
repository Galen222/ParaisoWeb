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

// Define el tipo del componente para incluir `pageTitletext`
type BravoMurilloComponent = ComponentType<BravoMurilloPageProps> & { pageTitletext?: string };

const BravoMurilloPage: BravoMurilloComponent = ({ loadingMessages, mapLocale }) => {
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
      <br></br>
      <div>
        <Localization localizationName="bravo-murillo" />
      </div>
      <br></br>
      <div>
        <Carousel carouselType="bravo-murillo" />
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

// Define `pageTitletext` como una propiedad estática del componente `BravoMurilloPage`
BravoMurilloPage.pageTitletext = "bravo-murillo";

export default BravoMurilloPage;
