// services/formService.ts

import axios, { AxiosResponse } from "axios";

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

// Verifica que la URL de la API esté definida en las variables de entorno.
if (!API_URL) {
  throw new Error("La variable de entorno NEXT_PUBLIC_API_CONTACTO_URL no está definida.");
}

// Crea una instancia de axios con configuraciones predeterminadas.
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  // Puedes agregar más configuraciones aquí si es necesario.
});

/**
 * Envía el formulario de contacto a la API.
 *
 * @param {FormData} data - Los datos del formulario a enviar.
 * @returns {Promise<AxiosResponse>} - Una promesa que resuelve a la respuesta de la API.
 */
export const submitForm = async (data: FormData): Promise<AxiosResponse> => {
  // Crea una instancia de FormData para enviar los datos incluyendo archivos adjuntos.
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("reason", data.reason);
  formData.append("email", data.email);
  formData.append("message", data.message);
  if (data.file) {
    formData.append("file", data.file);
  }

  try {
    // Realiza la solicitud POST usando axios con los datos del formulario.
    const response = await axiosInstance.post(API_URL, formData);
    return response;
  } catch (error: any) {
    // Manejo de errores en la solicitud con axios.
    if (error.response) {
      // El servidor respondió con un estado fuera del rango 2xx.
      /* console.error("Error del servidor:", error.response.data); */
      throw new Error(error.response.data.message || "Error al enviar el formulario");
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta.
      /* console.error("No se recibió respuesta del servidor:", error.request); */
      throw new Error("No se pudo contactar con el servidor");
    } else {
      // Algo pasó al configurar la solicitud.
      /* console.error("Error al configurar la solicitud:", error.message); */
      throw new Error("Error al enviar el formulario");
    }
  }
};
