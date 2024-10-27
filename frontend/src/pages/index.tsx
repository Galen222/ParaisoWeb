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

// Define el tipo del componente incluyendo `pageTitletext`
type HomeComponent = ComponentType<HomeProps> & { pageTitletext?: string };

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
        <Carousel carouselType="inicio" />
      </div>
      {isScrollButtonVisible && (
        <button onClick={scrollToTop} className="scrollTop">
          <img src="/images/web/flechaArriba.png" alt="Subir" />
        </button>
      )}
    </div>
  );
};

// Define `pageTitletext` como una propiedad estática de `Home`
Home.pageTitletext = "inicio";

export default Home;
