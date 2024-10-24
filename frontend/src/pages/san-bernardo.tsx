import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import AnimatedTitle from "../components/AnimatedTitle";
import Map from "../components/Map";
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
      <p>{intl.formatMessage({ id: "sanBernardo_Texto1" })}</p>
      <p>{intl.formatMessage({ id: "sanBernardo_Texto2" })}</p>
      <p>{intl.formatMessage({ id: "sanBernardo_Texto3" })}</p>
      <br></br>
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
      <Map locationKey={locationKey} mapLocale={mapLocale} />
      {isScrollButtonVisible && (
        <button onClick={scrollToTop} className="scrollTop">
          <img src="/images/web/flechaArriba.png" alt="Subir" />
        </button>
      )}
    </div>
  );
};

export default SanBernardo;
