import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para facilitar la internacionalización de la aplicación.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import type { ComponentType } from "react";
import useScrollToTop from "../hooks/useScrollToTop";
import Carousel from "../components/Carousel";
import styles from "../styles/gastronomia.module.css"; // Importa los estilos específicos para la página 'Gastronomia'.

interface GastronomiaPageProps {
  loadingMessages: boolean; // Nuevo prop para el estado de carga
}

type GastronomiaPageComponent = ComponentType<GastronomiaPageProps> & { pageTitleText?: string };

// Define el componente funcional GastronomiaPage utilizando una función flecha.
const GastronomiaPage: GastronomiaPageComponent = ({ loadingMessages }: GastronomiaPageProps) => {
  const intl = useIntl(); // Inicializa el hook de internacionalización para usarlo en este componente.
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();
  useVisitedPageTracking("gastronomia");
  useVisitedPageTrackingGA("gastronomia");

  if (loadingMessages) {
    return <Loader />;
  }

  // Renderiza el contenido del componente.
  return (
    <div className="pageContainer">
      <p>{intl.formatMessage({ id: "gastronomia-menu_Descripcion" })}</p>
      {isScrollButtonVisible && (
        <button onClick={scrollToTop} className="scrollTop">
          <img src="/images/web/flechaArriba.png" alt="Subir" />
        </button>
      )}
      <br></br>
    </div>
  );
};

GastronomiaPage.pageTitleText = "gastronomia";

export default GastronomiaPage; // Exporta el componente GastronomiaPage para su uso en otras partes de la aplicación.
