// components/Navbar.tsx

import React, { useCallback, useEffect, useRef } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import Image from "next/image";
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
const RESTAURANTS_MENU_CLOSE_DELAY_MS = 300;

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
  const restaurantsCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isMobile } = useScreenSize();
  const { isSticky } = useStickyNav(navbarMenuRef, !isMobile);
  const previousIsMobileRef = useRef(isMobile);

  /** Marca el enlace que representa la página actual, incluidas las entradas del blog. */
  const getCurrentPageAria = (href: string): "page" | undefined => {
    const isCurrentPage =
      router.pathname === href ||
      (href === "/blog" && router.pathname.startsWith("/blog/"));
    return isCurrentPage ? "page" : undefined;
  };

  /**
   * Devuelve el foco al control que abrió el menú antes de ocultar sus enlaces.
   * Así ningún elemento enfocado queda dentro de un contenedor con `hidden`.
   */
  const moveFocusOutsideClosingMenus = useCallback((): void => {
    const activeElement = document.activeElement;

    if (!(activeElement instanceof HTMLElement)) {
      return;
    }

    const restaurantsMenuElement = document.getElementById("navbar-restaurants-menu");
    if (restaurantsMenuElement?.contains(activeElement)) {
      restaurantsButtonRef.current?.focus();
      return;
    }

    const mobileMenuElement = document.getElementById("navbar-mobile-menu");
    if (mobileMenuElement?.contains(activeElement)) {
      mobileMenuButtonRef.current?.focus();
    }
  }, []);

  /** Cancela un cierre pendiente cuando el puntero vuelve al botón o al desplegable. */
  const cancelScheduledRestaurantsClose = useCallback((): void => {
    if (restaurantsCloseTimeoutRef.current !== null) {
      clearTimeout(restaurantsCloseTimeoutRef.current);
      restaurantsCloseTimeoutRef.current = null;
    }
  }, []);

  /** Cierra inmediatamente el submenú en acciones explícitas como navegar o pulsar Escape. */
  const closeRestaurantsMenuImmediately = useCallback((): void => {
    cancelScheduledRestaurantsClose();
    closeRestaurantsMenu();
  }, [cancelScheduledRestaurantsClose, closeRestaurantsMenu]);

  /**
   * Retrasa ligeramente el cierre al abandonar el grupo con el ratón. De este modo,
   * el pequeño espacio visual entre el botón y el desplegable no impide alcanzarlo.
   */
  const scheduleRestaurantsMenuClose = useCallback((): void => {
    cancelScheduledRestaurantsClose();
    restaurantsCloseTimeoutRef.current = setTimeout(() => {
      restaurantsCloseTimeoutRef.current = null;
      closeRestaurantsMenu();
    }, RESTAURANTS_MENU_CLOSE_DELAY_MS);
  }, [cancelScheduledRestaurantsClose, closeRestaurantsMenu]);

  /** Cierra los menús después de sacar el foco de cualquier enlace que vaya a ocultarse. */
  const handleLinkClick = useCallback((): void => {
    moveFocusOutsideClosingMenus();
    closeMobileMenu();
    closeRestaurantsMenuImmediately();
  }, [closeMobileMenu, closeRestaurantsMenuImmediately, moveFocusOutsideClosingMenus]);

  // Una navegación iniciada por el historial, código externo o cualquier enlace que no
  // pertenezca a esta barra también debe cerrar los menús persistentes del contexto.
  useEffect(() => {
    router.events.on("routeChangeStart", handleLinkClick);
    return () => {
      router.events.off("routeChangeStart", handleLinkClick);
    };
  }, [router.events, handleLinkClick]);

  // Evita que un temporizador pendiente intente actualizar el contexto tras desmontar la barra.
  useEffect(() => cancelScheduledRestaurantsClose, [cancelScheduledRestaurantsClose]);

  // Al pasar de móvil a escritorio, cierra los menús para que no reaparezcan
  // con un estado antiguo al volver a reducir el ancho de la ventana.
  useEffect(() => {
    if (previousIsMobileRef.current && !isMobile) {
      closeMobileMenu();
      closeRestaurantsMenuImmediately();
    }
    previousIsMobileRef.current = isMobile;
  }, [isMobile, closeMobileMenu, closeRestaurantsMenuImmediately]);

  const handleDropdownClick = () => {
    cancelScheduledRestaurantsClose();
    if (restaurantsMenu) {
      closeRestaurantsMenuImmediately();
    } else {
      openRestaurantsMenu();
    }
  };

  const handleRestaurantsMouseEnter = () => {
    cancelScheduledRestaurantsClose();
    openRestaurantsMenu();
  };

  const handleRestaurantsMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    // No oculta enlaces que todavía contienen el foco del teclado. Si no hay foco
    // dentro, concede tiempo para atravesar el espacio hasta el desplegable.
    if (!event.currentTarget.contains(document.activeElement)) {
      scheduleRestaurantsMenuClose();
    }
  };

  const handleRestaurantsBlur = (event: FocusEvent<HTMLDivElement>) => {
    // Mantiene el menú abierto al mover el foco entre el botón y sus enlaces.
    if (!event.currentTarget.contains(event.relatedTarget)) {
      closeRestaurantsMenuImmediately();
    }
  };

  const handleRestaurantsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && restaurantsMenu) {
      event.preventDefault();
      closeRestaurantsMenuImmediately();
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
              <Image
                src={IMAGE_CONSTANTS.logo}
                alt={IMAGE_CONSTANTS.logoAlt}
                width={2150}
                height={1275}
                sizes="220px"
                priority
                className={styles.imgLogo}
              />
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
                  <Image
                    src={IMAGE_CONSTANTS.flags[lng as keyof typeof IMAGE_CONSTANTS.flags]}
                    alt=""
                    width={150}
                    height={150}
                    sizes="40px"
                    loading="eager"
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
          aria-label={intl.formatMessage({ id: "navbar_menu" })}
        >
          <div className={styles.links}>
            <Link href="/" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/")}>
              {intl.formatMessage({ id: "navbar_inicio" })}
            </Link>
            <div className={`${styles.dropdown} ${styles.show}`}>
              <Link href="/san-bernardo" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/san-bernardo")}>
                San Bernardo
              </Link>
              <Link href="/bravo-murillo" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/bravo-murillo")}>
                Bravo Murillo
              </Link>
              <Link href="/reina-victoria" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/reina-victoria")}>
                Reina Victoria
              </Link>
              <Link href="/arenal" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/arenal")}>
                Arenal
              </Link>
            </div>
            <Link href="/reservas" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/reservas")}>
              {intl.formatMessage({ id: "navbar_reservas" })}
            </Link>
            <Link href="/gastronomia" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/gastronomia")}>
              {intl.formatMessage({ id: "navbar_gastronomia" })}
            </Link>
            <Link href="/charcuteria" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/charcuteria")}>
              {intl.formatMessage({ id: "navbar_charcuteria" })}
            </Link>
            <Link href="/nosotros" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/nosotros")}>
              {intl.formatMessage({ id: "navbar_nosotros" })}
            </Link>
            <Link href="/blog" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/blog")}>
              {intl.formatMessage({ id: "navbar_blog" })}
            </Link>
            <Link href="/contacto" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/contacto")}>
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
          <Link href="/" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/")}>
            {intl.formatMessage({ id: "navbar_inicio" })}
          </Link>
          <div
            className={styles.linksDropdown}
            onMouseEnter={handleRestaurantsMouseEnter}
            onFocus={cancelScheduledRestaurantsClose}
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
            >
              <Link href="/san-bernardo" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/san-bernardo")}>
                San Bernardo
              </Link>
              <Link href="/bravo-murillo" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/bravo-murillo")}>
                Bravo Murillo
              </Link>
              <Link href="/reina-victoria" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/reina-victoria")}>
                Reina Victoria
              </Link>
              <Link href="/arenal" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/arenal")}>
                Arenal
              </Link>
            </div>
          </div>
          <Link href="/reservas" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/reservas")}>
            {intl.formatMessage({ id: "navbar_reservas" })}
          </Link>
          <Link href="/gastronomia" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/gastronomia")}>
            {intl.formatMessage({ id: "navbar_gastronomia" })}
          </Link>
          <Link href="/charcuteria" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/charcuteria")}>
            {intl.formatMessage({ id: "navbar_charcuteria" })}
          </Link>
          <Link href="/nosotros" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/nosotros")}>
            {intl.formatMessage({ id: "navbar_nosotros" })}
          </Link>
          <Link href="/blog" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/blog")}>
            {intl.formatMessage({ id: "navbar_blog" })}
          </Link>
          <Link href="/contacto" locale={router.locale} onClick={handleLinkClick} aria-current={getCurrentPageAria("/contacto")}>
            {intl.formatMessage({ id: "navbar_contacto" })}
          </Link>
        </div>
      </nav>
      <header className={styles.navbar}>
        <div className={styles.navbarTop}>
          <div className={styles.imgLogoContainer}>
            <Link href="/" locale={router.locale} onClick={handleLinkClick}>
              <Image
                src={IMAGE_CONSTANTS.logo}
                alt={IMAGE_CONSTANTS.logoAlt}
                width={2150}
                height={1275}
                sizes="220px"
                priority
                className={styles.imgLogo}
              />
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
                  <Image
                    src={IMAGE_CONSTANTS.flags[lng as keyof typeof IMAGE_CONSTANTS.flags]}
                    alt=""
                    width={150}
                    height={150}
                    sizes="40px"
                    loading="eager"
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
