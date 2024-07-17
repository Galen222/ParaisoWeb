import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import Map from "../components/Map";
import styles from "../styles/san-bernardo.module.css";

interface SanBernardoProps {
  loadingMessages: boolean; // Nuevo prop para el estado de carga
}

const SanBernardo = ({ loadingMessages }: SanBernardoProps) => {
  let restaurante = "san-bernardo";
  const intl = useIntl();

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const locationKey = restaurante;

  if (loadingMessages) {
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
