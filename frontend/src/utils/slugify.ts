// utils/slugify.ts

/**
 * Convierte una cadena de texto en un slug amigable para URLs.
 *
 * Este método transforma el texto proporcionado en una versión adecuada para ser utilizada en URLs,
 * reemplazando espacios por guiones, eliminando caracteres no válidos y normalizando el texto.
 *
 * @param {string} text - El texto a convertir en slug.
 * @returns {string} - El slug generado a partir del texto proporcionado.
 *
 * @example
 * ```typescript
 * const slug = slugify("Hola Mundo!");
 * console.log(slug); // Output: "hola-mundo"
 * ```
 */
export const slugify = (text: string): string => {
  return text
    .toString() // Asegura que el input sea una cadena de texto.
    .toLowerCase() // Convierte todo el texto a minúsculas.
    .normalize("NFD") // Normaliza el texto para separar los caracteres base de los diacríticos.
    .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos.
    .replace(/\s+/g, "-") // Reemplaza uno o más espacios en blanco por un solo guión.
    .replace(/[^\w\-]+/g, "") // Elimina todos los caracteres que no sean letras, números o guiones.
    .replace(/\-\-+/g, "-") // Reemplaza múltiples guiones consecutivos por uno solo.
    .replace(/^-+/, "") // Elimina guiones al inicio de la cadena.
    .replace(/-+$/, ""); // Elimina guiones al final de la cadena.
};
