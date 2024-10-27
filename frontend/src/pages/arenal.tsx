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

// Define el tipo del componente para incluir `pageTitletext`
type ArenalComponent = ComponentType<ArenalPageProps> & { pageTitletext?: string };

const ArenalPage: ArenalComponent = ({ loadingMessages, mapLocale }) => {
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
      <br></br>
      <div>
        <Localization localizationName="arenal" />
      </div>
      <br></br>
      <div>
        <Carousel carouselType="arenal" />
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

// Define `pageTitletext` como una propiedad estática del componente `ArenalPage`
ArenalPage.pageTitletext = "arenal";

export default ArenalPage;
