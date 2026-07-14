// hooks/useTouchDevice.ts

import { useSyncExternalStore } from "react";

const subscribeToTouchCapability = (): (() => void) => {
  // La capacidad táctil se comprueba una sola vez, igual que en la implementación anterior.
  return () => undefined;
};

const getTouchCapability = (): boolean => {
  // ontouchstart en window cubre la mayoría de navegadores y dispositivos
  // navigator.maxTouchPoints cubre algunos dispositivos/navegadores más recientes
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

const getServerTouchCapability = (): boolean => false;

/**
 * Hook personalizado que proporciona información sobre el soporte de pantalla tactil.
 *
 * @returns {boolean} - Devuelve true si el dispositivo es tactil, false sino lo es.
 */
const useTouchDevice = (): boolean =>
  useSyncExternalStore(
    subscribeToTouchCapability,
    getTouchCapability,
    getServerTouchCapability
  );

export default useTouchDevice;
