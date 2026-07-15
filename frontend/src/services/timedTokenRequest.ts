// services/timedTokenRequest.ts

import axios from "axios";
import { getTimedToken } from "./tokenService";

/**
 * Ejecuta una lectura autenticada y renueva una sola vez el token temporal ante un 403.
 * Las peticiones de lectura son idempotentes, por lo que este reintento no duplica efectos.
 */
export const requestWithTimedToken = async <T>(
  request: (token: string) => Promise<T>,
  initialToken?: string
): Promise<T> => {
  const token = initialToken || (await getTimedToken());

  try {
    return await request(token);
  } catch (error: unknown) {
    if (!axios.isAxiosError(error) || error.response?.status !== 403) {
      throw error;
    }

    const refreshedToken = await getTimedToken();
    if (refreshedToken === token) {
      throw error;
    }

    return request(refreshedToken);
  }
};
