// hooks/useDeviceType.ts

import { useState, useEffect } from "react";

/**
 * Hook personalizado para detectar el tipo de dispositivo en función del ancho de la ventana.
 * Retorna un valor que indica si el dispositivo es "mobile", "tablet" o "pc".
 *
 * @returns {string} - Tipo de dispositivo ("mobile", "tablet" o "pc").
 */
const useDeviceType = (): string => {
  const [deviceType, setDeviceType] = useState("pc"); // Estado inicial para el tipo de dispositivo

  useEffect(() => {
    /**
     * Actualiza el tipo de dispositivo en función del ancho de la ventana.
     */
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setDeviceType("mobile"); // Dispositivo móvil si el ancho es menor o igual a 768px
      } else if (width > 768 && width <= 1024) {
        setDeviceType("tablet"); // Dispositivo tablet si el ancho es entre 768px y 1024px
      } else {
        setDeviceType("pc"); // Dispositivo de escritorio para anchos mayores a 1024px
      }
    };

    handleResize(); // Llama a la función una vez en la carga inicial
    window.addEventListener("resize", handleResize); // Escucha el evento de cambio de tamaño

    return () => {
      window.removeEventListener("resize", handleResize); // Limpia el evento al desmontar el componente
    };
  }, []);

  return deviceType;
};

export default useDeviceType;
