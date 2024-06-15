import React from "react"; // Importa React para crear el componente
import { useIntl } from "react-intl"; // Importa el hook useIntl para utilizar internacionalización
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import styles from "../styles/arenal.module.css"; // Importa los estilos CSS específicos para la página Arenal

// Define el componente funcional ArenalPage utilizando una función flecha de ES6
const ArenalPage = () => {
  const intl = useIntl(); // Inicializa el hook de internacionalización para utilizar en este componente
  useVisitedPageTracking("arenal");
  // Retorna JSX que representa el UI de la página Arenal
  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "arenal_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "arenal_Descripcion" })}</p>
    </div>
  );
};

export default ArenalPage; // Exporta ArenalPage para que pueda ser utilizado en otros componentes o páginas de la aplicación
