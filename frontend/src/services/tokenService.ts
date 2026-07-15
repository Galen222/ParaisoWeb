// services/tokenService.ts

/**
 * Servicio para manejar la obtención de tokens temporales desde el backend.
 */

import axios from "axios";
import { TOKEN_REQUEST_TIMEOUT_MS, requirePublicApiUrl } from "../config/api.config";

// Comparte la misma petición entre consumidores simultáneos para evitar ráfagas innecesarias
// contra /get-token cuando varias secciones de la página cargan a la vez.
let pendingTokenRequest: Promise<string> | null = null;

// HMAC-SHA256 codificado por el backend con Base64 URL-safe: 43 caracteres y un `=` final.
const TIMED_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}=$/;

/**
 * Obtiene un token temporal desde el backend.
 *
 * @returns {Promise<string>} - Una promesa que resuelve al token temporal.
 * @throws {Error} - Si falla la obtención del token.
 */
const requestTimedToken = async (): Promise<string> => {
  const API_URL = requirePublicApiUrl(
    process.env.NEXT_PUBLIC_API_URL,
    "NEXT_PUBLIC_API_URL"
  );

  try {
    const response = await axios.get<unknown>(`${API_URL}/get-token`, {
      timeout: TOKEN_REQUEST_TIMEOUT_MS,
    });
    const responseData = response.data;

    if (typeof responseData !== "object" || responseData === null || !("token" in responseData)) {
      throw new Error("La respuesta del servidor no contiene un token temporal.");
    }

    const token = (responseData as { token?: unknown }).token;
    if (typeof token !== "string" || !TIMED_TOKEN_PATTERN.test(token)) {
      throw new Error("El token temporal recibido no es válido.");
    }

    return token;
  } catch {
    throw new Error("Error al obtener el token temporal.");
  }
};

export const getTimedToken = (): Promise<string> => {
  if (!pendingTokenRequest) {
    pendingTokenRequest = requestTimedToken().finally(() => {
      pendingTokenRequest = null;
    });
  }

  return pendingTokenRequest;
};
