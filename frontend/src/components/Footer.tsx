import React from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import styles from "../styles/Footer.module.css";

const Footer: React.FC = () => {
  const intl = useIntl();

  return (
    <footer className={styles.footer}>
      <p>
        {intl.formatMessage({ id: "Footer_Rights" }, { year: new Date().getFullYear() })}
        {" | "}
        <Link href="/aviso-legal">
          <a className={styles.link}>{intl.formatMessage({ id: "Footer_AvisoLegal" })}</a>
        </Link>
        {" | "}
        <Link href="/politica-privacidad">
          <a className={styles.link}>{intl.formatMessage({ id: "Footer_PoliticaPrivacidad" })}</a>
        </Link>
      </p>
    </footer>
  );
};

export default Footer;
