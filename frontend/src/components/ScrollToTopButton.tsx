// components/ScrollToTopButton.tsx

import React from "react";
import { useIntl } from "react-intl";
import useScrollToTop from "../hooks/useScrollToTop"; // Importa el hook personalizado
import styles from "../styles/components/ScrollToTopButton.module.css";

/**
 * Componente `ScrollToTopButton`.
 * Muestra un botón que permite al usuario desplazarse hacia la parte superior de la página.
 * Utiliza el hook `useScrollToTop` para gestionar la visibilidad y el posicionamiento del botón.
 *
 * @returns {JSX.Element | null} Botón de scroll-to-top o null si no es visible.
 */
const ScrollToTopButton: React.FC = (): JSX.Element | null => {
  const intl = useIntl(); // Hook para la internacionalización
  const { isScrollButtonVisible, buttonPosition, scrollToTop } = useScrollToTop(); // Hook para manejar el botón de scroll

  // Imagen y texto alternativo del botón
  const scrollButtonImage = {
    src: "/images/web/flechaArriba.png",
    alt: intl.formatMessage({ id: "scrollToTop_Alt", defaultMessage: "Subir" }),
  };

  // Si el botón no es visible, no renderiza nada
  if (!isScrollButtonVisible) {
    return null;
  }

  return (
    <div className={styles.scrollToTopContainer}>
      <button
        onClick={scrollToTop}
        className={`
          ${styles.scrollToTop} 
          ${styles[buttonPosition]} 
          ${isScrollButtonVisible ? styles.visible : styles.hidden}
        `}
      >
        <img src={scrollButtonImage.src} alt={scrollButtonImage.alt} /> {/* Botón para desplazarse hacia arriba */}
      </button>
    </div>
  );
};

export default ScrollToTopButton; // Exporta el componente para su uso en otras partes de la aplicación
