import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/charcuteria.module.css";

const CharcuteriaPage = () => {
  const intl = useIntl();

  return (
    <div className={styles.container}>
      <h1>{intl.formatMessage({ id: "charcuteriaTitulo" })}</h1>
      <p>{intl.formatMessage({ id: "charcuteriaDescripcion" })}</p>
    </div>
  );
};

export default CharcuteriaPage;
