import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/Localization.module.css"; // Crea un archivo CSS o reutiliza uno existente

interface LocalizationProps {
  localizationName: string;
}

const Localization: React.FC<LocalizationProps> = ({ localizationName }) => {
  const intl = useIntl();

  return (
    <div className={styles.localesContainer}>
      <div className={styles.contactLocation}>
        <h3 className="text-center">{intl.formatMessage({ id: `contacto_Informacion_${localizationName}_Titulo` })}</h3>
        <p>
          <span className="fw-bold">{intl.formatMessage({ id: `contacto_Informacion_${localizationName}_Direccion_Texto` })}</span>
          {intl.formatMessage({ id: `contacto_Informacion_${localizationName}_Direccion_Calle` })}
        </p>
        <p>
          <span className="fw-bold">{intl.formatMessage({ id: `contacto_Informacion_${localizationName}_Telefono_Texto` })}</span>
          <a className={styles.link} href="tel:+345539783">
            {intl.formatMessage({ id: `contacto_Informacion_${localizationName}_Telefono_Numero` })}
          </a>
        </p>
        <p>
          <span className="fw-bold">{intl.formatMessage({ id: `contacto_Informacion_${localizationName}_Horario_Texto` })}</span>
          {intl.formatMessage({ id: `contacto_Informacion_${localizationName}_Horario_Numero` })}
        </p>
      </div>
    </div>
  );
};

export default Localization;
