// components/Footer.tsx

/**
 * Componente Footer para mostrar enlaces relacionados con avisos legales y políticas,
 * así como un aviso de derechos de autor. Utiliza internacionalización para el contenido de texto dinámico.
 *
 * @returns {JSX.Element} El elemento de pie de página renderizado.
 */
import React from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMenu } from "../contexts/MenuContext";
import styles from "../styles/components/Footer.module.css";

const Footer: React.FC = (): JSX.Element => {
  // Hook para manejar la internacionalización y los mensajes traducidos
  const intl = useIntl();
  // Hook del enrutador para manejar el locale
  const router = useRouter();
  // Función del contexto de menú para cerrar el menú móvil
  const { closeMobileMenu } = useMenu();

  /**
   * Maneja el evento de clic en los enlaces para cerrar el menú móvil.
   */
  const handleLinkClick = () => {
    closeMobileMenu();
  };

  // Estructura JSX que contiene los enlaces de navegación a páginas de avisos legales y políticas
  const links = (
    <div className={styles.linksContainer}>
      <Link href="/aviso-legal" locale={router.locale} className={styles.link} onClick={handleLinkClick}>
        {intl.formatMessage({ id: "Footer_AvisoLegal" })}
      </Link>
      <span className={styles.separator}> | </span>
      <Link href="/politica-privacidad" locale={router.locale} className={styles.link} onClick={handleLinkClick}>
        {intl.formatMessage({ id: "Footer_PoliticaPrivacidad" })}
      </Link>
      <span className={styles.separator}> | </span>
      <Link href="/politica-cookies" locale={router.locale} className={styles.link} onClick={handleLinkClick}>
        {intl.formatMessage({ id: "Footer_PoliticaCookies" })}
      </Link>
    </div>
  );

  return (
    <footer className={styles.footer}>
      <div>
        <span className={styles.rightsText}>{intl.formatMessage({ id: "Footer_Rights" }, { year: new Date().getFullYear() })}</span>
        <span className={styles.mainSeparator}> | </span>
        <span className={styles.links}>{links}</span>
      </div>
    </footer>
  );
};

export default Footer;
