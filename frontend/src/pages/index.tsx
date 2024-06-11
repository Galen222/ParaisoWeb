import React from "react"; // Importa React
import { useIntl } from "react-intl"; // Importa el hook useIntl de react-intl para la internacionalización
import styles from "../styles/index.module.css"; // Importa los estilos específicos del módulo

// Define el componente funcional Home como el componente por defecto exportado
export default function Home() {
  // Obtiene el objeto intl usando el hook useIntl para manejar la internacionalización
  const intl = useIntl();

  return (
    <div className="container">
      {/* Renderiza un título internacionalizado utilizando el id "inicioTitulo" */}
      <h1>{intl.formatMessage({ id: "inicio_Titulo" })}</h1>
      {/* Renderiza una descripción internacionalizada utilizando el id "inicioDescripcion" */}
      <p>{intl.formatMessage({ id: "inicio_Descripcion" })}</p>
    </div>
  );
}
