import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/aviso-legal.module.css";

const AvisoLegalPage = () => {
  const intl = useIntl();

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "avisoLegal_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "avisoLegal_Descripcion" })}</p>
    </div>
  );
};

export default AvisoLegalPage;
