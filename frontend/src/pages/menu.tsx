import React from "react"; // Importa React, la librería base para construir componentes.
import { useIntl } from "react-intl"; // Importa el hook useIntl para facilitar la internacionalización.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useTrackingGA } from "../hooks/useTrackingGA";
import styles from "../styles/menu.module.css"; // Importa los estilos CSS específicos para la página de menú.

// Define el componente funcional MenuPage utilizando una función flecha.
const MenuPage = () => {
  const intl = useIntl(); // Inicializa el hook de internacionalización para utilizarlo en este componente.
  useVisitedPageTracking("menu");
  useTrackingGA("menu");

  // Retorna JSX que forma la interfaz de usuario de la página del menú.
  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "menu_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "menu_Descripcion" })}</p>
    </div>
  );
};

export default MenuPage; // Exporta el componente para que pueda ser usado en otras partes de la aplicación.
