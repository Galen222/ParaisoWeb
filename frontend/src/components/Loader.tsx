import React from "react";
import styles from "../styles/Loader.module.css";

interface LoaderProps {
  className?: string;
}

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
