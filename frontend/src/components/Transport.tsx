// components/Transport.tsx

import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/components/Transport.module.css"; // Crea un archivo CSS o reutiliza uno existente

/**
 * Propiedades para el componente Transport.
 * @property {string} transportName - Nombre del lugar o ubicación para mostrar información de transporte relacionada.
 * Este valor se utiliza como parte de los identificadores de traducción para obtener el contenido específico.
 */
interface TransportProps {
  transportName: string;
}

/**
 * Componente Transport
 *
 * Renderiza información sobre opciones de transporte cercanas a una ubicación específica,
 * como líneas de metro, autobuses, taxis y aparcamiento. Cada opción incluye un ícono,
 * un título y una descripción, todos los textos son internacionalizados.
 *
 * @param {TransportProps} props - Propiedades del componente Transport.
 * @returns {JSX.Element} Información de transporte para la ubicación especificada.
 */
const Transport: React.FC<TransportProps> = ({ transportName }) => {
  const intl = useIntl(); // Hook para obtener mensajes localizados

  return (
    <div className={styles.transportContainer}>
      {/* Información del transporte en metro */}
      <div className={styles.transportItem}>
        <img src="/images/transport/metro.png" alt="Metro" />
        <h4>{intl.formatMessage({ id: `${transportName}_Metro_Titulo` })}</h4>
        <p>{intl.formatMessage({ id: `${transportName}_Metro_Lineas` })}</p>
      </div>

      {/* Información del transporte en autobús */}
      <div className={styles.transportItem}>
        <img src="/images/transport/bus.png" alt="Autobús" />
        <h4>{intl.formatMessage({ id: `${transportName}_Bus_Titulo` })}</h4>
        <p>{intl.formatMessage({ id: `${transportName}_Bus_Lineas` })}</p>
      </div>

      {/* Información del servicio de taxi */}
      <div className={styles.transportItem}>
        <img src="/images/transport/taxi.png" alt="Taxi" />
        <h4>{intl.formatMessage({ id: `${transportName}_Taxi_Titulo` })}</h4>
        <p>{intl.formatMessage({ id: `${transportName}_Taxi_Descripcion` })}</p>
      </div>

      {/* Información sobre aparcamiento cercano */}
      <div className={styles.transportItem}>
        <img src="/images/transport/parking.png" alt="Aparcamiento" />
        <h4>{intl.formatMessage({ id: `${transportName}_Aparcamiento_Titulo` })}</h4>
        <p>{intl.formatMessage({ id: `${transportName}_Aparcamiento_Descripcion` })}</p>
      </div>
    </div>
  );
};

export default Transport;
