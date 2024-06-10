import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/about.module.css";

const AboutPage = () => {
  const intl = useIntl();

  return (
    <div className={styles.container}>
      <h1>{intl.formatMessage({ id: "aboutTitulo" })}</h1>
      <p>{intl.formatMessage({ id: "aboutDescripcion" })}</p>
    </div>
  );
};

export default AboutPage;
