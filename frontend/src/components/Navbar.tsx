import React, { useState } from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import styles from "../styles/Navbar.module.css";

interface NavbarProps {
  onLocaleChange: (locale: string) => void;
  currentLocale: string;
}

const Navbar: React.FC<NavbarProps> = ({ onLocaleChange, currentLocale }) => {
  const intl = useIntl();
  const [showRestaurants, setShowRestaurants] = useState(false); // Estado para controlar la visibilidad del menú desplegable
  const [mobileMenu, setMobileMenu] = useState(false); // Estado para controlar la apertura del menú

  const toggleMobileMenu = () => setMobileMenu(!mobileMenu); // Función para alternar el estado del menú de movil

  return (
    <div className={styles.navbar}>
      <div className={styles.navbarTop}>
        <div className={styles.imgLogoContainer}>
          <Link href="/">
            <img src="/images/navbar/imagenLogo.png" alt="Logo Paraiso Del Jamón" className={styles.imgLogo} />
          </Link>
        </div>
        <div className={styles.textLogoContainer}>
          <img src="/images/navbar/textoLogo.png" alt="Paraíso del Jamón" className={styles.textLogo} />
        </div>
        <div className={styles.flagContainer}>
          <div className={styles.mobileMenuIcon} onClick={toggleMobileMenu}>
            {mobileMenu ? "X" : "☰"} {/* Cambia entre X y el icono de menú */}
          </div>
          <div className={styles.flags}>
            <img src="/images/flags/es.png" alt="Español" className={styles.flag} onClick={() => onLocaleChange("es")} />
            <img src="/images/flags/en.png" alt="English" className={styles.flag} onClick={() => onLocaleChange("en")} />
            <img src="/images/flags/de.png" alt="Deutsch" className={styles.flag} onClick={() => onLocaleChange("de")} />
          </div>
        </div>
      </div>
      <div className={styles.navbarMenu}>
        <div className={styles.links}>
          <Link href="/">{intl.formatMessage({ id: "Navbar_inicio" })}</Link>
          <div className={styles.linksDropdown} onMouseEnter={() => setShowRestaurants(true)} onMouseLeave={() => setShowRestaurants(false)}>
            <span className={styles.noLink}>{intl.formatMessage({ id: "Navbar_restaurantes" })}</span>
            <div className={`${styles.dropdown} ${showRestaurants ? styles.show : ""}`}>
              <Link href="/san-bernardo">San Bernardo</Link>
              <Link href="/bravo-murillo">Bravo Murillo</Link>
              <Link href="/reina-victoria">Reina Victoria</Link>
              <Link href="/arenal">Arenal</Link>
            </div>
          </div>
          <Link href="/reservas">{intl.formatMessage({ id: "Navbar_reservas" })}</Link>
          <Link href="/menu">{intl.formatMessage({ id: "Navbar_menu" })}</Link>
          <Link href="/carta">{intl.formatMessage({ id: "Navbar_carta" })}</Link>
          <Link href="/charcuteria">{intl.formatMessage({ id: "Navbar_charcuteria" })}</Link>
          <Link href="/about">{intl.formatMessage({ id: "Navbar_about" })}</Link>
          <Link href="/blog">{intl.formatMessage({ id: "Navbar_blog" })}</Link>
          <Link href="/contacto">{intl.formatMessage({ id: "Navbar_contacto" })}</Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
