/**
 * Normaliza fechas ISO de MySQL/Pydantic para que los valores sin zona horaria
 * se interpreten como UTC tanto en Node.js como en el navegador.
 */
const normalizeBlogDateValue = (value: string): string => {
  const trimmedValue = value.trim();
  const hasTimeComponent = /[T ]\d{2}:\d{2}/.test(trimmedValue);
  const hasExplicitTimeZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmedValue);

  return hasTimeComponent && !hasExplicitTimeZone ? `${trimmedValue}Z` : trimmedValue;
};

/**
 * Formatea una fecha del blog sin depender de la zona horaria local del proceso.
 * Devuelve una cadena vacía si el backend entrega un valor no interpretable.
 */
export const formatBlogDate = (value: string, locale: string): string => {
  const date = new Date(normalizeBlogDateValue(value));
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
