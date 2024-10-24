import React from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para la internacionalización de texto.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import AnimatedTitle from "../components/AnimatedTitle";
import Map from "../components/Map";
import styles from "../styles/bravo-murillo.module.css"; // Importa los estilos CSS específicos para esta página.

interface BravoMurilloPageProps {
  cookiesModalClosed: boolean;
  loadingMessages: boolean;
  mapLocale: string;
}

// Define el componente funcional BravoMurilloPage.
const BravoMurilloPage = ({ loadingMessages, mapLocale, cookiesModalClosed }: BravoMurilloPageProps) => {
  let restaurante = "bravo-murillo";
  const intl = useIntl(); // Utiliza el hook de internacionalización para obtener funciones de traducción.

  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  useVisitedPageTracking(restaurante);
  useVisitedPageTrackingGA(restaurante);

  const locationKey = restaurante;

  if (loadingMessages) {
    return <Loader />;
  }

  // Devuelve el JSX que construye la UI de la página.
  return (
    <div className="pageContainer">
      <AnimatedTitle text1Id="bravoMurillo_Titulo_Texto1" text2Id="bravoMurillo_Titulo_Texto2" cookiesModalClosed={cookiesModalClosed} />

      <div className={styles.localesContainer}>
        <div className={styles.contactLocation}>
          <h3 className="text-center">{intl.formatMessage({ id: "contacto_Informacion_BravoMurillo_Titulo" })}</h3>
          <p>
            <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_BravoMurillo_Direccion_Texto" })}</span>
            {intl.formatMessage({ id: "contacto_Informacion_BravoMurillo_Direccion_Calle" })}
          </p>
          <p>
            <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_BravoMurillo_Telefono_Texto" })}</span>
            <a className={styles.link} href="tel:+345539783">
              {intl.formatMessage({ id: "contacto_Informacion_BravoMurillo_Telefono_Numero" })}
            </a>
          </p>
          <p>
            <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_BravoMurillo_Horario_Texto" })}</span>
            {intl.formatMessage({ id: "contacto_Informacion_BravoMurillo_Horario_Numero" })}
          </p>
        </div>
      </div>
      <br></br>
      <div className={styles.transportContainer}>
        <div className={styles.transportItem}>
          <img src="/images/transport/metro.png" alt="Metro" />
          <h4>{intl.formatMessage({ id: "bravoMurillo_Metro_Titulo" })}</h4>
          <p>{intl.formatMessage({ id: "bravoMurillo_Metro_Lineas" })}</p>
        </div>
        <div className={styles.transportItem}>
          <img src="/images/transport/bus.png" alt="Autobús" />
          <h4>{intl.formatMessage({ id: "bravoMurillo_Bus_Titulo" })}</h4>
          <p>{intl.formatMessage({ id: "bravoMurillo_Bus_Lineas" })}</p>
        </div>
        <div className={styles.transportItem}>
          <img src="/images/transport/taxi.png" alt="Taxi" />
          <h4>{intl.formatMessage({ id: "bravoMurillo_Taxi_Titulo" })}</h4>
          <p>{intl.formatMessage({ id: "bravoMurillo_Taxi_Descripcion" })}</p>
        </div>
        <div className={styles.transportItem}>
          <img src="/images/transport/parking.png" alt="Aparcamiento" />
          <h4>{intl.formatMessage({ id: "bravoMurillo_Aparcamiento_Titulo" })}</h4>
          <p>{intl.formatMessage({ id: "bravoMurillo_Aparcamiento_Descripcion" })}</p>
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

export default BravoMurilloPage; // Exporta BravoMurilloPage para que pueda ser utilizado en otros lugares de la aplicación.
