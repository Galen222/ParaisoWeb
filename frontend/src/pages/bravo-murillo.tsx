import React from "react"; // Importa React, necesario para crear componentes y usar JSX.
import { useIntl } from "react-intl"; // Importa el hook useIntl para la internacionalización de texto.
import styles from "../styles/bravo-murillo.module.css"; // Importa los estilos CSS específicos para esta página.

// Define el componente funcional BravoMurilloPage.
const BravoMurilloPage = () => {
  const intl = useIntl(); // Utiliza el hook de internacionalización para obtener funciones de traducción.

  // Devuelve el JSX que construye la UI de la página.
  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "bravoMurillo_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "bravoMurillo_Descripcion" })}</p>
    </div>
  );
};

export default BravoMurilloPage; // Exporta BravoMurilloPage para que pueda ser utilizado en otros lugares de la aplicación.
