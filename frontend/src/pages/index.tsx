import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import styles from "../styles/index.module.css";

export default function Home() {
  const intl = useIntl(); // Utiliza el hook useIntl para internacionalización

  useVisitedPageTracking("inicio");
  useVisitedPageTrackingGA("inicio");

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "inicio_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "inicio_Descripcion" })}</p>
    </div>
  );
}
