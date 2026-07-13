// utils/slugify.ts

/**
 * Convierte una cadena de texto en un slug amigable para URLs.
 *
 * Este método transforma el texto proporcionado en una versión adecuada para ser utilizada en URLs,
 * reemplazando espacios por guiones, eliminando caracteres no válidos y normalizando el texto.
 *
 * @param {string} text - El texto a convertir en slug.
 * @param {string} [fallback="n-a"] - Slug de respaldo si el resultado quedara vacío.
 * @returns {string} - El slug generado a partir del texto proporcionado.
 *
 * @example
 * const slug = slugify("Hola Mundo!");
 * console.log(slug); // Output: "hola-mundo"
 */
export const slugify = (text: string, fallback = "n-a"): string => {
  const slug = text
    .toString() // Asegura que el input sea una cadena de texto.
    .trim()
    .toLowerCase() // Convierte todo el texto a minúsculas.
    // Reemplaza letras alemanas y ñ
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/ñ/g, "n")
    .normalize("NFD") // Normaliza el texto para separar los caracteres base de los diacríticos.
    .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos.
    .replace(/\s+/g, "-") // Reemplaza uno o más espacios en blanco por un solo guión.
    .replace(/[^a-z0-9-]+/g, "") // Elimina todos los caracteres que no sean letras, números o guiones.
    .replace(/-+/g, "-") // Reemplaza múltiples guiones consecutivos por uno solo.
    .replace(/^-+/, "") // Elimina guiones al inicio de la cadena.
    .replace(/-+$/, ""); // Elimina guiones al final de la cadena.

  // Evitar slug vacío para pasar la validación que exige 1+ caracteres
  return slug || fallback;
};
