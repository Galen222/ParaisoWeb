import React, { useState } from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import useDeviceType from "../hooks/useDeviceType";
import styles from "../styles/Navbar.module.css";

interface NavbarProps {
  onLocaleChange: (locale: string) => void;
  currentLocale: string;
}

const Navbar: React.FC<NavbarProps> = ({ onLocaleChange, currentLocale }) => {
  const intl = useIntl();
  const deviceType = useDeviceType(); // deviceType es 'pc', 'tablet' o 'mobile'
  const [showRestaurants, setShowRestaurants] = useState(false); // Estado para controlar la visibilidad del menú desplegable
  const [mobileMenu, setMobileMenu] = useState(false); // Estado para controlar la apertura del menú

  const toggleMobileMenu = () => setMobileMenu(!mobileMenu); // Función para alternar el estado del menú de móvil
  const closeMobileMenu = () => {
    if (mobileMenu) {
      setMobileMenu(false);
    }
  };

  const isMobile = deviceType === "mobile"; // Determina si el dispositivo es móvil

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarTop}>
        <div className={styles.imgLogoContainer}>
          <Link href="/" onClick={closeMobileMenu}>
            <img src="/images/navbar/imagenLogo.png" alt="Logo Paraíso Del Jamón" className={styles.imgLogo} />
          </Link>
        </div>
        <div className={styles.textLogoContainer}>
          <img src="/images/navbar/textoLogo.png" alt="Paraíso del Jamón" className={styles.textLogo} />
        </div>
        <div className={styles.flagContainer}>
          <div className={styles.mobileMenuIcon} onClick={toggleMobileMenu}>
            <img
              src={mobileMenu ? "/images/navbar/cerrar.png" : "/images/navbar/menu.png"}
              alt={mobileMenu ? "Cerrar menú" : "Abrir menú"}
              className={styles.menuIcon}
            />
          </div>
          <div className={styles.flags}>
            <img
              src="/images/flags/es.png"
              alt="Español"
              className={styles.flag}
              onClick={() => {
                onLocaleChange("es");
                closeMobileMenu();
              }}
            />
            <img
              src="/images/flags/en.png"
              alt="English"
              className={styles.flag}
              onClick={() => {
                onLocaleChange("en");
                closeMobileMenu();
              }}
            />
            <img
              src="/images/flags/de.png"
              alt="Deutsch"
              className={styles.flag}
              onClick={() => {
                onLocaleChange("de");
                closeMobileMenu();
              }}
            />
          </div>
        </div>
      </div>
      <div className={`${styles.navbarMenu} ${mobileMenu ? styles.showMenu : ""}`}>
        <div className={styles.links}>
          <Link href="/" onClick={closeMobileMenu}>
            {intl.formatMessage({ id: "Navbar_inicio" })}
          </Link>
          {!isMobile ? (
            <div className={styles.linksDropdown} onMouseEnter={() => setShowRestaurants(true)} onMouseLeave={() => setShowRestaurants(false)}>
              <span className={styles.noLink}>{intl.formatMessage({ id: "Navbar_restaurantes" })}</span>
              <div className={`${styles.dropdown} ${showRestaurants ? styles.show : ""}`}>
                <Link href="/san-bernardo" onClick={closeMobileMenu}>
                  San Bernardo
                </Link>
                <Link href="/bravo-murillo" onClick={closeMobileMenu}>
                  Bravo Murillo
                </Link>
                <Link href="/reina-victoria" onClick={closeMobileMenu}>
                  Reina Victoria
                </Link>
                <Link href="/arenal" onClick={closeMobileMenu}>
                  Arenal
                </Link>
              </div>
            </div>
          ) : (
            <div className={`${styles.dropdown} ${styles.show}`}>
              <Link href="/san-bernardo" onClick={closeMobileMenu}>
                San Bernardo
              </Link>
              <Link href="/bravo-murillo" onClick={closeMobileMenu}>
                Bravo Murillo
              </Link>
              <Link href="/reina-victoria" onClick={closeMobileMenu}>
                Reina Victoria
              </Link>
              <Link href="/arenal" onClick={closeMobileMenu}>
                Arenal
              </Link>
            </div>
          )}
          <Link href="/reservas" onClick={closeMobileMenu}>
            {intl.formatMessage({ id: "Navbar_reservas" })}
          </Link>
          <Link href="/menu" onClick={closeMobileMenu}>
            {intl.formatMessage({ id: "Navbar_menu" })}
          </Link>
          <Link href="/carta" onClick={closeMobileMenu}>
            {intl.formatMessage({ id: "Navbar_carta" })}
          </Link>
          <Link href="/charcuteria" onClick={closeMobileMenu}>
            {intl.formatMessage({ id: "Navbar_charcuteria" })}
          </Link>
          <Link href="/about" onClick={closeMobileMenu}>
            {intl.formatMessage({ id: "Navbar_about" })}
          </Link>
          <Link href="/blog" onClick={closeMobileMenu}>
            {intl.formatMessage({ id: "Navbar_blog" })}
          </Link>
          <Link href="/contacto" onClick={closeMobileMenu}>
            {intl.formatMessage({ id: "Navbar_contacto" })}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
