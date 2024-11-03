// services/charcuteriaService.ts

import axios from "axios";

/**
 * Interfaz para representar los datos de un producto de charcutería.
 */
export interface CharcuteriaProduct {
  id_producto: number; // Identificador único del producto.
  nombre: string; // Nombre del producto.
  descripcion: string; // Descripción del producto.
  imagen_url?: string; // URL de la imagen del producto (opcional).
  categoria?: string; // Categoría del producto (opcional).
  fecha: string; // Fecha de disponibilidad o de publicación del producto.
}

/**
 * URL base de la API de charcutería, obtenida desde una variable de entorno.
 */
const API_URL = process.env.NEXT_PUBLIC_API_CHARCUTERIA_URL;

// Verifica que la URL de la API esté definida en las variables de entorno.
if (!API_URL) {
  throw new Error("La variable de entorno NEXT_PUBLIC_API_CHARCUTERIA_URL no está definida.");
}

/**
 * Obtiene la lista de productos de charcutería en el idioma especificado.
 *
 * @param {string} idioma - El idioma en el cual se desean obtener los productos.
 * @returns {Promise<CharcuteriaProduct[]>} - Una promesa que resuelve a un array de objetos CharcuteriaProduct.
 */
export const getCharcuteriaProducts = async (idioma: string): Promise<CharcuteriaProduct[]> => {
  try {
    // Realiza la solicitud GET a la API incluyendo el idioma como parámetro de consulta.
    const response = await axios.get<CharcuteriaProduct[]>(`${API_URL}?idioma=${idioma}`);
    return response.data;
  } catch (error) {
    /* console.error("Error recibiendo los productos de charcuteria:", error); */
    throw error;
  }
};
