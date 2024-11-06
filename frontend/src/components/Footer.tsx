// components/Footer.tsx

import React from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import useDeviceType from "../hooks/useDeviceType";
import { useMenu } from "../contexts/MenuContext";
import Loader from "../components/Loader";
import styles from "../styles/components/Footer.module.css";

/**
 * Propiedades para el componente Footer.
 * @property {boolean} loadingMessages - Indica si los mensajes se están cargando, mostrando un loader en su lugar.
 */
export interface FooterProps {
  loadingMessages: boolean;
}

/**
 * Componente Footer
 *
 * Muestra el pie de página con enlaces a páginas de políticas y un mensaje de derechos reservados.
 * Detecta si el dispositivo es móvil para ajustar el diseño y cierra el menú móvil cuando se hace clic en los enlaces.
 *
 * @param {FooterProps} props - Propiedades del componente Footer.
 * @returns {JSX.Element} Pie de página con enlaces y loader opcional.
 */
const Footer: React.FC<FooterProps> = ({ loadingMessages }) => {
  const intl = useIntl(); // Hook para obtener mensajes localizados

  const deviceType = useDeviceType(); // Detecta el tipo de dispositivo
  const { closeMobileMenu } = useMenu(); // Cierra el menú móvil si está abierto

  const isMobile = deviceType === "mobile"; // Determina si el dispositivo es móvil

  /**
   * Función para manejar el clic en los enlaces.
   * Si el dispositivo es móvil, cierra el menú al hacer clic en cualquier enlace.
   */
  const handleLinkClick = () => {
    if (isMobile) {
      closeMobileMenu();
    }
  };

  // Enlaces de las políticas legales
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

  if (loadingMessages) {
    return <Loader />; // Muestra un loader mientras los mensajes están cargando
  }

  return (
    <footer className={styles.footer}>
      <div>
        <p>
          {/* Muestra los derechos reservados y el año actual */}
          {intl.formatMessage({ id: "Footer_Rights" }, { year: new Date().getFullYear() })}
          {!isMobile && " | "}
          {/* Muestra los enlaces solo si no es móvil */}
          {!isMobile && links}
        </p>
        {/* Muestra los enlaces en una nueva línea si es móvil */}
        {isMobile && <p>{links}</p>}
      </div>
    </footer>
  );
};

export default Footer;
