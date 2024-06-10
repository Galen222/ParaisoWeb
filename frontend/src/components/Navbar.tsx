import React, { useState } from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import styles from "../styles/Navbar.module.css";

interface NavbarProps {
  onLocaleChange: (locale: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLocaleChange }) => {
  const intl = useIntl();
  const [showRestaurants, setShowRestaurants] = useState(false);

  return (
    <div className={styles.navbar}>
      <img src="/images/logo.jpg" alt={intl.formatMessage({ id: "logoAlt" })} className={styles.logo} />
      <div className={styles.links}>
        <Link href="/">{intl.formatMessage({ id: "inicio" })}</Link>
        <div onMouseEnter={() => setShowRestaurants(true)} onMouseLeave={() => setShowRestaurants(false)}>
          <a>{intl.formatMessage({ id: "restaurantes" })}</a>
          {showRestaurants && (
            <div className={styles.dropdown}>
              <Link href="/san-bernardo">{intl.formatMessage({ id: "sanBernardo" })}</Link>
              <Link href="/bravo-murillo">{intl.formatMessage({ id: "bravoMurillo" })}</Link>
              <Link href="/reina-victoria">{intl.formatMessage({ id: "reinaVictoria" })}</Link>
              <Link href="/arenal">{intl.formatMessage({ id: "arenal" })}</Link>
            </div>
          )}
        </div>
        <Link href="/reservas">{intl.formatMessage({ id: "reservas" })}</Link>
        <Link href="/menu">{intl.formatMessage({ id: "menu" })}</Link>
        <Link href="/carta">{intl.formatMessage({ id: "carta" })}</Link>
        <Link href="/charcuteria">{intl.formatMessage({ id: "charcuteria" })}</Link>
        <Link href="/about">{intl.formatMessage({ id: "about" })}</Link>
        <Link href="/blog">{intl.formatMessage({ id: "blog" })}</Link>
        <Link href="/contacto">{intl.formatMessage({ id: "contacto" })}</Link>
      </div>
      <select onChange={(e) => onLocaleChange(e.target.value)} className={styles.languageSelector}>
        <option value="es">ES</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
};

export default Navbar;
