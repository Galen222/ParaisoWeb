import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/san-bernardo.module.css";

const SanBernardo = () => {
  const intl = useIntl();

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "sanBernardoTitulo" })}</h1>
      <p>{intl.formatMessage({ id: "sanBernardoDescripcion" })}</p>
    </div>
  );
};

export default SanBernardo;
