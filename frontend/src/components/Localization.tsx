// components/Localization.tsx

import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/components/Localization.module.css"; // Crea un archivo CSS o reutiliza uno existente

/**
 * Propiedades para el componente Localization.
 * @property {string} localizationName - Nombre del lugar o ubicación para mostrar información localizada.
 * Este valor se utiliza como parte de los identificadores de traducción para obtener el contenido específico.
 */
interface LocalizationProps {
  localizationName: string;
}

/**
 * Componente Localization
 *
 * Muestra información localizada de contacto sobre una ubicación específica, incluyendo dirección, teléfono y horario.
 * La información se obtiene dinámicamente usando el identificador `localizationName` para adaptarse a múltiples ubicaciones.
 *
 * @param {LocalizationProps} props - Propiedades del componente Localization.
 * @returns {JSX.Element} Información de contacto localizada para la ubicación especificada.
 */
const Localization: React.FC<LocalizationProps> = ({ localizationName }) => {
  const intl = useIntl(); // Hook para obtener mensajes localizados

  return (
    <div className={styles.localesContainer}>
      <div className={styles.contactLocation}>
        {/* Título de la sección, usando el nombre de la ubicación */}
        <h3 className="text-center">{intl.formatMessage({ id: `contacto_Informacion_${localizationName}_Titulo` })}</h3>

        {/* Dirección de la ubicación */}
        <p>
          <span className="fw-bold">{intl.formatMessage({ id: `contacto_Informacion_${localizationName}_Direccion_Texto` })}</span>
          {intl.formatMessage({ id: `contacto_Informacion_${localizationName}_Direccion_Calle` })}
        </p>

        {/* Teléfono de la ubicación con enlace para realizar llamada */}
        <p>
          <span className="fw-bold">{intl.formatMessage({ id: `contacto_Informacion_${localizationName}_Telefono_Texto` })}</span>
          <a className={styles.link} href="tel:+345539783">
            {intl.formatMessage({ id: `contacto_Informacion_${localizationName}_Telefono_Numero` })}
          </a>
        </p>

        {/* Horario de atención de la ubicación */}
        <p>
          <span className="fw-bold">{intl.formatMessage({ id: `contacto_Informacion_${localizationName}_Horario_Texto` })}</span>
          {intl.formatMessage({ id: `contacto_Informacion_${localizationName}_Horario_Numero` })}
        </p>
      </div>
    </div>
  );
};

export default Localization;
