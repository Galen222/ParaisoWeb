import { normalizeApiDateValue } from "./apiDate";

/**
 * Formatea una fecha del blog sin depender de la zona horaria local del proceso.
 * Devuelve una cadena vacía si el backend entrega un valor no interpretable.
 */
export const formatBlogDate = (value: string, locale: string): string => {
  const date = new Date(normalizeApiDateValue(value));
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(date);
};
