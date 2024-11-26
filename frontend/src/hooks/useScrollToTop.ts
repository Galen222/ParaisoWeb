// hooks/UseScrollToTop.ts

import { useState, useEffect } from "react";

/**
 * Tipos de posicionamiento del botón según el dispositivo y la situación
 */
type ButtonPosition = "desktop" | "tablet" | "mobile" | "mobileNearFooter";

/**
 * Interface que define la salida del hook useScrollToTop
 */
export interface UseScrollToTopOutput {
  isScrollButtonVisible: boolean;
  buttonPosition: ButtonPosition;
  scrollToTop: () => void;
}

/**
 * Hook personalizado que gestiona la visibilidad y el posicionamiento del botón para
 * desplazarse al inicio de la página.
 *
 * Este hook maneja:
 * - La visibilidad del botón basada en el scroll
 * - El posicionamiento responsivo según el tipo de dispositivo
 * - La lógica de desplazamiento suave hacia arriba
 *
 * @returns {UseScrollToTopOutput} Un objeto que contiene la visibilidad del botón,
 * su posición actual y la función para desplazarse al inicio.
 */
const useScrollToTop = (): UseScrollToTopOutput => {
  // Estado que indica si el botón de desplazamiento es visible
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState<boolean>(false);
  // Estado que contiene la clase de posicionamiento actual del botón
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition>("desktop");
  // Estados que determinan el tipo de dispositivo
  const [isMobile, setIsMobile] = useState<boolean>(false);
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
       * Función que maneja el evento de scroll y actualiza la visibilidad y el posicionamiento del botón.
       */
      const handleScroll = () => {
        const scrollTop = window.scrollY; // Posición de desplazamiento vertical actual
        const viewportHeight = window.innerHeight; // Altura de la ventana de visualización
        const documentHeight = document.documentElement.scrollHeight; // Altura total del documento
        const footerHeight = isMobile ? 100 : 60; // 100px en móviles, 60px en tablets y escritorio
        const scrollTrigger = 400; // Punto de desplazamiento donde aparece el botón

        if (scrollTop > scrollTrigger) {
          setIsScrollButtonVisible(true);
          const distanceFromBottom = documentHeight - (scrollTop + viewportHeight);

          // Determina la posición del botón según el tipo de dispositivo y la posición del scroll
          if (isMobile) {
            if (distanceFromBottom <= footerHeight) {
              setButtonPosition("mobileNearFooter");
            } else {
              setButtonPosition("mobile");
            }
          } else if (isTablet) {
            setButtonPosition("tablet");
          } else {
            setButtonPosition("desktop");
          }
        } else {
          setIsScrollButtonVisible(false);
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

  return { isScrollButtonVisible, buttonPosition, scrollToTop };
};

export default useScrollToTop;
