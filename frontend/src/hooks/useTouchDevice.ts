// hooks/useTouchDevice.ts

import { useEffect, useState } from "react";

/**
 * Hook personalizado que proporciona información sobre el soporte de pantalla tactil.
 *
 * @returns {boolean} - Devuelve true si el dispositivo es tactil, false sino lo es.
 */
const useTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      // ontouchstart en window cubre la mayoría de navegadores y dispositivos
      // navigator.maxTouchPoints cubre algunos dispositivos/navegadores más recientes
      setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }
  }, []);
  return isTouch;
};
export default useTouchDevice;
