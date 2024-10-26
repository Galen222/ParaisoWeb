import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import AnimatedTitle from "../components/AnimatedTitle";
import Map from "../components/Map";
import Carousel from "../components/Carousel";
import Localization from "../components/Localization";
import Transport from "../components/Transport";
import styles from "../styles/san-bernardo.module.css";

interface SanBernardoProps {
  cookiesModalClosed: boolean;
  loadingMessages: boolean;
  mapLocale: string;
}

const SanBernardo = ({ loadingMessages, mapLocale, cookiesModalClosed }: SanBernardoProps) => {
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
      <div>
        <AnimatedTitle textName="san-bernardo" cookiesModalClosed={cookiesModalClosed} />
      </div>
      <div>
        <Carousel carouselType="san-bernardo" />
      </div>
      <br></br>
      <div>
        <Localization localizationName="san-bernardo" />
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

export default SanBernardo;
