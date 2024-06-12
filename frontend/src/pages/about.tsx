import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para internacionalización
import styles from "../styles/about.module.css"; // Importa los estilos específicos para la página About

const AboutPage = () => {
  const intl = useIntl(); // Inicializa el hook de internacionalización para usar en este componente

  // Retorna JSX para renderizar la página About
  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "about_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "about_Descripcion" })}</p>
    </div>
  );
};

export default AboutPage; // Exporta el componente para ser usado en otras partes de la aplicación
