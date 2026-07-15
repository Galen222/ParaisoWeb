// components/Footer.tsx

/**
 * Componente Footer para mostrar enlaces relacionados con avisos legales y políticas,
 * así como un aviso de derechos de autor. Utiliza internacionalización para el contenido de texto dinámico.
 *
 * @returns {React.JSX.Element} El elemento de pie de página renderizado.
 */
import React, { useSyncExternalStore } from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMenu } from "../contexts/MenuContext";
import styles from "../styles/components/Footer.module.css";

const subscribeToCurrentYear = (): (() => void) => () => undefined;
const getCurrentYear = (): string => new Date().getFullYear().toString();
const getServerCurrentYear = (): string => "";

const Footer: React.FC = (): React.JSX.Element => {
  // Hook para manejar la internacionalización y los mensajes traducidos
  const intl = useIntl();
  // Hook del enrutador para manejar el locale
  const router = useRouter();
  // Función del contexto de menú para cerrar el menú móvil
  const { closeMobileMenu } = useMenu();
  // El servidor y el primer render del navegador deben producir el mismo texto.
  // El año local se completa después del montaje para no provocar una diferencia
  // de hidratación cuando la petición cruza el cambio de año o usa otra zona horaria.
  const currentYear = useSyncExternalStore(
    subscribeToCurrentYear,
    getCurrentYear,
    getServerCurrentYear
  );

  /**
   * Maneja el evento de clic en los enlaces para cerrar el menú móvil.
   */
  const handleLinkClick = () => {
    closeMobileMenu();
  };

  // Estructura JSX que contiene los enlaces de navegación a páginas de avisos legales y políticas
  const links = (
    <span className={styles.linksContainer}>
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
    </span>
  );

  return (
    <footer className={styles.footer}>
      <div>
        <span className={styles.rightsText}>
          {intl.formatMessage({ id: "Footer_Rights" }, { year: currentYear })}
        </span>
        <span className={styles.mainSeparator}> | </span>
        <span className={styles.links}>{links}</span>
      </div>
    </footer>
  );
};

export default Footer;
