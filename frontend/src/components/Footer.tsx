import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import useDeviceType from "../hooks/useDeviceType";
import { useMobileMenu } from "../contexts/MobileMenuContext";
import Loader from "../components/Loader";
import styles from "../styles/Footer.module.css";

const Footer: React.FC = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(true);

  const deviceType = useDeviceType();
  const { closeMobileMenu } = useMobileMenu();

  const isMobile = deviceType === "mobile";

  // Función para cerrar el menú móvil al hacer clic en los enlaces, si está en móvil
  const handleLinkClick = () => {
    if (isMobile) {
      closeMobileMenu();
    }
  };

  // Simular un retraso para el Loader, similar al Navbar
  useEffect(() => {
    if (intl) {
      setLoading(false);
    }
  }, [intl]);

  const links = (
    <>
      <Link href="/aviso-legal" className={styles.link} onClick={handleLinkClick}>
        {intl.formatMessage({ id: "Footer_AvisoLegal" })}
      </Link>
      {" | "}
      <Link href="/politica-privacidad" className={styles.link} onClick={handleLinkClick}>
        {intl.formatMessage({ id: "Footer_PoliticaPrivacidad" })}
      </Link>
      {" | "}
      <Link href="/politica-cookies" className={styles.link} onClick={handleLinkClick}>
        {intl.formatMessage({ id: "Footer_PoliticaCookies" })}
      </Link>
    </>
  );

  return (
    <footer className={styles.footer}>
      {loading ? (
        <div>
          <Loader className={styles.footerLoader} />
        </div>
      ) : (
        <div>
          <p>
            {intl.formatMessage({ id: "Footer_Rights" }, { year: new Date().getFullYear() })}
            {!isMobile && " | "}
            {!isMobile && links}
          </p>
          {isMobile && <p>{links}</p>}
        </div>
      )}
    </footer>
  );
};

export default Footer;
