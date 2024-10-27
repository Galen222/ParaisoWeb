// navbar.tsx

import React from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import useDeviceType from "../hooks/useDeviceType";
import { useMenu } from "../contexts/MenuContext";
import Loader from "../components/Loader";
import AnimatedTitle from "../components/AnimatedTitle";
import styles from "../styles/Navbar.module.css";

interface NavbarProps {
  onLocaleChange: (locale: string) => void;
  loadingMessages: boolean;
  cookiesModalClosed: boolean;
  pageTitleText: string;
}

const Navbar: React.FC<NavbarProps> = ({ onLocaleChange, loadingMessages, cookiesModalClosed, pageTitleText }) => {
  const intl = useIntl();
  const deviceType = useDeviceType();
  const { mobileMenu, toggleMobileMenu, closeMobileMenu, restaurantsMenu, openRestaurantsMenu, closeRestaurantsMenu } = useMenu();
  const isMobile = deviceType === "mobile";

  const handleDropdownClick = () => {
    if (!restaurantsMenu) {
      openRestaurantsMenu();
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarTop}>
        <div className={styles.imgLogoContainer}>
          <Link href="/" onClick={closeMobileMenu}>
            <img src="/images/navbar/imagenLogo.png" alt="Logo Paraíso Del Jamón" className={styles.imgLogo} />
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
        {loadingMessages ? (
          <div className={styles.loaderContainer}>
            <Loader className={styles.navbarLoader} />
          </div>
        ) : (
          <div className={styles.links}>
            <Link href="/" onClick={closeMobileMenu}>
              {intl.formatMessage({ id: "Navbar_inicio" })}
            </Link>
            {!isMobile ? (
              <div className={styles.linksDropdown} onMouseEnter={openRestaurantsMenu} onMouseLeave={closeRestaurantsMenu} onClick={handleDropdownClick}>
                <span className={styles.noLink}>{intl.formatMessage({ id: "Navbar_restaurantes" })}</span>
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
            <Link href="/carta-menu" onClick={closeMobileMenu}>
              {intl.formatMessage({ id: "Navbar_carta-menu" })}
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
        )}
      </div>
      <div className={styles.animatedTitleContainer}>
        <AnimatedTitle key={pageTitleText} pageTitleText={pageTitleText} cookiesModalClosed={cookiesModalClosed} />
      </div>
    </nav>
  );
};

export default Navbar;
