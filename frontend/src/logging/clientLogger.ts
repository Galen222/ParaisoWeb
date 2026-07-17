import type { AppLogger } from "./appLogger";

const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Logger seguro para código que puede ejecutarse en el navegador.
 * En producción se ocultan únicamente los mensajes informativos propios;
 * advertencias, errores controlados y errores nativos siguen visibles en DevTools.
 */
export const clientLogger: AppLogger = {
  debug: (...values: unknown[]): void => {
    if (isDevelopment) {
      console.debug(...values);
    }
  },
  info: (...values: unknown[]): void => {
    if (isDevelopment) {
      console.info(...values);
    }
  },
  warn: (...values: unknown[]): void => {
    console.warn(...values);
  },
  error: (...values: unknown[]): void => {
    console.error(...values);
  },
};
