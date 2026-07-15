// hooks/useDownloadFile.ts

import { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { useToastMessage } from "./useToast";
import { DOWNLOAD_REQUEST_TIMEOUT_MS } from "../config/api.config";

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
  const activeControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const { showToast } = useToastMessage(); // Utiliza el hook para mostrar las notificaciones

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      activeControllerRef.current?.abort();
      activeControllerRef.current = null;
      isDownloadingRef.current = false;
    };
  }, []);

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
    const controller = new AbortController();
    activeControllerRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), DOWNLOAD_REQUEST_TIMEOUT_MS);

    try {
      // Realiza la solicitud de descarga. El timeout evita que una conexión abierta
      // indefinidamente deje el botón bloqueado y el loader activo para siempre.
      // En una petición GET no se envía Content-Type: el tipo pertenece a la respuesta del servidor.
      const response = await fetch(filePath, {
        method: "GET",
        signal: controller.signal,
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

      if (!isMountedRef.current || controller.signal.aborted) {
        return;
      }

      saveAs(blob, fileName); // Inicia la descarga del archivo usando file-saver

      // Mostrar notificación de éxito
      showToast(successMessageId, 3000, "success"); // Muestra el toast utilizando el hook
    } catch {
      // No muestra un error al abandonar la página: el cleanup cancela la descarga intencionadamente.
      if (isMountedRef.current) {
        showToast(errorMessageId, 3000, "error"); // Muestra el toast utilizando el hook
      }
    } finally {
      window.clearTimeout(timeoutId);
      if (activeControllerRef.current === controller) {
        activeControllerRef.current = null;
        isDownloadingRef.current = false;
        if (isMountedRef.current) {
          setIsDownloading(false); // Finaliza el estado de descarga
        }
      }
    }
  };

  return { downloadFile, isDownloading }; // Retorna la función de descarga y el estado de descarga
}
