import React from "react"; // Importa React para crear componentes y usar JSX.
import { useIntl } from "react-intl"; // Importa el hook useIntl para facilitar la internacionalización de la aplicación.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import styles from "../styles/carta.module.css"; // Importa los estilos específicos para la página 'Carta'.

// Define el componente funcional CartaPage utilizando una función flecha.
const CartaPage = () => {
  const intl = useIntl(); // Inicializa el hook de internacionalización para usarlo en este componente.
  useVisitedPageTracking("carta");
  useVisitedPageTrackingGA("carta");
  // Renderiza el contenido del componente.
  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "carta_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "carta_Descripcion" })}</p>
    </div>
  );
};

export default CartaPage; // Exporta el componente CartaPage para su uso en otras partes de la aplicación.
