// src/services/serviceForm.ts
import axios, { AxiosResponse } from "axios";

// Define la interfaz de los datos del formulario
export interface FormData {
  name: string;
  reason: string;
  email: string;
  message: string;
  file?: File | null;
}

// Configura la URL de la API usando variables de entorno
const API_URL = process.env.NEXT_PUBLIC_API_CONTACTO_URL;

if (!API_URL) {
  throw new Error("La variable de entorno NEXT_PUBLIC_API_CONTACTO_URL no está definida.");
}

// Crea una instancia de axios con configuraciones predeterminadas
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  // Puedes agregar más configuraciones aquí si es necesario
});

// Función para enviar el formulario
export const submitForm = async (data: FormData): Promise<AxiosResponse> => {
  // Crea una instancia de FormData para enviar archivos
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("reason", data.reason);
  formData.append("email", data.email);
  formData.append("message", data.message);
  if (data.file) {
    formData.append("file", data.file);
  }

  try {
    // Realiza la solicitud POST usando axios
    const response = await axiosInstance.post(API_URL, formData);
    return response;
  } catch (error: any) {
    // Manejo de errores con axios
    if (error.response) {
      // El servidor respondió con un estado fuera del rango 2xx
      console.error("Error del servidor:", error.response.data);
      throw new Error(error.response.data.message || "Error al enviar el formulario");
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error("No se recibió respuesta del servidor:", error.request);
      throw new Error("No se pudo contactar con el servidor");
    } else {
      // Algo pasó al configurar la solicitud
      console.error("Error al configurar la solicitud:", error.message);
      throw new Error("Error al enviar el formulario");
    }
  }
};
