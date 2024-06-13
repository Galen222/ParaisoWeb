import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/politica-privacidad.module.css";

const PoliticaPrivacidadPage = () => {
  const intl = useIntl();

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "politicaPrivacidad_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "politicaPrivacidad_Descripcion" })}</p>
    </div>
  );
};

export default PoliticaPrivacidadPage;
