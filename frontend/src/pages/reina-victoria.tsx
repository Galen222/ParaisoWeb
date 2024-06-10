import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/reina-victoria.module.css";

const ReinaVictoriaPage = () => {
  const intl = useIntl();

  return (
    <div className={styles.container}>
      <h1>{intl.formatMessage({ id: "reinaVictoriaTitulo" })}</h1>
      <p>{intl.formatMessage({ id: "reinaVictoriaDescripcion" })}</p>
    </div>
  );
};

export default ReinaVictoriaPage;
