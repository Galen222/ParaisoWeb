// frontend/src/services/charcuteriaService.ts

import axios from "axios";

export interface CharcuteriaProduct {
  id_producto: number;
  nombre: string;
  descripcion: string;
  imagen_url?: string;
  categoria?: string;
  fecha: string;
}

// Configura la URL de la API usando variables de entorno y valida su existencia
const API_URL = process.env.NEXT_PUBLIC_API_CHARCUTERIA_URL;

if (!API_URL) {
  throw new Error("La variable de entorno NEXT_PUBLIC_API_CHARCUTERIA_URL no está definida.");
}

// Agrega un parámetro 'idioma' a la función
export const getCharcuteriaProducts = async (idioma: string): Promise<CharcuteriaProduct[]> => {
  try {
    // Incluye el idioma en la URL como query parameter
    const response = await axios.get<CharcuteriaProduct[]>(`${API_URL}?idioma=${idioma}`);
    return response.data;
  } catch (error) {
    /* console.error("Error recibiendo los productos de charcuteria:", error); */
    throw error;
  }
};
