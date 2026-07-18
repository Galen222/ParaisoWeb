// components/Navbar.tsx

import React, { useEffect, useRef } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import { useRouter } from "next/router";
import { useMenu } from "../contexts/MenuContext";
import AnimatedTitle from "../components/AnimatedTitle";
import styles from "../styles/components/Navbar.module.css";
import { useLocaleChange } from "../hooks/useLocaleChange";
import useStickyNav from "../hooks/useStickyNav";
import useScreenSize from "../hooks/useScreenSize";

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
  logoAlt: "Logo El Paraíso Del Jamón",

  /**
   * Rutas de las imágenes de las banderas por idioma.
   */
  flags: {
    es: "/images/flags/es.png",
    en: "/images/flags/en.png",
    de: "/images/flags/de.png",
    fr: "/images/flags/fr.png",
  },

  /**
   * Textos alternativos para las banderas por idioma.
   */
  flagsAlt: {
    es: "Español",
    en: "English",
    de: "Deutsch",
    fr: "Français",
  },
};

/**
 * Componente de navegación (Navbar) que incluye el logo, enlaces de navegación,
 * selección de idioma y un título animado.
 *
 * @param {NavbarProps} props - Propiedades del componente.
 * @returns {React.JSX.Element} Elemento JSX que representa la barra de navegación.
 */
const Navbar: React.FC<NavbarProps> = ({ cookiesModalClosed, pageTitleText }: NavbarProps): React.JSX.Element => {
  const intl = useIntl();
  const router = useRouter();
  const { locales } = router;
  const handleLocaleChange = useLocaleChange();
  const { mobileMenu, toggleMobileMenu, closeMobileMenu, restaurantsMenu, openRestaurantsMenu, closeRestaurantsMenu } = useMenu();
  const navbarMenuRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const restaurantsButtonRef = useRef<HTMLButtonElement>(null);
  const { isMobile } = useScreenSize();
  const { isSticky } = useStickyNav(navbarMenuRef, !isMobile);
  const previousIsMobileRef = useRef(isMobile);

  const handleLinkClick = () => {
    closeMobileMenu();
    closeRestaurantsMenu();
  };

  // Al pasar de móvil a escritorio, cierra los menús para que no reaparezcan
  // con un estado antiguo al volver a reducir el ancho de la ventana.
  useEffect(() => {
    if (previousIsMobileRef.current && !isMobile) {
      closeMobileMenu();
      closeRestaurantsMenu();
    }
    previousIsMobileRef.current = isMobile;
  }, [isMobile, closeMobileMenu, closeRestaurantsMenu]);

  const handleDropdownClick = () => {
    if (restaurantsMenu) {
      closeRestaurantsMenu();
    } else {
      openRestaurantsMenu();
    }
  };

  const handleRestaurantsMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    // No oculta enlaces que todavía contienen el foco del teclado. El cierre se
    // completa mediante `onBlur` cuando el usuario abandona realmente el grupo.
    if (!event.currentTarget.contains(document.activeElement)) {
      closeRestaurantsMenu();
    }
  };

  const handleRestaurantsBlur = (event: FocusEvent<HTMLDivElement>) => {
    // Mantiene el menú abierto al mover el foco entre el botón y sus enlaces.
    if (!event.currentTarget.contains(event.relatedTarget)) {
      closeRestaurantsMenu();
    }
  };

  const handleRestaurantsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && restaurantsMenu) {
      event.preventDefault();
      closeRestaurantsMenu();
      restaurantsButtonRef.current?.focus();
    }
  };

  const handleMobileMenuKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && mobileMenu) {
      event.preventDefault();
      closeMobileMenu();
      mobileMenuButtonRef.current?.focus();
    }
  };

  if (isMobile) {
    return (
      <header className={styles.navbar} onKeyDown={handleMobileMenuKeyDown}>
        <div className={styles.navbarTop}>
          <div className={styles.imgLogoContainer}>
            <Link href="/" locale={router.locale} onClick={handleLinkClick}>
              <img src={IMAGE_CONSTANTS.logo} alt={IMAGE_CONSTANTS.logoAlt} className={styles.imgLogo} />
            </Link>
          </div>
          <div className={styles.textLogoContainer}>
            <span className={styles.textLogo}>EL PARAÍSO DEL JAMÓN</span>
          </div>
          <div className={styles.flagContainer}>
            <button
              ref={mobileMenuButtonRef}
              type="button"
              className={`${styles.mobileMenuIcon} ${mobileMenu ? styles.colapseSpin : ""}`}
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenu}
              aria-controls="navbar-mobile-menu"
              aria-label={intl.formatMessage({ id: "navbar_menu" })}
            >
              <div className={styles.inner}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
            <div className={styles.flags}>
              {locales?.map((lng) => (
                <button
                  type="button"
                  key={lng}
                  className={styles.flagButton}
                  aria-label={IMAGE_CONSTANTS.flagsAlt[lng as keyof typeof IMAGE_CONSTANTS.flagsAlt]}
                  aria-pressed={router.locale === lng}
                  onClick={() => {
                    handleLinkClick();
                    void handleLocaleChange(lng);
                  }}
                >
                  <img
                    src={IMAGE_CONSTANTS.flags[lng as keyof typeof IMAGE_CONSTANTS.flags]}
                    alt=""
                    className={`${styles.flag} ${router.locale === lng ? styles.activeFlag : ""}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        <nav
          id="navbar-mobile-menu"
          className={`${styles.navbarMenu} ${mobileMenu ? styles.showMenu : ""}`}
          hidden={!mobileMenu}
          aria-hidden={!mobileMenu}
          aria-label={intl.formatMessage({ id: "navbar_menu" })}
        >
          <div className={styles.links}>
            <Link href="/" locale={router.locale} onClick={handleLinkClick}>
              {intl.formatMessage({ id: "navbar_inicio" })}
            </Link>
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
        </nav>
        <div className={styles.animatedTitleContainer}>
          <AnimatedTitle key={pageTitleText} pageTitleText={pageTitleText} cookiesModalClosed={cookiesModalClosed} />
        </div>
      </header>
    );
  }

  return (
    <>
      <nav
        ref={navbarMenuRef}
        className={`${styles.navbarMenu} ${isSticky ? styles.sticky : ""}`}
        aria-label={intl.formatMessage({ id: "navbar_menu" })}
      >
        <div className={styles.links}>
          <Link href="/" locale={router.locale} onClick={handleLinkClick}>
            {intl.formatMessage({ id: "navbar_inicio" })}
          </Link>
          <div
            className={styles.linksDropdown}
            onMouseEnter={openRestaurantsMenu}
            onMouseLeave={handleRestaurantsMouseLeave}
            onBlur={handleRestaurantsBlur}
            onKeyDown={handleRestaurantsKeyDown}
          >
            <button
              ref={restaurantsButtonRef}
              type="button"
              className={styles.noLink}
              onClick={handleDropdownClick}
              aria-expanded={restaurantsMenu}
              aria-controls="navbar-restaurants-menu"
            >
              {intl.formatMessage({ id: "navbar_restaurantes" })}
            </button>
            <div
              id="navbar-restaurants-menu"
              className={`${styles.dropdown} ${restaurantsMenu ? styles.show : styles.hide}`}
              hidden={!restaurantsMenu}
              aria-hidden={!restaurantsMenu}
            >
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
          </div>
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
      </nav>
      <header className={styles.navbar}>
        <div className={styles.navbarTop}>
          <div className={styles.imgLogoContainer}>
            <Link href="/" locale={router.locale} onClick={handleLinkClick}>
              <img src={IMAGE_CONSTANTS.logo} alt={IMAGE_CONSTANTS.logoAlt} className={styles.imgLogo} />
            </Link>
          </div>
          <div className={styles.textLogoContainer}>
            <span className={styles.textLogo}>EL PARAÍSO DEL JAMÓN</span>
          </div>
          <div className={styles.flagContainer}>
            <div className={styles.flags}>
              {locales?.map((lng) => (
                <button
                  type="button"
                  key={lng}
                  className={styles.flagButton}
                  aria-label={IMAGE_CONSTANTS.flagsAlt[lng as keyof typeof IMAGE_CONSTANTS.flagsAlt]}
                  aria-pressed={router.locale === lng}
                  onClick={() => {
                    handleLinkClick();
                    void handleLocaleChange(lng);
                  }}
                >
                  <img
                    src={IMAGE_CONSTANTS.flags[lng as keyof typeof IMAGE_CONSTANTS.flags]}
                    alt=""
                    className={`${styles.flag} ${router.locale === lng ? styles.activeFlag : ""}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.navbarMenuSpace} />
        <div className={styles.animatedTitleContainer}>
          <AnimatedTitle key={pageTitleText} pageTitleText={pageTitleText} cookiesModalClosed={cookiesModalClosed} />
        </div>
      </header>
    </>
  );
};

export default Navbar;
