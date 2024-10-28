import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para la internacionalización de texto.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import type { ComponentType } from "react";
import styles from "../styles/charcuteria.module.css"; // Importa los estilos CSS específicos para la página Charcutería.

interface CharcuteriaPageProps {
  loadingMessages: boolean; // Nuevo prop para el estado de carga
}

type CharcuteriaPageComponent = ComponentType<CharcuteriaPageProps> & { pageTitleText?: string };

// Define el componente funcional CharcuteriaPage utilizando una función flecha.
const CharcuteriaPage: CharcuteriaPageComponent = ({ loadingMessages }: CharcuteriaPageProps) => {
  const intl = useIntl(); // Utiliza el hook de internacionalización para obtener funciones de traducción.
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  useVisitedPageTracking("charcuteria");
  useVisitedPageTrackingGA("charcuteria");

  if (loadingMessages) {
    return <Loader />;
  }

  // Renderiza la interfaz de usuario para la página de Charcutería.
  return (
    <div className="pageContainer">
      <div>
        <p>{intl.formatMessage({ id: "charcuteria_Descripcion" })}</p>
      </div>
      <div className="mb-25p">
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollTop">
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

CharcuteriaPage.pageTitleText = "charcuteria";

export default CharcuteriaPage; // Exporta el componente CharcuteriaPage para que pueda ser utilizado en otros lugares de la aplicación.
