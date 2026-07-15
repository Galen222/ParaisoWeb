// hooks/useDownloadFile.ts

import { useRef, useState } from "react";
import { saveAs } from "file-saver";
import { useToastMessage } from "./useToast";

/**
 * Interfaz para el objeto retornado por el hook `useDownloadFile`.
 */
export interface DownloadFileHook {
  downloadFile: (filePath: string, fileName: string, successMessageId: string, errorMessageId: string) => Promise<void>;
  isDownloading: boolean;
}

/**
 * Hook personalizado para gestionar la descarga de archivos.
 * Permite descargar un archivo y muestra notificaciones de éxito o error.
 *
 * @returns {DownloadFileHook} Objeto con la función `downloadFile` para iniciar la descarga y el estado `isDownloading`.
 */
export function useDownloadFile(): DownloadFileHook {
  const [isDownloading, setIsDownloading] = useState(false); // Estado para controlar el proceso de descarga
  const isDownloadingRef = useRef(false); // Bloquea dobles clics antes de que React actualice el botón
  const { showToast } = useToastMessage(); // Utiliza el hook para mostrar las notificaciones

  /**
   * Inicia la descarga de un archivo y maneja las notificaciones de éxito o error.
   *
   * @param {string} filePath - Ruta del archivo a descargar.
   * @param {string} fileName - Nombre del archivo que se guardará en el sistema.
   * @param {string} successMessageId - ID del mensaje de éxito para la internacionalización.
   * @param {string} errorMessageId - ID del mensaje de error para la internacionalización.
   */
  const downloadFile = async (filePath: string, fileName: string, successMessageId: string, errorMessageId: string) => {
    if (isDownloadingRef.current) {
      return;
    }

    isDownloadingRef.current = true;
    setIsDownloading(true);
    try {
      // Realiza la solicitud de descarga
      // En una petición GET no se envía Content-Type: el tipo pertenece a la respuesta del servidor.
      const response = await fetch(filePath, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error descargando el archivo");
      }

      const contentType = response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
      if (contentType === "text/html" || contentType === "application/json" || contentType?.endsWith("+json")) {
        throw new Error("El servidor devolvió una página de error en lugar del archivo");
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("El archivo descargado está vacío");
      }

      saveAs(blob, fileName); // Inicia la descarga del archivo usando file-saver

      // Mostrar notificación de éxito
      showToast(successMessageId, 3000, "success"); // Muestra el toast utilizando el hook
    } catch {
      // Mostrar notificación de error
      showToast(errorMessageId, 3000, "error"); // Muestra el toast utilizando el hook
    } finally {
      isDownloadingRef.current = false;
      setIsDownloading(false); // Finaliza el estado de descarga
    }
  };

  return { downloadFile, isDownloading }; // Retorna la función de descarga y el estado de descarga
}
