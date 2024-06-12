import React from "react"; // Importa React para usar JSX y crear componentes funcionales.
import { useIntl } from "react-intl"; // Importa el hook useIntl, que permite la internacionalización de la aplicación.
import styles from "../styles/reservas.module.css"; // Importa estilos CSS específicos para la página de reservas.

// Define el componente funcional ReservasPage.
const ReservasPage = () => {
  const intl = useIntl(); // Inicia el hook de internacionalización para acceder a las funciones de traducción.

  // Renderiza el componente con la estructura de la página de reservas.
  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "reservas_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "reservas_Descripcion" })}</p>
    </div>
  );
};

export default ReservasPage; // Exporta el componente para que pueda ser utilizado en otras partes de la aplicación.
