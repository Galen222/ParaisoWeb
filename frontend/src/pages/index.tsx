// pages/index.tsx
import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import Carousel from "../components/Carousel";
import styles from "../styles/index.module.css";
import type { ComponentType } from "react";

interface HomeProps {
  cookiesModalClosed: boolean;
  loadingMessages: boolean;
}

// Define el tipo del componente incluyendo `pageTitleText`
type HomeComponent = ComponentType<HomeProps> & { pageTitleText?: string };

const Home: HomeComponent = ({ loadingMessages }) => {
  const intl = useIntl();
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  useVisitedPageTracking("inicio");
  useVisitedPageTrackingGA("inicio");

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <div>
        <h1 className="text-center">{intl.formatMessage({ id: "inicio_Titulo1" })}</h1>
      </div>
      <div className="mt-25p">
        <p className="ti-20p">{intl.formatMessage({ id: "inicio_Texto1" })}</p>
      </div>
      <div>
        <Carousel carouselType="inicio" />
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

// Define `pageTitleText` como una propiedad estática de `Home`
Home.pageTitleText = "inicio";

export default Home;
