import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/Transport.module.css"; // Crea un archivo CSS o reutiliza uno existente

interface TransportProps {
  transportName: string;
}

const Transport: React.FC<TransportProps> = ({ transportName }) => {
  const intl = useIntl();

  return (
    <div className={styles.transportContainer}>
      <div className={styles.transportItem}>
        <img src="/images/transport/metro.png" alt="Metro" />
        <h4>{intl.formatMessage({ id: `${transportName}_Metro_Titulo` })}</h4>
        <p>{intl.formatMessage({ id: `${transportName}_Metro_Lineas` })}</p>
      </div>
      <div className={styles.transportItem}>
        <img src="/images/transport/bus.png" alt="Autobús" />
        <h4>{intl.formatMessage({ id: `${transportName}_Bus_Titulo` })}</h4>
        <p>{intl.formatMessage({ id: `${transportName}_Bus_Lineas` })}</p>
      </div>
      <div className={styles.transportItem}>
        <img src="/images/transport/taxi.png" alt="Taxi" />
        <h4>{intl.formatMessage({ id: `${transportName}_Taxi_Titulo` })}</h4>
        <p>{intl.formatMessage({ id: `${transportName}_Taxi_Descripcion` })}</p>
      </div>
      <div className={styles.transportItem}>
        <img src="/images/transport/parking.png" alt="Aparcamiento" />
        <h4>{intl.formatMessage({ id: `${transportName}_Aparcamiento_Titulo` })}</h4>
        <p>{intl.formatMessage({ id: `${transportName}_Aparcamiento_Descripcion` })}</p>
      </div>
    </div>
  );
};

export default Transport;
