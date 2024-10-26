import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para utilizar internacionalización
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import AnimatedTitle from "../components/AnimatedTitle";
import Map from "../components/Map";
import Carousel from "../components/Carousel";
import styles from "../styles/arenal.module.css"; // Importa los estilos CSS específicos para la página Arenal

interface ArenalPageProps {
  cookiesModalClosed: boolean;
  loadingMessages: boolean;
  mapLocale: string;
}

// Define el componente funcional ArenalPage utilizando una función flecha de ES6
const ArenalPage = ({ loadingMessages, mapLocale, cookiesModalClosed }: ArenalPageProps) => {
  let restaurante = "arenal";
  const intl = useIntl(); // Inicializa el hook de internacionalización para utilizar en este componente

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  const locationKey = restaurante;

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <AnimatedTitle text1Id="arenal_Titulo_Texto1" text2Id="arenal_Titulo_Texto2" cookiesModalClosed={cookiesModalClosed} />
      <div>
        <Carousel carouselType="inicio" />
      </div>
      <div className={styles.localesContainer}>
        <div className={styles.contactLocation}>
          <h3 className="text-center">{intl.formatMessage({ id: "contacto_Informacion_Arenal_Titulo" })}</h3>
          <p>
            <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_Arenal_Direccion_Texto" })}</span>
            {intl.formatMessage({ id: "contacto_Informacion_Arenal_Direccion_Calle" })}
          </p>
          <p>
            <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_Arenal_Telefono_Texto" })}</span>
            <a className={styles.link} href="tel:+345328350">
              {intl.formatMessage({ id: "contacto_Informacion_Arenal_Telefono_Numero" })}
            </a>
          </p>
          <p>
            <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_Arenal_Horario_Texto" })}</span>
            {intl.formatMessage({ id: "contacto_Informacion_Arenal_Horario_Numero" })}
          </p>
        </div>
      </div>
      <br></br>
      <div className={styles.transportContainer}>
        <div className={styles.transportItem}>
          <img src="/images/transport/metro.png" alt="Metro" />
          <h4>{intl.formatMessage({ id: "arenal_Metro_Titulo" })}</h4>
          <p>{intl.formatMessage({ id: "arenal_Metro_Lineas" })}</p>
        </div>
        <div className={styles.transportItem}>
          <img src="/images/transport/bus.png" alt="Autobús" />
          <h4>{intl.formatMessage({ id: "arenal_Bus_Titulo" })}</h4>
          <p>{intl.formatMessage({ id: "arenal_Bus_Lineas" })}</p>
        </div>
        <div className={styles.transportItem}>
          <img src="/images/transport/taxi.png" alt="Taxi" />
          <h4>{intl.formatMessage({ id: "arenal_Taxi_Titulo" })}</h4>
          <p>{intl.formatMessage({ id: "arenal_Taxi_Descripcion" })}</p>
        </div>
        <div className={styles.transportItem}>
          <img src="/images/transport/parking.png" alt="Aparcamiento" />
          <h4>{intl.formatMessage({ id: "arenal_Aparcamiento_Titulo" })}</h4>
          <p>{intl.formatMessage({ id: "arenal_Aparcamiento_Descripcion" })}</p>
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

export default ArenalPage; // Exporta ArenalPage para que pueda ser utilizado en otros componentes o páginas de la aplicación
