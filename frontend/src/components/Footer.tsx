import React from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import useDeviceType from "../hooks/useDeviceType";
import styles from "../styles/Footer.module.css";

const Footer: React.FC = () => {
  const intl = useIntl();
  const deviceType = useDeviceType(); // Ahora deviceType es 'pc', 'tablet' o 'mobile'
  const isMobile = deviceType === "mobile"; // Determina si el dispositivo es móvil

  // Contenido de los enlaces
  const links = (
    <>
      <Link href="/aviso-legal" className={styles.link}>
        {intl.formatMessage({ id: "Footer_AvisoLegal" })}
      </Link>
      {" | "}
      <Link href="/politica-privacidad" className={styles.link}>
        {intl.formatMessage({ id: "Footer_PoliticaPrivacidad" })}
      </Link>
      {" | "}
      <Link href="/politica-cookies" className={styles.link}>
        {intl.formatMessage({ id: "Footer_PoliticaCookies" })}
      </Link>
    </>
  );

  return (
    <footer className={styles.footer}>
      <div>
        <p>
          {intl.formatMessage({ id: "Footer_Rights" }, { year: new Date().getFullYear() })}
          {!isMobile && " | "}
          {!isMobile && links}
        </p>
        {isMobile && <p>{links}</p>}
      </div>
    </footer>
  );
};

export default Footer;
