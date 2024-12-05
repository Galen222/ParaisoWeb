// components/Transport.tsx

import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/components/Transport.module.css"; // Crea un archivo CSS o reutiliza uno existente

/**
 * Propiedades para el componente Transport.
 * @property {string} transportName - Nombre del lugar o ubicación para mostrar información de transporte relacionada.
 * Este valor se utiliza como parte de los identificadores de traducción para obtener el contenido específico.
 */
export interface TransportProps {
  transportName: string;
}

/**
 * Componente Transport
 *
 * Renderiza información sobre opciones de transporte cercanas a una ubicación específica,
 * como líneas de metro, autobuses, taxis y aparcamiento. Cada opción incluye un ícono,
 * un título y una descripción, todos los textos están internacionalizados.
 *
 * @param {TransportProps} props - Propiedades del componente Transport.
 * @returns {JSX.Element} Información de transporte para la ubicación especificada.
 */
const Transport: React.FC<TransportProps> = ({ transportName }: TransportProps): JSX.Element => {
  const intl = useIntl(); // Hook para obtener mensajes localizados

  // Variables para las imágenes y los textos alternativos internacionalizados
  const imageMetro = "/images/transport/metro.png";
  const imageMetroAlt = intl.formatMessage({ id: `${transportName}_Metro_Titulo`, defaultMessage: "Metro" });

  const imageBus = "/images/transport/bus.png";
  const imageBusAlt = intl.formatMessage({ id: `${transportName}_Bus_Titulo`, defaultMessage: "Autobús" });

  const imageTaxi = "/images/transport/taxi.png";
  const imageTaxiAlt = intl.formatMessage({ id: `${transportName}_Taxi_Titulo`, defaultMessage: "Taxi" });

  const imageParking = "/images/transport/parking.png";
  const imageParkingAlt = intl.formatMessage({ id: `${transportName}_Aparcamiento_Titulo`, defaultMessage: "Aparcamiento" });

  return (
    <div className={styles.transportContainer}>
      {/* Información del transporte en metro */}
      <div className={styles.transportItem}>
        <img src={imageMetro} alt={imageMetroAlt} />
        <h4>{intl.formatMessage({ id: `${transportName}_Metro_Titulo` })}</h4>
        <p>{intl.formatMessage({ id: `${transportName}_Metro_Lineas` })}</p>
      </div>

      {/* Información del transporte en autobús */}
      <div className={styles.transportItem}>
        <img src={imageBus} alt={imageBusAlt} />
        <h4>{intl.formatMessage({ id: `${transportName}_Bus_Titulo` })}</h4>
        <p>{intl.formatMessage({ id: `${transportName}_Bus_Lineas` })}</p>
      </div>

      {/* Información del servicio de taxi */}
      <div className={styles.transportItem}>
        <img src={imageTaxi} alt={imageTaxiAlt} />
        <h4>{intl.formatMessage({ id: `${transportName}_Taxi_Titulo` })}</h4>
        <p>{intl.formatMessage({ id: `${transportName}_Taxi_Descripcion` })}</p>
      </div>

      {/* Información sobre aparcamiento cercano */}
      <div className={styles.transportItem}>
        <img src={imageParking} alt={imageParkingAlt} />
        <h4>{intl.formatMessage({ id: `${transportName}_Aparcamiento_Titulo` })}</h4>
        <p>{intl.formatMessage({ id: `${transportName}_Aparcamiento_Descripcion` })}</p>
      </div>
    </div>
  );
};

export default Transport;
