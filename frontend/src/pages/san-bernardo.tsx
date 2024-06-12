import React from "react"; // Importa React para utilizar JSX y crear componentes.
import { useIntl } from "react-intl"; // Importa el hook useIntl para la internacionalización.
import styles from "../styles/san-bernardo.module.css"; // Importa los estilos CSS específicos para la página San Bernardo.

// Define el componente funcional SanBernardo.
const SanBernardo = () => {
  const intl = useIntl(); // Inicializa el hook de internacionalización para usarlo en este componente.

  // Renderiza la interfaz de usuario para la página de San Bernardo.
  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "sanBernardo_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "sanBernardo_Descripcion" })}</p>
    </div>
  );
};

export default SanBernardo; // Exporta el componente SanBernardo para que pueda ser utilizado en otras partes de la aplicación.
