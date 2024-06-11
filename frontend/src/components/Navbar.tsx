import React, { useState } from "react"; // Importa React y el hook useState
import Link from "next/link"; // Importa el componente Link de Next.js para la navegación
import { useIntl } from "react-intl"; // Importa el hook useIntl de react-intl para la internacionalización
import styles from "../styles/Navbar.module.css"; // Importa los estilos específicos del módulo

// Define la interfaz para las props del componente Navbar
interface NavbarProps {
  onLocaleChange: (locale: string) => void; // Función para manejar el cambio de idioma
  currentLocale: string; // El idioma actual
}

// Define el componente funcional Navbar como un componente React funcional (React.FC)
const Navbar: React.FC<NavbarProps> = ({ onLocaleChange, currentLocale }) => {
  // Obtiene el objeto intl usando el hook useIntl para manejar la internacionalización
  const intl = useIntl();

  // Define un estado para manejar la visibilidad del menú desplegable de restaurantes
  const [showRestaurants, setShowRestaurants] = useState(false);

  return (
    <div className={styles.navbar}>
      {/* Imagen del logo con texto alternativo internacionalizado */}
      <img src="/images/logo.jpg" alt="Logo Paraiso Del Jamón" className={styles.logo} />
      <div className={styles.links}>
        {/* Enlaces de navegación con textos internacionalizados */}
        <Link href="/">{intl.formatMessage({ id: "Navbar_inicio" })}</Link>

        {/* Enlace con menú desplegable para los restaurantes */}
        <div onMouseEnter={() => setShowRestaurants(true)} onMouseLeave={() => setShowRestaurants(false)}>
          <Link href="/restaurantes">{intl.formatMessage({ id: "Navbar_restaurantes" })}</Link>
          {/* Menú desplegable que se muestra al pasar el ratón */}
          <div className={`${styles.dropdown} ${showRestaurants ? styles.show : ""}`}>
            <Link href="/san-bernardo">San Bernardo</Link>
            <Link href="/bravo-murillo">Bravo Murillo</Link>
            <Link href="/reina-victoria">Reina Victoria</Link>
            <Link href="/arenal">Arenal</Link>
          </div>
        </div>

        {/* Otros enlaces de navegación con textos internacionalizados */}
        <Link href="/reservas">{intl.formatMessage({ id: "Navbar_reservas" })}</Link>
        <Link href="/menu">{intl.formatMessage({ id: "Navbar_menu" })}</Link>
        <Link href="/carta">{intl.formatMessage({ id: "Navbar_carta" })}</Link>
        <Link href="/charcuteria">{intl.formatMessage({ id: "Navbar_charcuteria" })}</Link>
        <Link href="/about">{intl.formatMessage({ id: "Navbar_about" })}</Link>
        <Link href="/blog">{intl.formatMessage({ id: "Navbar_blog" })}</Link>
        <Link href="/contacto">{intl.formatMessage({ id: "Navbar_contacto" })}</Link>
      </div>

      {/* Selector de idioma */}
      <select onChange={(e) => onLocaleChange(e.target.value)} value={currentLocale} className={styles.languageSelector}>
        <option value="es">ES</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
};

// Exporta el componente Navbar como el componente por defecto del módulo
export default Navbar;
