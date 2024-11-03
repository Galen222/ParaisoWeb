// src/hooks/useDownloadFile.ts

import { useState } from "react";
import { toast, Slide } from "react-toastify";
import { saveAs } from "file-saver";
import { useIntl } from "react-intl"; // Hook para internacionalización

// Hook personalizado para la descarga de archivos
export function useDownloadFile() {
  const intl = useIntl(); // Inicializa el hook de internacionalización
  const [isDownloading, setIsDownloading] = useState(false); // Estado para animaciones

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
      saveAs(blob, fileName); // Inicia la descarga con file-saver

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
      setIsDownloading(false);
    }
  };

  return { downloadFile, isDownloading };
}
