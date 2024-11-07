// pages/charcuteria.tsx

import React, { useState, useEffect } from "react";
import type { ComponentType } from "react";
import Loader from "../components/Loader";
import { useFetchCharcuteria } from "../hooks/useFetchCharcuteria";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import useScrollToTop from "../hooks/useScrollToTop";
import errorStyles from "../styles/pages/error.module.css";
import styles from "../styles/pages/charcuteria.module.css";

/**
 * Propiedades para el componente `CharcuteriaPage`.
 * @property {boolean} loadingMessages - Indica si los mensajes están en proceso de carga.
 */
export interface CharcuteriaPageProps {
  loadingMessages: boolean;
}

/**
 * Tipo de componente para `CharcuteriaPage` que incluye una propiedad opcional `pageTitleText`.
 */
export type CharcuteriaPageComponent = ComponentType<CharcuteriaPageProps> & { pageTitleText?: string };

/**
 * Componente funcional para la página de Charcutería.
 * Muestra una lista de productos en tarjetas interactivas, con la opción de voltear en pantallas pequeñas.
 *
 * @param {CharcuteriaPageProps} props - Propiedades para el componente `CharcuteriaPage`.
 * @returns {JSX.Element} Página de Charcutería.
 */
const CharcuteriaPage: CharcuteriaPageComponent = ({ loadingMessages }: CharcuteriaPageProps) => {
  // Hook para obtener los productos de charcutería
  const { data: products, loading: loadingProducts, error } = useFetchCharcuteria();

  // Hook para manejar el botón de desplazamiento hacia arriba
  const { isScrollButtonVisible, scrollButtonStyle, scrollToTop } = useScrollToTop(); // Hook para manejar el botón de scroll

  // Seguimiento de la visita a la página "charcuteria" para análisis interno y Google Analytics
  useVisitedPageTracking("charcuteria");
  useVisitedPageTrackingGA("charcuteria");

  // Estado para habilitar el flip al hacer clic en dispositivos pequeños
  const [isClickFlipEnabled, setIsClickFlipEnabled] = useState<boolean>(window.innerWidth <= 800);

  // Evento de redimensionamiento para activar el flip en dispositivos de pantalla pequeña
  useEffect(() => {
    const handleResize = () => {
      setIsClickFlipEnabled(window.innerWidth <= 800);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Muestra un loader si los mensajes o los productos están en proceso de carga
  if (loadingProducts || loadingMessages) {
    return <Loader className="BD" />;
  }

  // Ruta de la imagen de error
  const imageFileName = "/images/web/error.png";

  // Renderiza un mensaje de error si ocurre un error en la carga de datos
  if (error) {
    return (
      <div className={errorStyles.errorContainer}>
        <p className={errorStyles.errorText}>{error}</p>
        <div className={errorStyles.imageContainer}>
          <img src={imageFileName} alt="Error" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.charcuteriaContainer}>
      <div className={styles.content}>
        {/* Mapeo de los productos de charcutería en tarjetas */}
        {products?.map((product) => (
          <div className={styles.card} key={product.id_producto}>
            <div
              className={styles.cardInner}
              onClick={(e) => {
                // Habilita el flip al hacer clic solo en dispositivos pequeños
                if (isClickFlipEnabled) {
                  const target = e.currentTarget as HTMLElement;
                  target.style.transform = target.style.transform === "rotateY(180deg)" ? "rotateY(0deg)" : "rotateY(180deg)";
                }
              }}
            >
              {/* Lado frontal de la tarjeta con imagen y nombre del producto */}
              <div className={styles.front} style={{ backgroundImage: `url(${product.imagen_url})` }}>
                <p>{product.nombre}</p>
                {product.categoria && <p className={styles.category}>{product.categoria}</p>}
              </div>
              {/* Lado posterior de la tarjeta con descripción del producto */}
              <div className={styles.back}>
                <div>
                  <p className={styles.productName}>{product.nombre}</p>
                  {product.categoria && <p className={styles.category}>{product.categoria}</p>}
                  <p className={styles.descripcion}>{product.descripcion}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Botón de desplazamiento hacia arriba */}
      <div>
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollToTop" style={scrollButtonStyle}>
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

// Define `pageTitleText` como una propiedad estática del componente `CharcuteriaPage`
CharcuteriaPage.pageTitleText = "charcuteria";

export default CharcuteriaPage; // Exporta el componente para su uso en la aplicación
