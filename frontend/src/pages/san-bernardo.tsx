import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import AnimatedTitle from "../components/AnimatedTitle";
import Map from "../components/Map";
import Carousel from "../components/Carousel";
import styles from "../styles/san-bernardo.module.css";

interface SanBernardoProps {
  cookiesModalClosed: boolean;
  loadingMessages: boolean;
  mapLocale: string;
}

const SanBernardo = ({ loadingMessages, mapLocale, cookiesModalClosed }: SanBernardoProps) => {
  let restaurante = "san-bernardo";
  const intl = useIntl();

  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const locationKey = restaurante;

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <AnimatedTitle text1Id="sanBernardo_Titulo_Texto1" text2Id="sanBernardo_Titulo_Texto2" cookiesModalClosed={cookiesModalClosed} />
      <div>
        <Carousel carouselType="inicio" />
      </div>
      <div className={styles.localesContainer}>
        <div className={styles.contactLocation}>
          <h3 className="text-center">{intl.formatMessage({ id: "contacto_Informacion_SanBernardo_Titulo" })}</h3>
          <p>
            <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_SanBernardo_Direccion_Texto" })}</span>
            {intl.formatMessage({ id: "contacto_Informacion_SanBernardo_Direccion_Calle" })}
          </p>
          <p>
            <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_SanBernardo_Telefono_Texto" })}</span>
            <a className={styles.link} href="tel:+345328350">
              {intl.formatMessage({ id: "contacto_Informacion_SanBernardo_Telefono_Numero" })}
            </a>
          </p>
          <p>
            <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_SanBernardo_Horario_Texto" })}</span>
            {intl.formatMessage({ id: "contacto_Informacion_SanBernardo_Horario_Numero" })}
          </p>
        </div>
      </div>
      <br></br>
      <div className={styles.transportContainer}>
        <div className={styles.transportItem}>
          <img src="/images/transport/metro.png" alt="Metro" />
          <h4>{intl.formatMessage({ id: "sanBernardo_Metro_Titulo" })}</h4>
          <p>{intl.formatMessage({ id: "sanBernardo_Metro_Lineas" })}</p>
        </div>
        <div className={styles.transportItem}>
          <img src="/images/transport/bus.png" alt="Autobús" />
          <h4>{intl.formatMessage({ id: "sanBernardo_Bus_Titulo" })}</h4>
          <p>{intl.formatMessage({ id: "sanBernardo_Bus_Lineas" })}</p>
        </div>
        <div className={styles.transportItem}>
          <img src="/images/transport/taxi.png" alt="Taxi" />
          <h4>{intl.formatMessage({ id: "sanBernardo_Taxi_Titulo" })}</h4>
          <p>{intl.formatMessage({ id: "sanBernardo_Taxi_Descripcion" })}</p>
        </div>
        <div className={styles.transportItem}>
          <img src="/images/transport/parking.png" alt="Aparcamiento" />
          <h4>{intl.formatMessage({ id: "sanBernardo_Aparcamiento_Titulo" })}</h4>
          <p>{intl.formatMessage({ id: "sanBernardo_Aparcamiento_Descripcion" })}</p>
        </div>
      </div>
      <br></br>
      <Map locationKey={locationKey} mapLocale={mapLocale} />
      {isScrollButtonVisible && (
        <button onClick={scrollToTop} className="scrollTop">
          <img src="/images/web/flechaArriba.png" alt="Subir" />
        </button>
      )}
      <br></br>
    </div>
  );
};

export default SanBernardo;
