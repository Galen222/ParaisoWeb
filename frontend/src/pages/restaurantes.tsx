import React from "react"; // Importa React, necesario para crear componentes y utilizar JSX.
import { useIntl } from "react-intl"; // Importa el hook useIntl, esencial para la internacionalización.
import styles from "../styles/restaurantes.module.css"; // Importa los estilos CSS específicos para la página de restaurantes.

// Define el componente funcional RestaurantsPage.
const RestaurantsPage = () => {
  const intl = useIntl(); // Inicializa el hook de internacionalización para usarlo en este componente.

  // Renderiza la interfaz de usuario para la página de restaurantes.
  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "restaurantes_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "restaurantes_Descripcion" })}</p>
    </div>
  );
};

export default RestaurantsPage; // Exporta el componente para que pueda ser usado en otras partes de la aplicación.
