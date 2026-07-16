// components/Loader.tsx

import React from "react";
import styles from "../styles/components/Loader.module.css";
import { useIntl } from "react-intl";

/**
 * Propiedades para el componente Loader.
 * @property {string} [className] - Clase CSS opcional para personalizar el estilo del loader.
 */
export interface LoaderProps {
  className?: string;
}

/**
 * Componente Loader
 *
 * Renderiza un componente de carga (loader) animado, para indicar a los usuarios que
 * una operación está en proceso. El loader consiste en tres elementos circulares animados.
 * Se puede pasar una clase opcional para modificar el estilo.
 *
 * @param {LoaderProps} props - Propiedades del componente Loader.
 * @returns {React.JSX.Element} Indicador de carga animado.
 */
const Loader: React.FC<LoaderProps> = ({ className }: LoaderProps): React.JSX.Element => {
  const intl = useIntl();
  const loadingText = intl.formatMessage({ id: "Map_Loading_Texto" });
  let loaderClasses = styles.loader;
  if (className) {
    loaderClasses = `${styles.loader} ${styles[className]}`;
  }
  return (
    <div className={loaderClasses} role="status" aria-live="polite" aria-atomic="true">
      <span className={styles.visuallyHidden}>{loadingText}</span>
      <span className={styles.loader_element} aria-hidden="true"></span>
      <span className={styles.loader_element} aria-hidden="true"></span>
      <span className={styles.loader_element} aria-hidden="true"></span>
    </div>
  );
};

export default Loader;
