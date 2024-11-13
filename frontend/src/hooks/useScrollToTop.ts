import { useState, useEffect } from "react";

export interface UseScrollToTopOutput {
  isScrollButtonVisible: boolean;
  scrollButtonStyle: React.CSSProperties;
  scrollToTop: () => void;
}

/**
 * Hook personalizado que gestiona la visibilidad y el estilo de un botón para desplazarse al inicio de la página.
 *
 * @returns {UseScrollToTopOutput} Un objeto que contiene la visibilidad del botón, el estilo del botón y la función para desplazarse al inicio.
 */
const useScrollToTop = (): UseScrollToTopOutput => {
  // Estado que indica si el botón de desplazamiento es visible
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState<boolean>(false);
  // Estado que contiene el estilo actual del botón de desplazamiento
  const [scrollButtonStyle, setScrollButtonStyle] = useState<React.CSSProperties>({});
  // Estado que determina si el dispositivo es un móvil
  const [isMobile, setIsMobile] = useState<boolean>(false);
  // Estado que determina si el dispositivo es una tablet
  const [isTablet, setIsTablet] = useState<boolean>(false);

  /**
   * Función para verificar el tamaño de la pantalla y actualizar los estados relevantes.
   */
  const checkScreenSize = () => {
    if (typeof window !== "undefined") {
      const screenWidth = window.innerWidth;
      const mobileScreen = screenWidth <= 768;
      const tabletScreen = screenWidth > 768 && screenWidth <= 1024;

      setIsMobile(mobileScreen);
      setIsTablet(tabletScreen);
    }
  };

  useEffect(() => {
    // Verifica el tamaño de la pantalla al cargar el componente
    if (typeof window !== "undefined") {
      checkScreenSize();

      /**
       * Función que maneja el evento de scroll y actualiza la visibilidad y el estilo del botón.
       */
      const handleScroll = () => {
        const scrollTop = window.scrollY; // Posición de desplazamiento vertical actual
        const viewportHeight = window.innerHeight; // Altura de la ventana de visualización
        const documentHeight = document.documentElement.scrollHeight; // Altura total del documento

        // Determina la altura del footer según el dispositivo
        const footerHeight = isMobile ? 80 : 60; // 80px en móviles, 60px en tablets y escritorio

        const distanceToStickAboveFooter = 20; // Distancia del botón al footer
        const scrollTrigger = 400; // Punto de desplazamiento donde aparece el botón

        if (scrollTop > scrollTrigger) {
          setIsScrollButtonVisible(true); // Muestra el botón de desplazamiento
          const distanceFromBottom = documentHeight - (scrollTop + viewportHeight); // Distancia desde la parte inferior del documento

          let bottomPosition = "20px"; // Posición por defecto del botón desde abajo
          let rightPosition = "20px"; // Posición del botón desde la derecha

          if (isMobile) {
            // Ajustes para dispositivos móviles
            if (distanceFromBottom <= footerHeight) {
              bottomPosition = `${footerHeight - distanceFromBottom + distanceToStickAboveFooter}px`;
            }
          } else {
            // Ajustes para tablets y escritorio
            if (isTablet) {
              rightPosition = "20px"; // Posición a 20px desde la derecha en tablets
            } else {
              rightPosition = "calc(25% + 20px)"; // Posición en escritorio
            }
            bottomPosition = "80px"; // Posición fija desde abajo
            // No ajustamos bottomPosition al acercarnos al footer porque el footer es fijo
          }

          // Actualiza el estilo del botón
          setScrollButtonStyle({
            position: "fixed",
            bottom: bottomPosition,
            right: rightPosition,
            transition: "all 0.3s ease-in-out",
            opacity: 1,
            pointerEvents: "auto",
          });
        } else {
          // Oculta el botón si no se ha alcanzado el punto de activación
          setIsScrollButtonVisible(false);
          setScrollButtonStyle({
            opacity: 0,
            pointerEvents: "none",
          });
        }
      };

      // Agrega los event listeners para los eventos de scroll y resize
      window.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", () => {
        checkScreenSize();
        handleScroll();
      });

      // Limpia los event listeners al desmontar el componente
      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", checkScreenSize);
      };
    }
  }, [isMobile, isTablet]);

  /**
   * Función que permite desplazarse suavemente al inicio de la página.
   */
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return { isScrollButtonVisible, scrollButtonStyle, scrollToTop };
};

export default useScrollToTop;
