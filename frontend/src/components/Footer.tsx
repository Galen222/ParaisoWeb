import React from "react"; // Importa la biblioteca React
import { useIntl } from "react-intl"; // Importa el hook useIntl de react-intl para la internacionalización
import styles from "../styles/Footer.module.css"; // Importa los estilos específicos del módulo CSS para el footer

// Define el componente funcional Footer
const Footer = () => {
  // Obtiene el objeto intl usando el hook useIntl para manejar la internacionalización
  const intl = useIntl();

  return (
    // Renderiza el elemento footer con la clase de estilos correspondiente
    <footer className={styles.footer}>
      {/* Muestra un mensaje internacionalizado, incluyendo el año actual */}
      <p>
        {intl.formatMessage(
          { id: "Footer_Rights" }, // ID del mensaje en los archivos de traducción
          { year: new Date().getFullYear() } // Inserta el año actual en el mensaje
        )}
      </p>
    </footer>
  );
};

// Exporta el componente Footer como el componente por defecto del módulo
export default Footer;
