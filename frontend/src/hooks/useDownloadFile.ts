// hooks/useDownloadFile.ts

import { useState } from "react";
import { toast, Slide } from "react-toastify";
import { saveAs } from "file-saver";
import { useIntl } from "react-intl"; // Hook para internacionalización

/**
 * Hook personalizado para gestionar la descarga de archivos.
 * Permite descargar un archivo y muestra notificaciones de éxito o error.
 *
 * @returns {Object} Objeto con la función `downloadFile` para iniciar la descarga y el estado `isDownloading`.
 */
export function useDownloadFile() {
  const intl = useIntl(); // Inicializa el hook de internacionalización
  const [isDownloading, setIsDownloading] = useState(false); // Estado para controlar el proceso de descarga

  /**
   * Inicia la descarga de un archivo y maneja las notificaciones de éxito o error.
   *
   * @param {string} filePath - Ruta del archivo a descargar.
   * @param {string} fileName - Nombre del archivo que se guardará en el sistema.
   * @param {string} successMessageId - ID del mensaje de éxito para la internacionalización.
   * @param {string} errorMessageId - ID del mensaje de error para la internacionalización.
   */
  const downloadFile = async (filePath: string, fileName: string, successMessageId: string, errorMessageId: string) => {
    setIsDownloading(true);
    try {
      // Realizar la solicitud de descarga
      const response = await fetch(filePath, {
        method: "GET",
        headers: {
          "Content-Type": "application/pdf",
        },
      });

      if (!response.ok) {
        throw new Error("Error descargando el archivo");
      }

      const blob = await response.blob();
      saveAs(blob, fileName); // Inicia la descarga del archivo usando file-saver

      // Mostrar notificación de éxito
      toast.success(intl.formatMessage({ id: successMessageId }), {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
    } catch (error) {
      // Mostrar notificación de error
      toast.error(intl.formatMessage({ id: errorMessageId }), {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
    } finally {
      setIsDownloading(false); // Finaliza el estado de descarga
    }
  };

  return { downloadFile, isDownloading }; // Retorna la función de descarga y el estado de descarga
}
