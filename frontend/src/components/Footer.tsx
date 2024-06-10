import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/Footer.module.css";

const Footer = () => {
  const intl = useIntl(); // Hook de react-intl para acceder a la API de internacionalización

  return (
    <footer className={styles.footer}>
      <p>{intl.formatMessage({ id: "footerText" })}</p>
      <p>{intl.formatMessage({ id: "footerRights" }, { year: new Date().getFullYear() })}</p>
    </footer>
  );
};

export default Footer;
