// components/AnimatedTitle.tsx

import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/components/AnimatedTitle.module.css";

/**
 * Propiedades para el componente AnimatedTitle
 * @property {string} pageTitleText - Identificador base para el texto del título de la página en varios idiomas.
 * @property {boolean} cookiesModalClosed - Indica si el modal de cookies ha sido cerrado.
 */
export interface AnimatedTitleProps {
  pageTitleText: string;
  cookiesModalClosed: boolean;
}

/**
 * Componente AnimatedTitle
 *
 * Muestra un título animado que varía según el estado del modal de cookies.
 * Si el modal de cookies está cerrado, el título se muestra con un efecto de entrada;
 * de lo contrario, se muestra el texto estático.
 *
 * @param {AnimatedTitleProps} props - Propiedades para el componente AnimatedTitle.
 * @returns {React.JSX.Element} Título animado o estático según el estado del modal de cookies.
 */
const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ pageTitleText, cookiesModalClosed }: AnimatedTitleProps): React.JSX.Element => {
  // `intl` es una instancia del hook useIntl, utilizada para obtener mensajes localizados.
  const intl = useIntl();

  return (
    <div className={styles.animationContainer}>
      <div aria-hidden="true">
        {/* Verifica si el modal de cookies está cerrado. Si es verdadero, muestra el título animado */}
        {cookiesModalClosed ? (
          <span className={styles.animationTime}>
            {/* Primera línea del texto del título con animación de entrada desde la izquierda */}
            <span className="animate__animated animate__fadeInLeft">
              <span className={styles.animationFont}>{intl.formatMessage({ id: `${pageTitleText}_Titulo_Texto1` })}</span>
            </span>
            {/* Segunda línea del texto del título con animación de entrada desde la derecha, con 1 segundo de retraso */}
            <span className="animate__animated animate__fadeInRight animate__delay-1s">
              <span className={styles.animationFont}>{intl.formatMessage({ id: `${pageTitleText}_Titulo_Texto2` })}</span>
            </span>
          </span>
        ) : (
          // Si el modal de cookies no está cerrado, muestra el texto del título estático sin animaciones
          <span>
            <span className={styles.animationFont}>{intl.formatMessage({ id: `${pageTitleText}_Titulo_Texto1` })}</span>
            <span className={styles.animationFont}>{intl.formatMessage({ id: `${pageTitleText}_Titulo_Texto2` })}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default AnimatedTitle;
