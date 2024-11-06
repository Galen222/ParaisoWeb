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
 * @returns {JSX.Element} Título animado o estático según el estado del modal de cookies.
 */
const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ pageTitleText, cookiesModalClosed }: AnimatedTitleProps): JSX.Element => {
  // `intl` es una instancia del hook useIntl, utilizada para obtener mensajes localizados.
  const intl = useIntl();

  return (
    <div className={styles.animationContainer}>
      <h1>
        {/* Verifica si el modal de cookies está cerrado. Si es verdadero, muestra el título animado */}
        {cookiesModalClosed ? (
          <div className={styles.animationTime}>
            {/* Primera línea del texto del título con animación de entrada desde la izquierda */}
            <div className="animate__animated animate__fadeInLeft">
              <div className={styles.animationFont}>{intl.formatMessage({ id: `${pageTitleText}_Titulo_Texto1` })}</div>
            </div>
            {/* Segunda línea del texto del título con animación de entrada desde la derecha, con 1 segundo de retraso */}
            <div className="animate__animated animate__fadeInRight animate__delay-1s">
              <div className={styles.animationFont}>{intl.formatMessage({ id: `${pageTitleText}_Titulo_Texto2` })}</div>
            </div>
          </div>
        ) : (
          // Si el modal de cookies no está cerrado, muestra el texto del título estático sin animaciones
          <div>
            <div className={styles.animationFont}>{intl.formatMessage({ id: `${pageTitleText}_Titulo_Texto1` })}</div>
            <div className={styles.animationFont}>{intl.formatMessage({ id: `${pageTitleText}_Titulo_Texto2` })}</div>
          </div>
        )}
      </h1>
    </div>
  );
};

export default AnimatedTitle;
