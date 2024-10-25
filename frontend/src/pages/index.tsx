import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import AnimatedTitle from "../components/AnimatedTitle";
import Carousel from "../components/Carousel";
import styles from "../styles/index.module.css";

interface HomeProps {
  cookiesModalClosed: boolean;
  loadingMessages: boolean;
}

export default function Home({ cookiesModalClosed, loadingMessages }: HomeProps) {
  const intl = useIntl();

  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  useVisitedPageTracking("inicio");
  useVisitedPageTrackingGA("inicio");

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <AnimatedTitle text1Id="inicio_Titulo_Texto1" text2Id="inicio_Titulo_Texto2" cookiesModalClosed={cookiesModalClosed} />
      <div>
        <Carousel carouselType="inicio" /> {/* Pasa "inicio" como prop */}
      </div>
      {isScrollButtonVisible && (
        <button onClick={scrollToTop} className="scrollTop">
          <img src="/images/web/flechaArriba.png" alt="Subir" />
        </button>
      )}
    </div>
  );
}
