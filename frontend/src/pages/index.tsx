// pages/index.tsx
import React from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import Carousel from "../components/Carousel";
import styles from "../styles/index.module.css";
import type { ComponentType } from "react";

interface HomeProps {
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
      {/* Banner para Restaurantes */}
      <div className={styles.restaurantesContainer}>
        <div className={styles.restaurantesFrameContent}>
          <div className={styles.restaurantesTextSection}>
            <h1 className={styles.restaurantesTitle}>{intl.formatMessage({ id: "inicio_Restaurantes_Texto1" })}</h1>
            <h1 className={styles.restaurantesHighlight}>{intl.formatMessage({ id: "inicio_Restaurantes_Texto2" })}</h1>
          </div>
          <div className={styles.restaurantesButtonsSection}>
            <Link href="/san-bernardo" passHref>
              <button className={`btn btn-primary mx-auto ${styles.inicioButton}`}>San Bernardo</button>
            </Link>
            <Link href="/bravo-murillo" passHref>
              <button className={`btn btn-primary mx-auto ${styles.inicioButton}`}>Bravo Murillo</button>
            </Link>
            <Link href="/reina-victoria" passHref>
              <button className={`btn btn-primary mx-auto ${styles.inicioButton}`}>Reina Victoria</button>
            </Link>
            <Link href="/arenal" passHref>
              <button className={`btn btn-primary mx-auto ${styles.inicioButton}`}>Arenal</button>
            </Link>
          </div>
        </div>
      </div>
      {/* Banner para Gastronomia */}
      <div className={styles.gastronomiaContainer}>
        <div className={styles.gastronomiaFrameContent}>
          <div className={styles.gastronomiaButtonsSection}>
            <Link href="/gastronomia" passHref>
              <button className={`btn btn-primary mx-auto ${styles.inicioButton}`}>{intl.formatMessage({ id: "inicio_Gastronomia_Texto1" })}</button>
            </Link>
          </div>
          <div className={styles.gastronomiaTextSection}>
            <h1 className={styles.gastronomiaTitle}>{intl.formatMessage({ id: "inicio_Gastronomia_Texto2" })}</h1>
            <h1 className={styles.gastronomiaHighlight}>{intl.formatMessage({ id: "inicio_Gastronomia_Texto3" })}</h1>
          </div>
        </div>
      </div>
      {/* Banner para Nosotros */}
      <div className={styles.nosotrosContainer}>
        <div className={styles.nosotrosFrameContent}>
          <div className={styles.nosotrosTextSection}>
            <h1 className={styles.nosotrosTitle}>{intl.formatMessage({ id: "inicio_About_Texto1" })}</h1>
            <h1 className={styles.nosotrosHighlight}>{intl.formatMessage({ id: "inicio_About_Texto2" })}</h1>
          </div>
          <div className={styles.nosotrosButtonsSection}>
            <Link href="/about" passHref>
              <button className={`btn btn-primary mx-auto ${styles.inicioButton}`}>{intl.formatMessage({ id: "inicio_About_Texto3" })}</button>
            </Link>
          </div>
        </div>
      </div>
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

// Define `pageTitleText` como una propiedad estática de `Home`
Home.pageTitleText = "inicio";

export default Home;
