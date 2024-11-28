// hooks/useWindowSize.ts

import { useState, useEffect } from "react";

const useWindowSize = () => {
  // Inicializar con undefined para evitar errores de hidratación
  const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Esta función solo se ejecutará en el cliente
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }

    // Evento para cambios de orientación
    function handleOrientationChange() {
      // Pequeño retraso para asegurar que window.innerWidth se ha actualizado
      setTimeout(handleResize, 100);
    }

    // Establecer el ancho inicial
    handleResize();

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []); // Array vacío significa que este efecto se ejecuta solo una vez al montar

  return windowWidth;
};

export default useWindowSize;
