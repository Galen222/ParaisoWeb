import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/bravo-murillo.module.css";

const BravoMurilloPage = () => {
  const intl = useIntl();

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "bravoMurilloTitulo" })}</h1>
      <p>{intl.formatMessage({ id: "bravoMurilloDescripcion" })}</p>
    </div>
  );
};

export default BravoMurilloPage;
