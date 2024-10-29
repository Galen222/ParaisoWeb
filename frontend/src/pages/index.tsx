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
      {/* Nuevo Marco para Restaurantes */}
      <div className={styles.restaurantsContainer}>
        <div className={styles.frameContent}>
          <div className={styles.textSection}>
            <h1 className={styles.title}>
              {intl.formatMessage({ id: "inicio_Restaurantes_Texto1" })}
              <br />
              <span className={styles.highlight}>{intl.formatMessage({ id: "inicio_Restaurantes_Texto2" })}</span>
            </h1>
          </div>
          <div className={styles.buttonsSection}>
            <Link href="/san-bernardo" passHref>
              <button className={`btn btn-primary mx-auto ${styles.restaurantButton}`}>San Bernardo</button>
            </Link>
            <Link href="/bravo-murillo" passHref>
              <button className={`btn btn-primary mx-auto ${styles.restaurantButton}`}>Bravo Murillo</button>
            </Link>
            <Link href="/reina-victoria" passHref>
              <button className={`btn btn-primary mx-auto ${styles.restaurantButton}`}>Reina Victoria</button>
            </Link>
            <Link href="/arenal" passHref>
              <button className={`btn btn-primary mx-auto ${styles.restaurantButton}`}>Arenal</button>
            </Link>
          </div>
        </div>
      </div>
      {/* Fin del Nuevo Marco */}
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
