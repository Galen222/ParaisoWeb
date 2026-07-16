const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Lee la preferencia actual únicamente cuando existe un navegador. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;

/** Evita desplazamientos animados cuando el usuario ha solicitado reducir el movimiento. */
export const getMotionSafeScrollBehavior = (): ScrollBehavior =>
  prefersReducedMotion() ? "auto" : "smooth";

export { REDUCED_MOTION_QUERY };
