import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/arenal.module.css";

const ArenalPage = () => {
  const intl = useIntl();

  return (
    <div className={styles.container}>
      <h1>{intl.formatMessage({ id: "arenalTitulo" })}</h1>
      <p>{intl.formatMessage({ id: "arenalDescripcion" })}</p>
    </div>
  );
};

export default ArenalPage;
