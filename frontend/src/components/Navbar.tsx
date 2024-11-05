// components/Navbar.tsx

import React from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import useDeviceType from "../hooks/useDeviceType";
import { useMenu } from "../contexts/MenuContext";
import Loader from "../components/Loader";
import AnimatedTitle from "../components/AnimatedTitle";
import styles from "../styles/components/Navbar.module.css";

/**
 * Propiedades para el componente Navbar.
 * @property {(locale: string) => void} onLocaleChange - Función para cambiar el idioma de la aplicación.
 * @property {boolean} loadingMessages - Indica si los mensajes están cargando.
 * @property {boolean} cookiesModalClosed - Indica si el modal de cookies ha sido cerrado.
 * @property {string} pageTitleText - Texto del título de la página para el componente AnimatedTitle.
 */
interface NavbarProps {
  onLocaleChange: (locale: string) => void;
  loadingMessages: boolean;
  cookiesModalClosed: boolean;
  pageTitleText: string;
}

/**
 * Componente Navbar
 *
 * Renderiza la barra de navegación de la aplicación, incluyendo enlaces a varias secciones,
 * un menú desplegable de restaurantes, selector de idioma y un título animado.
 *
 * @param {NavbarProps} props - Propiedades del componente Navbar.
 * @returns {JSX.Element} Barra de navegación con enlaces y selección de idioma.
 */
const Navbar: React.FC<NavbarProps> = ({ onLocaleChange, loadingMessages, cookiesModalClosed, pageTitleText }) => {
  const intl = useIntl(); // Hook para obtener mensajes localizados
  const deviceType = useDeviceType(); // Detecta el tipo de dispositivo (móvil o escritorio)
  const { mobileMenu, toggleMobileMenu, closeMobileMenu, restaurantsMenu, openRestaurantsMenu, closeRestaurantsMenu } = useMenu();
  const isMobile = deviceType === "mobile"; // Booleano que indica si es un dispositivo móvil

  /**
   * Maneja el clic en el menú desplegable de restaurantes.
   * Si el menú de restaurantes no está abierto, lo abre.
   */
  const handleDropdownClick = () => {
    if (!restaurantsMenu) {
      openRestaurantsMenu();
    }
  };

  if (loadingMessages) {
    return <Loader />; // Muestra un loader mientras los mensajes están cargando
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarTop}>
        <div className={styles.imgLogoContainer}>
          {/* Logo que enlaza a la página principal */}
          <Link href="/" onClick={closeMobileMenu}>
            <img src="/images/navbar/imagenLogo.png" alt="Logo Paraíso Del Jamón" className={styles.imgLogo} />
          </Link>
        </div>
        <div className={styles.textLogoContainer}>
          <span className={styles.textLogo}>PARAISO DEL JAMON</span>
        </div>
        <div className={styles.flagContainer}>
          {/* Ícono del menú móvil que muestra u oculta el menú al hacer clic */}
          <div className={`${styles.mobileMenuIcon} ${mobileMenu ? styles.colapseSpin : ""}`} onClick={toggleMobileMenu}>
            <div className={styles.inner}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          {/* Selector de idioma con banderas */}
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
            {intl.formatMessage({ id: "navbar_inicio" })}
          </Link>
          {!isMobile ? (
            // Menú desplegable de restaurantes en dispositivos de escritorio
            <div className={styles.linksDropdown} onMouseEnter={openRestaurantsMenu} onMouseLeave={closeRestaurantsMenu} onClick={handleDropdownClick}>
              <span className={styles.noLink}>{intl.formatMessage({ id: "navbar_restaurantes" })}</span>
              <div className={`${styles.dropdown} ${restaurantsMenu ? styles.show : styles.hide}`}>
                <Link href="/san-bernardo" onClick={closeRestaurantsMenu}>
                  San Bernardo
                </Link>
                <Link href="/bravo-murillo" onClick={closeRestaurantsMenu}>
                  Bravo Murillo
                </Link>
                <Link href="/reina-victoria" onClick={closeRestaurantsMenu}>
                  Reina Victoria
                </Link>
                <Link href="/arenal" onClick={closeRestaurantsMenu}>
                  Arenal
                </Link>
              </div>
            </div>
          ) : (
            // Menú desplegable de restaurantes en dispositivos móviles
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
            {intl.formatMessage({ id: "navbar_reservas" })}
          </Link>
          <Link href="/gastronomia" onClick={closeMobileMenu}>
            {intl.formatMessage({ id: "navbar_gastronomia" })}
          </Link>
          <Link href="/charcuteria" onClick={closeMobileMenu}>
            {intl.formatMessage({ id: "navbar_charcuteria" })}
          </Link>
          <Link href="/about" onClick={closeMobileMenu}>
            {intl.formatMessage({ id: "navbar_about" })}
          </Link>
          <Link href="/blog" onClick={closeMobileMenu}>
            {intl.formatMessage({ id: "navbar_blog" })}
          </Link>
          <Link href="/contacto" onClick={closeMobileMenu}>
            {intl.formatMessage({ id: "navbar_contacto" })}
          </Link>
        </div>
      </div>
      {/* Contenedor del título animado */}
      <div className={styles.animatedTitleContainer}>
        <AnimatedTitle key={pageTitleText} pageTitleText={pageTitleText} cookiesModalClosed={cookiesModalClosed} />
      </div>
    </nav>
  );
};

export default Navbar;
