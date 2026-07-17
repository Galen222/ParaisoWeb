/** Contrato mínimo compartido por los loggers de navegador y servidor. */
export interface AppLogger {
  debug: (...values: unknown[]) => void;
  info: (...values: unknown[]) => void;
  warn: (...values: unknown[]) => void;
  error: (...values: unknown[]) => void;
}
