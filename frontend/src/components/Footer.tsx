import React from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
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
 * Cierra el menú móvil cuando se hace clic en los enlaces.
 *
 * @param {FooterProps} props - Propiedades del componente Footer.
 * @returns {JSX.Element} Pie de página con enlaces y loader opcional.
 */
const Footer: React.FC<FooterProps> = ({ loadingMessages }: FooterProps): JSX.Element => {
  const intl = useIntl(); // Hook para obtener mensajes localizados
  const { closeMobileMenu } = useMenu(); // Cierra el menú móvil si está abierto
  const locale = intl.locale; // Idioma actual

  // Verifica si el idioma actual es alemán
  const isGerman = locale === "de";
  console.log("idioma aleman: ", isGerman);

  /**
   * Función para manejar el clic en los enlaces.
   * Cierra el menú al hacer clic en cualquier enlace.
   */
  const handleLinkClick = () => {
    closeMobileMenu();
  };

  // Enlaces de las políticas legales
  const links = (
    <>
      <Link href="/aviso-legal" className={styles.link} onClick={handleLinkClick}>
        {intl.formatMessage({ id: "Footer_AvisoLegal" })}
      </Link>
      {isGerman ? <br /> : " | "}
      {/* Si el idioma es alemán, muestra la política de privacidad y política de cookies en una nueva línea */}
      <Link href="/politica-privacidad" className={styles.link} onClick={handleLinkClick}>
        {intl.formatMessage({ id: "Footer_PoliticaPrivacidad" })}
      </Link>
      {" | "}
      <Link href="/politica-cookies" className={`${styles.link} ${isGerman ? styles.cookieLinkGerman : ""}`} onClick={handleLinkClick}>
        {intl.formatMessage({ id: "Footer_PoliticaCookies" })}
      </Link>
    </>
  );

  // Muestra un loader mientras los mensajes están cargando
  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <footer className={styles.footer}>
      <div>
        {/* Si el idioma es alemán, se aplica una clase especial al contenedor de texto */}
        <p>
          <span className={styles.rightsText}>{intl.formatMessage({ id: "Footer_Rights" }, { year: new Date().getFullYear() })}</span>
          <span className={styles.separator}> | </span>
          <span className={styles.links}>{links}</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
