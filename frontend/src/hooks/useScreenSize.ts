// hooks/useScreenSize.ts

import { useState, useEffect } from "react";

/**
 * Interface que define la información de la pantalla
 */
export interface ScreenInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isPC: boolean;
  isMobileLandscape: boolean;
}

/**
 * Hook personalizado que proporciona información completa sobre el tamaño y tipo de pantalla.
 * Proporciona información sobre dimensiones, tipo de dispositivo y orientación.
 *
 * @returns {ScreenInfo} Objeto con información detallada sobre la pantalla
 */
const INITIAL_SCREEN_INFO: ScreenInfo = {
  width: 1200,
  height: 800,
  isMobile: false,
  isTablet: false,
  isPC: true,
  isMobileLandscape: false,
};

const useScreenSize = (): ScreenInfo => {
  // Inicializar con valores deterministas e iguales en servidor y cliente para evitar errores de hidratación
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>(INITIAL_SCREEN_INFO);

  useEffect(() => {
    /**
     * Actualiza toda la información de la pantalla
     */
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Detectar dispositivos según el tamaño de pantalla
      const isMobile = width <= 768;
      const isTablet = width > 768 && width <= 1024;
      const isPC = width > 1024;

      // Replicar la lógica original de dispositivo en landscape
      const isMobileLandscape = width <= 1024 && height <= 768 && width > height;

      setScreenInfo({
        width,
        height,
        isMobile,
        isTablet,
        isPC,
        isMobileLandscape,
      });
    };

    // Actualizar en el montaje inicial
    if (typeof window !== "undefined") {
      updateScreenInfo();

      let orientationTimeoutId: number | undefined;
      const handleOrientationChange = () => {
        // Pequeño retraso para asegurar que window.innerWidth se ha actualizado
        if (orientationTimeoutId !== undefined) {
          window.clearTimeout(orientationTimeoutId);
        }
        orientationTimeoutId = window.setTimeout(updateScreenInfo, 100);
      };

      // Manejar cambios de tamaño y orientación
      window.addEventListener("resize", updateScreenInfo);
      window.addEventListener("orientationchange", handleOrientationChange);

      return () => {
        window.removeEventListener("resize", updateScreenInfo);
        window.removeEventListener("orientationchange", handleOrientationChange);
        if (orientationTimeoutId !== undefined) {
          window.clearTimeout(orientationTimeoutId);
        }
      };
    }
  }, []);

  return screenInfo;
};

export default useScreenSize;
