import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/index.module.css";

export default function Home() {
  const intl = useIntl();

  return (
    <div className={styles.container}>
      <h1>{intl.formatMessage({ id: "inicioTitulo" })}</h1>
      <p>{intl.formatMessage({ id: "inicioDescripcion" })}</p>
    </div>
  );
}
