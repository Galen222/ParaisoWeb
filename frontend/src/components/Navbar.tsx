// components/Navbar.tsx

import React, { useRef } from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import { useRouter } from "next/router";
import { useMenu } from "../contexts/MenuContext";
import AnimatedTitle from "../components/AnimatedTitle";
import styles from "../styles/components/Navbar.module.css";
import { useLocaleChange } from "../hooks/useLocaleChange";
import useStickyNav from "../hooks/useStickyNav";
import useWindowSize from "../hooks/useWindowSize";

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
  const intl = useIntl();
  const router = useRouter();
  const { locales } = router;
  const handleLocaleChange = useLocaleChange();
  const { mobileMenu, toggleMobileMenu, closeMobileMenu, restaurantsMenu, openRestaurantsMenu, closeRestaurantsMenu } = useMenu();
  const navbarMenuRef = useRef<HTMLDivElement>(null);
  const { isSticky } = useStickyNav(navbarMenuRef);
  const windowWidth = useWindowSize();
  const isMobile = typeof windowWidth !== "undefined" && windowWidth <= 768;

  const handleLinkClick = () => {
    closeMobileMenu();
  };

  const handleDropdownClick = () => {
    if (!restaurantsMenu) {
      openRestaurantsMenu();
    }
  };

  if (isMobile) {
    return (
      <nav className={styles.navbar}>
        <div className={styles.navbarTop}>
          <div className={styles.imgLogoContainer}>
            <Link href="/" locale={router.locale} onClick={handleLinkClick}>
              <img src={IMAGE_CONSTANTS.logo} alt={IMAGE_CONSTANTS.logoAlt} className={styles.imgLogo} />
            </Link>
          </div>
          <div className={styles.textLogoContainer}>
            <span className={styles.textLogo}>PARAISO DEL JAMON</span>
          </div>
          <div className={styles.flagContainer}>
            <div className={`${styles.mobileMenuIcon} ${mobileMenu ? styles.colapseSpin : ""}`} onClick={toggleMobileMenu}>
              <div className={styles.inner}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div className={styles.flags}>
              {locales?.map((lng) => (
                <img
                  key={lng}
                  src={IMAGE_CONSTANTS.flags[lng as keyof typeof IMAGE_CONSTANTS.flags]}
                  alt={IMAGE_CONSTANTS.flagsAlt[lng as keyof typeof IMAGE_CONSTANTS.flagsAlt]}
                  className={`${styles.flag} ${router.locale === lng ? styles.activeFlag : ""}`}
                  onClick={() => {
                    handleLocaleChange(lng);
                    closeMobileMenu();
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className={`${styles.navbarMenu} ${mobileMenu ? styles.showMenu : ""}`}>
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
        </div>
        <div className={styles.animatedTitleContainer}>
          <AnimatedTitle key={pageTitleText} pageTitleText={pageTitleText} cookiesModalClosed={cookiesModalClosed} />
        </div>
      </nav>
    );
  }

  return (
    <>
      <div ref={navbarMenuRef} className={`${styles.navbarMenu} ${isSticky ? styles.sticky : ""}`}>
        <div className={styles.links}>
          <Link href="/" locale={router.locale} onClick={handleLinkClick}>
            {intl.formatMessage({ id: "navbar_inicio" })}
          </Link>
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
      <nav className={styles.navbar}>
        <div className={styles.navbarTop}>
          <div className={styles.imgLogoContainer}>
            <Link href="/" locale={router.locale} onClick={handleLinkClick}>
              <img src={IMAGE_CONSTANTS.logo} alt={IMAGE_CONSTANTS.logoAlt} className={styles.imgLogo} />
            </Link>
          </div>
          <div className={styles.textLogoContainer}>
            <span className={styles.textLogo}>PARAISO DEL JAMON</span>
          </div>
          <div className={styles.flagContainer}>
            <div className={styles.flags}>
              {locales?.map((lng) => (
                <img
                  key={lng}
                  src={IMAGE_CONSTANTS.flags[lng as keyof typeof IMAGE_CONSTANTS.flags]}
                  alt={IMAGE_CONSTANTS.flagsAlt[lng as keyof typeof IMAGE_CONSTANTS.flagsAlt]}
                  className={`${styles.flag} ${router.locale === lng ? styles.activeFlag : ""}`}
                  onClick={() => handleLocaleChange(lng)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className={styles.navbarMenuSpace} />
        <div className={styles.animatedTitleContainer}>
          <AnimatedTitle key={pageTitleText} pageTitleText={pageTitleText} cookiesModalClosed={cookiesModalClosed} />
        </div>
      </nav>
      {isSticky && <div className={styles.navbarSpacer} />}
    </>
  );
};

export default Navbar;
