import { useSyncExternalStore } from "react";
import { REDUCED_MOTION_QUERY } from "../utils/motion";

const subscribe = (onStoreChange: () => void): (() => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
};

const getSnapshot = (): boolean =>
  typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;

// Durante SSR y la hidratación inicial se usa el modo conservador para no iniciar
// movimiento antes de conocer la preferencia real del navegador.
const getServerSnapshot = (): boolean => true;

/** Mantiene sincronizada la preferencia de movimiento sin listeners huérfanos. */
const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export default usePrefersReducedMotion;
