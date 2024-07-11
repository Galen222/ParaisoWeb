import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Map from "../components/Map";
import styles from "../styles/san-bernardo.module.css";

const SanBernardo = () => {
  const intl = useIntl();
  useVisitedPageTracking("san-bernardo");
  useVisitedPageTrackingGA("san-bernardo");

  const locationKey = "san-bernardo";

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "sanBernardo_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "sanBernardo_Descripcion" })}</p>
      <Map locationKey={locationKey} />
    </div>
  );
};

export default SanBernardo;
