import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para facilitar la internacionalización de la aplicación.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import Carousel from "../components/Carousel";
import styles from "../styles/carta.module.css"; // Importa los estilos específicos para la página 'Carta'.

interface CartaPageProps {
  loadingMessages: boolean; // Nuevo prop para el estado de carga
}

// Define el componente funcional CartaPage utilizando una función flecha.
const CartaPage = ({ loadingMessages }: CartaPageProps) => {
  const intl = useIntl(); // Inicializa el hook de internacionalización para usarlo en este componente.

  useVisitedPageTracking("carta-menu");
  useVisitedPageTrackingGA("carta-menu");

  if (loadingMessages) {
    return <Loader />;
  }

  // Renderiza el contenido del componente.
  return (
    <div className="pageContainer">
      <h1>{intl.formatMessage({ id: "carta-menu_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "carta-menu_Descripcion" })}</p>
      <div>
        <Carousel carouselType="inicio" />
      </div>
    </div>
  );
};

export default CartaPage; // Exporta el componente CartaPage para su uso en otras partes de la aplicación.
