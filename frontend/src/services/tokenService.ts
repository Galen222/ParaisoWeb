// services/tokenService.ts

/**
 * Servicio para manejar la obtención de tokens temporales desde el backend.
 */

import axios from "axios";

/**
 * Obtiene un token temporal desde el backend.
 *
 * @returns {Promise<string>} - Una promesa que resuelve al token temporal.
 * @throws {Error} - Si falla la obtención del token.
 */
export const getTimedToken = async (): Promise<string> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL; // Asegúrate de que esta variable esté definida
  if (!API_URL) {
    throw new Error("La variable de entorno NEXT_PUBLIC_API_URL no está definida.");
  }

  try {
    const response = await axios.get(`${API_URL}/get-token`);
    return response.data.token;
  } catch (error: any) {
    throw new Error("Error al obtener el token temporal.");
  }
};
