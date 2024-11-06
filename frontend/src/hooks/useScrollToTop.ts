// hooks/useScrollToTop.ts

import { useState, useEffect } from "react";

/**
 * Interfaz para el valor de retorno del hook `useScrollToTop`.
 * @property {boolean} isScrollButtonVisible - Indica si el botón de desplazamiento al inicio es visible.
 * @property {() => void} scrollToTop - Función para desplazar la página hasta la parte superior.
 */
export interface UseScrollToTopOutput {
  isScrollButtonVisible: boolean;
  scrollToTop: () => void;
}

/**
 * Hook personalizado para controlar la visibilidad de un botón de "volver al inicio"
 * cuando el usuario se desplaza hacia abajo en la página. También proporciona la función
 * para desplazar la página suavemente hasta la parte superior.
 *
 * @returns {UseScrollToTopOutput} Objeto con el estado de visibilidad del botón y la función de desplazamiento al inicio.
 */
const useScrollToTop = (): UseScrollToTopOutput => {
  const [isScrollButtonVisible, setisScrollButtonVisible] = useState<boolean>(false); // Estado de visibilidad del botón

  useEffect(() => {
    /**
     * Función que evalúa la posición de desplazamiento vertical y
     * actualiza la visibilidad del botón si el desplazamiento supera los 400px.
     */
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setisScrollButtonVisible(true);
      } else {
        setisScrollButtonVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility); // Escucha el evento de desplazamiento
    return () => window.removeEventListener("scroll", toggleVisibility); // Limpia el evento al desmontar el componente
  }, []);

  /**
   * Desplaza la página suavemente hasta la parte superior.
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { isScrollButtonVisible, scrollToTop }; // Retorna el estado de visibilidad y la función de desplazamiento
};

export default useScrollToTop;
