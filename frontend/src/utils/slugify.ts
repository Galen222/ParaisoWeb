// frontend/src/utils/slugify.ts

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Normaliza el texto
    .replace(/[\u0300-\u036f]/g, "") // Remueve diacríticos
    .replace(/\s+/g, "-") // Reemplaza espacios con guiones
    .replace(/[^\w\-]+/g, "") // Remueve caracteres no válidos
    .replace(/\-\-+/g, "-") // Reemplaza múltiples guiones por uno solo
    .replace(/^-+/, "") // Remueve guiones al inicio
    .replace(/-+$/, ""); // Remueve guiones al final
};
