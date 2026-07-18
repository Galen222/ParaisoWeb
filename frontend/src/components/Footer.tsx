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

const subscribeToCurrentYear = (onStoreChange: () => void): (() => void) => {
  let timeoutId: number | null = null;

  const scheduleNextMidnight = (): void => {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    timeoutId = window.setTimeout(() => {
      onStoreChange();
      scheduleNextMidnight();
    }, Math.max(1, nextMidnight.getTime() - now.getTime() + 1000));
  };

  scheduleNextMidnight();
  return () => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
  };
};

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
  // La suscripción se invalida cada medianoche para que una pestaña abierta durante
  // Nochevieja muestre el año nuevo sin obligar al usuario a recargar la página.
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

  /** Identifica el enlace legal que corresponde a la página actual. */
  const getCurrentPageAria = (href: string): "page" | undefined =>
    router.pathname === href ? "page" : undefined;

  // Estructura JSX que contiene los enlaces de navegación a páginas de avisos legales y políticas
  const links = (
    <span className={styles.linksContainer}>
      <Link
        href="/aviso-legal"
        locale={router.locale}
        className={styles.link}
        onClick={handleLinkClick}
        aria-current={getCurrentPageAria("/aviso-legal")}
      >
        {intl.formatMessage({ id: "Footer_AvisoLegal" })}
      </Link>
      <span className={styles.separator}> | </span>
      <Link
        href="/politica-privacidad"
        locale={router.locale}
        className={styles.link}
        onClick={handleLinkClick}
        aria-current={getCurrentPageAria("/politica-privacidad")}
      >
        {intl.formatMessage({ id: "Footer_PoliticaPrivacidad" })}
      </Link>
      <span className={styles.separator}> | </span>
      <Link
        href="/politica-cookies"
        locale={router.locale}
        className={styles.link}
        onClick={handleLinkClick}
        aria-current={getCurrentPageAria("/politica-cookies")}
      >
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
