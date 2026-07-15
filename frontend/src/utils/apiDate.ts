/**
 * Normaliza fechas ISO/MySQL para que se interpreten de la misma forma en Node.js
 * y en navegadores que no aceptan el separador de espacio de MySQL.
 */
export const normalizeApiDateValue = (value: string): string => {
  const trimmedValue = value.trim();
  const normalizedSeparator = trimmedValue.replace(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/,
    "$1T$2"
  );
  const hasTimeComponent = /T\d{2}:\d{2}/.test(normalizedSeparator);
  const hasExplicitTimeZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalizedSeparator);

  return hasTimeComponent && !hasExplicitTimeZone
    ? `${normalizedSeparator}Z`
    : normalizedSeparator;
};

/** Comprueba que la API haya devuelto una fecha real y no solo una cadena. */
export const isValidApiDateString = (value: unknown): value is string => {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  return !Number.isNaN(Date.parse(normalizeApiDateValue(value)));
};
