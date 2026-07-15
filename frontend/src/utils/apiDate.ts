/**
 * Normaliza fechas ISO/MySQL para que se interpreten de la misma forma en Node.js
 * y en navegadores que no aceptan el separador de espacio de MySQL.
 */
export const normalizeApiDateValue = (value: string): string => {
  const trimmedValue = value.trim();
  const normalizedSeparator = trimmedValue.replace(
    /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/,
    "$1T$2"
  );
  const hasTimeComponent = /T\d{2}:\d{2}/.test(normalizedSeparator);
  const hasExplicitTimeZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalizedSeparator);

  return hasTimeComponent && !hasExplicitTimeZone
    ? `${normalizedSeparator}Z`
    : normalizedSeparator;
};

const API_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-](\d{2}):?(\d{2}))?)?$/i;

/** Comprueba calendario, hora y zona en lugar de aceptar cualquier texto que Date.parse normalice. */
export const isValidApiDateString = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmedValue = value.trim();
  const match = API_DATE_PATTERN.exec(trimmedValue);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) {
    return false;
  }

  if (match[4] !== undefined) {
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = Number(match[6]);
    if (hour > 23 || minute > 59 || second > 59) {
      return false;
    }

    if (match[8] && match[8].toUpperCase() !== "Z") {
      const offsetHour = Number(match[9]);
      const offsetMinute = Number(match[10]);
      if (offsetHour > 23 || offsetMinute > 59) {
        return false;
      }
    }
  }

  return !Number.isNaN(Date.parse(normalizeApiDateValue(trimmedValue)));
};
