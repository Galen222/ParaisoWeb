// components/Footer.tsx

import React from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMenu } from "../contexts/MenuContext";
import styles from "../styles/components/Footer.module.css";

/**
 * Componente de pie de página (Footer) que muestra enlaces a las políticas legales
 * y un texto de derechos de autor./**
 * Este componente incluye enlaces a las secciones de aviso legal, política de privacidad
 * y política de cookies. Los enlaces están internacionalizados y se adaptan a la
 * resolución de la pantalla.
 *
 * @returns {JSX.Element} Elemento JSX que representa el pie de página.
 */
const Footer: React.FC = (): JSX.Element => {
  const intl = useIntl();
  const router = useRouter();
  const { closeMobileMenu } = useMenu();

  /**
   * Verifica si la pantalla es de tamaño pequeño (ancho menor o igual a 396 píxeles)
   */
  const isMobileSmallScreen = typeof window !== "undefined" ? window.innerWidth <= 396 : false;

  /**
   * Maneja el evento de click en un enlace.
   * Cierra el menú móvil al hacer clic en un enlace.
   */
  const handleLinkClick = () => {
    closeMobileMenu();
  };

  /**
   * Enlaces a las políticas legales, formateados e internacionalizados
   */
  const links = (
    <div>
      <Link href="/aviso-legal" locale={router.locale} className={styles.link} onClick={handleLinkClick}>
        {intl.formatMessage({ id: "Footer_AvisoLegal" })}
      </Link>
      {" | "}
      <Link href="/politica-privacidad" locale={router.locale} className={styles.link} onClick={handleLinkClick}>
        {intl.formatMessage({ id: "Footer_PoliticaPrivacidad" })}
      </Link>
      {isMobileSmallScreen ? <br /> : " | "}
      <Link href="/politica-cookies" locale={router.locale} className={styles.link} onClick={handleLinkClick}>
        {intl.formatMessage({ id: "Footer_PoliticaCookies" })}
      </Link>
    </div>
  );

  return (
    <footer className={styles.footer}>
      <div>
        <span className={styles.rightsText}>{intl.formatMessage({ id: "Footer_Rights" }, { year: new Date().getFullYear() })}</span>
        <span className={styles.separator}> | </span>
        <span className={styles.links}>{links}</span>
      </div>
    </footer>
  );
};

export default Footer;
