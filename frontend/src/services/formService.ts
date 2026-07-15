// services/formService.ts

/**
 * Servicio para manejar el envío del formulario de contacto.
 */

import axios, { AxiosResponse } from "axios";
import { getTimedToken } from "./tokenService";
import { CONTACT_REQUEST_TIMEOUT_MS, requirePublicApiUrl } from "../config/api.config";

/**
 * Interfaz para los datos del formulario de contacto.
 */
export interface FormData {
  name: string; // Nombre del remitente del formulario.
  reason: string; // Razón del contacto.
  email: string; // Dirección de correo electrónico del remitente.
  message: string; // Mensaje enviado en el formulario.
  file?: File | null; // Archivo adjunto (opcional).
}

/**
 * URL base de la API de contacto, obtenida desde una variable de entorno.
 */
const API_URL = process.env.NEXT_PUBLIC_API_CONTACTO_URL;

/**
 * Obtiene la URL configurada sin hacer fallar la importación del módulo durante el build.
 */
const getApiUrl = (): string =>
  requirePublicApiUrl(API_URL, "NEXT_PUBLIC_API_CONTACTO_URL");

// Crea una instancia de axios con configuraciones predeterminadas.
const axiosInstance = axios.create({
  // No se fija Content-Type: Axios añadirá el boundary correcto al enviar FormData.
  // Puedes agregar más configuraciones aquí si es necesario.
});

/**
 * Extrae un detalle de error textual de una respuesta de la API sin asumir su estructura.
 */
const getApiErrorDetail = (data: unknown): string | null => {
  if (typeof data !== "object" || data === null || !("detail" in data)) {
    return null;
  }

  const detail = (data as { detail?: unknown }).detail;
  return typeof detail === "string" && detail.trim() !== "" ? detail : null;
};

/**
 * Envía el formulario de contacto a la API.
 *
 * @param {FormData} data - Los datos del formulario a enviar.
 * @returns {Promise<AxiosResponse>} - Una promesa que resuelve a la respuesta de la API.
 * @throws {Error} - Si falla el envío del formulario.
 */
export const submitForm = async (data: FormData): Promise<AxiosResponse> => {
  const apiUrl = getApiUrl();

  // Obtén el token temporal antes de enviar el formulario
  const token = await getTimedToken();

  // Crea una instancia de FormData para enviar los datos incluyendo archivos adjuntos.
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("reason", data.reason);
  formData.append("email", data.email);
  formData.append("message", data.message);
  if (data.file) {
    formData.append("file", data.file);
  }

  const postForm = (timedToken: string): Promise<AxiosResponse> =>
    axiosInstance.post(apiUrl, formData, {
      headers: {
        "x-timed-token": timedToken, // Envía el token en el encabezado
      },
      timeout: CONTACT_REQUEST_TIMEOUT_MS,
    });

  try {
    // Realiza la solicitud POST usando axios con los datos del formulario y el token temporal.
    return await postForm(token);
  } catch (error: unknown) {
    // Manejo de errores en la solicitud con axios.
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // El servidor respondió con un estado fuera del rango 2xx.
        if (error.response.status === 403) {
          // El token puede cambiar mientras se sube el formulario. Como el backend verifica
          // el token antes de ejecutar el servicio de correo, es seguro reintentar una sola
          // vez con un token recién solicitado sin duplicar un envío ya procesado.
          const refreshedToken = await getTimedToken();
          if (refreshedToken !== token) {
            try {
              return await postForm(refreshedToken);
            } catch (retryError: unknown) {
              if (axios.isAxiosError(retryError)) {
                if (retryError.response?.status === 403) {
                  throw new Error("Token inválido o expirado. Por favor, intenta de nuevo.");
                }
                if (retryError.response) {
                  throw new Error(getApiErrorDetail(retryError.response.data) ?? "Error al enviar el formulario");
                }
                if (retryError.request) {
                  throw new Error("No se pudo contactar con el servidor");
                }
              }

              throw new Error("Error al enviar el formulario");
            }
          }

          throw new Error("Token inválido o expirado. Por favor, intenta de nuevo.");
        }

        throw new Error(getApiErrorDetail(error.response.data) ?? "Error al enviar el formulario");
      }

      if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta.
        throw new Error("No se pudo contactar con el servidor");
      }
    }

    // Algo pasó al configurar la solicitud o se recibió un error no reconocido.
    throw new Error("Error al enviar el formulario");
  }
};
