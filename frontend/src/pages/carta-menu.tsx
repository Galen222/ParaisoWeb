import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para facilitar la internacionalización de la aplicación.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import type { ComponentType } from "react";
import useScrollToTop from "../hooks/useScrollToTop";
import Carousel from "../components/Carousel";
import styles from "../styles/carta.module.css"; // Importa los estilos específicos para la página 'Carta'.

interface CartaPageProps {
  loadingMessages: boolean; // Nuevo prop para el estado de carga
}

type CartaPageComponent = ComponentType<CartaPageProps> & { pageTitleText?: string };

// Define el componente funcional CartaPage utilizando una función flecha.
const CartaPage: CartaPageComponent = ({ loadingMessages }: CartaPageProps) => {
  const intl = useIntl(); // Inicializa el hook de internacionalización para usarlo en este componente.
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();
  useVisitedPageTracking("carta-menu");
  useVisitedPageTrackingGA("carta-menu");

  if (loadingMessages) {
    return <Loader />;
  }

  // Renderiza el contenido del componente.
  return (
    <div className="pageContainer">
      <p>{intl.formatMessage({ id: "carta-menu_Descripcion" })}</p>
      {isScrollButtonVisible && (
        <button onClick={scrollToTop} className="scrollTop">
          <img src="/images/web/flechaArriba.png" alt="Subir" />
        </button>
      )}
      <br></br>
    </div>
  );
};

CartaPage.pageTitleText = "carta";

export default CartaPage; // Exporta el componente CartaPage para su uso en otras partes de la aplicación.
