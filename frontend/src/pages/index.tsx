// pages/index.tsx
import React from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import Carousel from "../components/Carousel";
import Banner from "../components/Banner";
import styles from "../styles/index.module.css";
import type { ComponentType } from "react";

interface HomeProps {
  loadingMessages: boolean;
}

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

      {/* Uso de Banners */}
      <Banner bannerType="restaurantes" />
      <Banner bannerType="gastronomia" />
      <Banner bannerType="charcuteria" />
      <Banner bannerType="nosotros" />
      <Banner bannerType="empleo" />

      <div>
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollTop">
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

Home.pageTitleText = "inicio";

export default Home;
