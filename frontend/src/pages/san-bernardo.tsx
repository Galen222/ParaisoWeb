import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import AnimatedTitle from "../components/AnimatedTitle";
import Map from "../components/Map";
import styles from "../styles/san-bernardo.module.css";

interface SanBernardoProps {
  cookiesModalClosed: boolean;
  loadingMessages: boolean;
  mapLocale: string;
}

const SanBernardo = ({ loadingMessages, mapLocale, cookiesModalClosed }: SanBernardoProps) => {
  let restaurante = "san-bernardo";
  const intl = useIntl();

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const locationKey = restaurante;

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <AnimatedTitle text1Id="sanBernardo_Titulo_Texto1" text2Id="sanBernardo_Titulo_Texto2" cookiesModalClosed={cookiesModalClosed} />
      <p>{intl.formatMessage({ id: "sanBernardo_Descripcion" })}</p>
      <Map locationKey={locationKey} mapLocale={mapLocale} />
    </div>
  );
};

export default SanBernardo;
