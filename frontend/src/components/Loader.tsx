// components/Loader.tsx

import React from "react";
import styles from "../styles/components/Loader.module.css";

/**
 * Propiedades para el componente Loader.
 * @property {string} [className] - Clase CSS opcional para personalizar el estilo del loader.
 */
interface LoaderProps {
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
 * @returns {JSX.Element} Indicador de carga animado.
 */
const Loader: React.FC<LoaderProps> = ({ className }) => {
  return (
    <div className={`${styles.loader} ${className ? className : ""}`}>
      <span className={styles.loader_element}></span>
      <span className={styles.loader_element}></span>
      <span className={styles.loader_element}></span>
    </div>
  );
};

export default Loader;
