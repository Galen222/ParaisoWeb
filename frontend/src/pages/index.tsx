import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import Carousel from "../components/Carousel";
import styles from "../styles/index.module.css";

interface HomeProps {
  cookiesModalClosed: boolean;
  loadingMessages: boolean;
}

export default function Home({ cookiesModalClosed, loadingMessages }: HomeProps) {
  const intl = useIntl();

  useVisitedPageTracking("inicio");
  useVisitedPageTrackingGA("inicio");

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="container">
      <div className={styles.animationContainer}>
        <h1>
          {cookiesModalClosed ? (
            <div className={styles.animationTime}>
              <div className={`animate__animated animate__fadeInLeft`}>
                <div className={styles.animationFont}>{intl.formatMessage({ id: "inicio_Titulo_Texto1" })}</div>
              </div>
              <div className={`animate__animated animate__fadeInRight animate__delay-1s`}>
                <div className={styles.animationFont}>{intl.formatMessage({ id: "inicio_Titulo_Texto2" })}</div>
              </div>
            </div>
          ) : (
            <div>
              <div className={styles.animationFont}>{intl.formatMessage({ id: "inicio_Titulo_Texto1" })}</div>
              <div className={styles.animationFont}>{intl.formatMessage({ id: "inicio_Titulo_Texto2" })}</div>
            </div>
          )}
        </h1>
      </div>
      <div>
        <p>{intl.formatMessage({ id: "inicio_Descripcion" })}</p>
        <Carousel />
      </div>
    </div>
  );
}
