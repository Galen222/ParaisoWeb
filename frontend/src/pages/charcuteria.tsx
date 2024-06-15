import React from "react"; // Importa React, necesario para crear componentes y usar JSX.
import { useIntl } from "react-intl"; // Importa el hook useIntl para la internacionalización de texto.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import styles from "../styles/charcuteria.module.css"; // Importa los estilos CSS específicos para la página Charcutería.

// Define el componente funcional CharcuteriaPage utilizando una función flecha.
const CharcuteriaPage = () => {
  const intl = useIntl(); // Utiliza el hook de internacionalización para obtener funciones de traducción.
  useVisitedPageTracking("charcuteria");
  // Renderiza la interfaz de usuario para la página de Charcutería.
  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "charcuteria_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "charcuteria_Descripcion" })}</p>
    </div>
  );
};

export default CharcuteriaPage; // Exporta el componente CharcuteriaPage para que pueda ser utilizado en otros lugares de la aplicación.
