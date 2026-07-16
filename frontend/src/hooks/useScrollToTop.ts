// hooks/useScrollToTop.ts

import { useState, useEffect } from "react";
import useScreenSize from "./useScreenSize";
import { getMotionSafeScrollBehavior } from "../utils/motion";

/**
 * Tipos de posicionamiento del botón según el dispositivo y la situación.
 */
export type ButtonPosition = "desktop" | "tablet" | "mobile" | "mobileNearFooter" | "mobileLandscape";

/**
 * Interface que define la salida del hook useScrollToTop
 */
export interface UseScrollToTopOutput {
  isScrollButtonVisible: boolean; // Determina si el botón debe ser visible
  buttonPosition: ButtonPosition; // Posicionamiento dinámico del botón
  scrollToTop: () => void; // Función que realiza el scroll hacia arriba
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

  // Obtener información de la pantalla usando el hook useScreenSize
  const { isMobile, isTablet, isMobileLandscape } = useScreenSize();

  useEffect(() => {
    if (typeof window !== "undefined") {
      /**
       * Función que maneja el evento de scroll y actualiza la visibilidad y el posicionamiento del botón.
       */
      const handleScroll = () => {
        const scrollTop = window.scrollY; // Posición de desplazamiento vertical actual
        const viewportHeight = window.innerHeight; // Altura de la ventana de visualización
        const documentHeight = document.documentElement.scrollHeight; // Altura total del documento

        // Altura del footer según el caso
        const footerHeight = isMobileLandscape ? 80 : isMobile ? 100 : 60;
        const scrollTrigger = 400; // Punto de desplazamiento donde aparece el botón

        if (scrollTop > scrollTrigger) {
          setIsScrollButtonVisible(true);
          const distanceFromBottom = documentHeight - (scrollTop + viewportHeight);

          // Determina la posición del botón según el tipo de dispositivo y la posición del scroll
          if (isMobileLandscape) {
            if (distanceFromBottom <= footerHeight) {
              setButtonPosition("tablet");
            } else {
              setButtonPosition("mobile");
            }
          } else if (isMobile) {
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

      // Calcula el estado inicial, incluso si el navegador restaura una posición de scroll previa.
      handleScroll();

      // Actualiza el botón al desplazarse y cuando cambia el tamaño visible de la página.
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll);

      // Limpia los event listeners al desmontar el componente.
      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }
  }, [isMobile, isTablet, isMobileLandscape]); // Dependencias actualizadas

  /**
   * Función que permite desplazarse suavemente al inicio de la página.
   */
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: getMotionSafeScrollBehavior() });
    }
  };

  return { isScrollButtonVisible, buttonPosition, scrollToTop };
};

export default useScrollToTop;
