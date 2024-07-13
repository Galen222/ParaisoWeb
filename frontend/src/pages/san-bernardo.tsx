import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import Map from "../components/Map";
import styles from "../styles/san-bernardo.module.css";

const SanBernardo = () => {
  let restaurante = "san-bernardo";
  const intl = useIntl();
  const [loading, setLoading] = useState(true);

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const locationKey = restaurante;

  useEffect(() => {
    if (intl) {
      setLoading(false);
    }
  }, [intl]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "sanBernardo_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "sanBernardo_Descripcion" })}</p>
      <Map locationKey={locationKey} />
    </div>
  );
};

export default SanBernardo;
