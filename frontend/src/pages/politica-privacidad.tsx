import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import styles from "../styles/politica-privacidad.module.css";

const PoliticaPrivacidadPage = () => {
  const intl = useIntl();
  useVisitedPageTracking("politica-privacidad");

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "politicaPrivacidad_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "politicaPrivacidad_Descripcion" })}</p>
    </div>
  );
};

export default PoliticaPrivacidadPage;
