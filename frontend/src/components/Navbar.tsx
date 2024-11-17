// components/Navbar.tsx

import React, { useEffect } from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import { useRouter } from "next/router";
import useDeviceType from "../hooks/useDeviceType";
import { useMenu } from "../contexts/MenuContext";
import AnimatedTitle from "../components/AnimatedTitle";
import styles from "../styles/components/Navbar.module.css";
import { useLocaleChange } from "../hooks/useLocaleChange";

/**
 * Interfaz que define las propiedades del componente Navbar.
 */
export interface NavbarProps {
  /**
   * Indica si el modal de cookies ha sido cerrado.
   */
  cookiesModalClosed: boolean;

  /**
   * Texto que se muestra en el título animado de la página.
   */
  pageTitleText: string;
}

/**
 * Constantes para las rutas y textos alternativos de las imágenes.
 */
const IMAGE_CONSTANTS = {
  /**
   * Ruta de la imagen del logo.
   */
  logo: "/images/navbar/imagenLogo.png",

  /**
   * Texto alternativo para la imagen del logo.
   */
  logoAlt: "Logo Paraíso Del Jamón",

  /**
   * Rutas de las imágenes de las banderas por idioma.
   */
  flags: {
    es: "/images/flags/es.png",
    en: "/images/flags/en.png",
    de: "/images/flags/de.png",
  },

  /**
   * Textos alternativos para las banderas por idioma.
   */
  flagsAlt: {
    es: "Español",
    en: "English",
    de: "Deutsch",
  },
};

/**
 * Componente de navegación (Navbar) que incluye el logo, enlaces de navegación,
 * selección de idioma y un título animado.
 *
 * @param {NavbarProps} props - Propiedades del componente.
 * @returns {JSX.Element} Elemento JSX que representa la barra de navegación.
 */
const Navbar: React.FC<NavbarProps> = ({ cookiesModalClosed, pageTitleText }: NavbarProps): JSX.Element => {
  const intl = useIntl(); // Hook para internacionalización
  const router = useRouter(); // Hook de Next.js para acceder al enrutador
  const { locales, defaultLocale } = router; // Obtiene los locales disponibles y el locale por defecto
  const handleLocaleChange = useLocaleChange(); // Usa el hook para manejar el cambio de idioma

  const deviceType = useDeviceType(); // Hook personalizado para detectar el tipo de dispositivo
  const { mobileMenu, toggleMobileMenu, closeMobileMenu, restaurantsMenu, openRestaurantsMenu, closeRestaurantsMenu } = useMenu(); // Contexto para el menú

  /**
   * Indica si el dispositivo es móvil.
   */
  const isMobile = deviceType === "mobile";

  /**
   * Maneja el evento de clic en los enlaces de navegación.
   * Cierra el menú móvil al hacer clic en un enlace.
   */
  const handleLinkClick = () => {
    closeMobileMenu();
  };

  /**
   * Maneja el evento de clic en el desplegable de restaurantes.
   * Abre el menú de restaurantes si no está abierto.
   */
  const handleDropdownClick = () => {
    if (!restaurantsMenu) {
      openRestaurantsMenu();
    }
  };

  return (
    <nav className={styles.navbar}>
      {/* Sección superior de la barra de navegación que contiene el logo y las banderas */}
      <div className={styles.navbarTop}>
        {/* Contenedor del logo */}
        <div className={styles.imgLogoContainer}>
          <Link href="/" locale={router.locale} onClick={handleLinkClick}>
            <img src={IMAGE_CONSTANTS.logo} alt={IMAGE_CONSTANTS.logoAlt} className={styles.imgLogo} />
          </Link>
        </div>
        {/* Contenedor del texto del logo */}
        <div className={styles.textLogoContainer}>
          <span className={styles.textLogo}>PARAISO DEL JAMON</span>
        </div>
        {/* Contenedor de las banderas y el icono del menú móvil */}
        <div className={styles.flagContainer}>
          {/* Icono para el menú móvil que permite abrir/cerrar el menú */}
          <div className={`${styles.mobileMenuIcon} ${mobileMenu ? styles.colapseSpin : ""}`} onClick={toggleMobileMenu}>
            <div className={styles.inner}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          {/* Contenedor de las banderas para seleccionar el idioma */}
          <div className={styles.flags}>
            {locales?.map((lng) => (
              <img
                key={lng}
                src={IMAGE_CONSTANTS.flags[lng as keyof typeof IMAGE_CONSTANTS.flags]}
                alt={IMAGE_CONSTANTS.flagsAlt[lng as keyof typeof IMAGE_CONSTANTS.flagsAlt]}
                className={`${styles.flag} ${router.locale === lng ? styles.activeFlag : ""}`}
                onClick={() => {
                  handleLocaleChange(lng); // Cambia el idioma
                  closeMobileMenu(); // Cierra el menú móvil
                }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Menú de navegación principal */}
      <div className={`${styles.navbarMenu} ${mobileMenu ? styles.showMenu : ""}`}>
        <div className={styles.links}>
          {/* Enlace al inicio */}
          <Link href="/" locale={router.locale} onClick={handleLinkClick}>
            {intl.formatMessage({ id: "navbar_inicio" })}
          </Link>
          {/* Desplegable de restaurantes, solo visible en pantallas no móviles */}
          {!isMobile ? (
            <div className={styles.linksDropdown} onMouseEnter={openRestaurantsMenu} onMouseLeave={closeRestaurantsMenu} onClick={handleDropdownClick}>
              <span className={styles.noLink}>{intl.formatMessage({ id: "navbar_restaurantes" })}</span>
              <div className={`${styles.dropdown} ${restaurantsMenu ? styles.show : styles.hide}`}>
                <Link href="/san-bernardo" locale={router.locale} onClick={closeRestaurantsMenu}>
                  San Bernardo
                </Link>
                <Link href="/bravo-murillo" locale={router.locale} onClick={closeRestaurantsMenu}>
                  Bravo Murillo
                </Link>
                <Link href="/reina-victoria" locale={router.locale} onClick={closeRestaurantsMenu}>
                  Reina Victoria
                </Link>
                <Link href="/arenal" locale={router.locale} onClick={closeRestaurantsMenu}>
                  Arenal
                </Link>
              </div>
            </div>
          ) : (
            /* Menú desplegable de restaurantes para pantallas móviles */
            <div className={`${styles.dropdown} ${styles.show}`}>
              <Link href="/san-bernardo" locale={router.locale} onClick={handleLinkClick}>
                San Bernardo
              </Link>
              <Link href="/bravo-murillo" locale={router.locale} onClick={handleLinkClick}>
                Bravo Murillo
              </Link>
              <Link href="/reina-victoria" locale={router.locale} onClick={handleLinkClick}>
                Reina Victoria
              </Link>
              <Link href="/arenal" locale={router.locale} onClick={handleLinkClick}>
                Arenal
              </Link>
            </div>
          )}
          {/* Enlaces adicionales de navegación */}
          <Link href="/reservas" locale={router.locale} onClick={handleLinkClick}>
            {intl.formatMessage({ id: "navbar_reservas" })}
          </Link>
          <Link href="/gastronomia" locale={router.locale} onClick={handleLinkClick}>
            {intl.formatMessage({ id: "navbar_gastronomia" })}
          </Link>
          <Link href="/charcuteria" locale={router.locale} onClick={handleLinkClick}>
            {intl.formatMessage({ id: "navbar_charcuteria" })}
          </Link>
          <Link href="/nosotros" locale={router.locale} onClick={handleLinkClick}>
            {intl.formatMessage({ id: "navbar_nosotros" })}
          </Link>
          <Link href="/blog" locale={router.locale} onClick={handleLinkClick}>
            {intl.formatMessage({ id: "navbar_blog" })}
          </Link>
          <Link href="/contacto" locale={router.locale} onClick={handleLinkClick}>
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
