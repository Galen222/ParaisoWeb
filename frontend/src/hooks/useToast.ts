import { useIntl } from "react-intl";
import { toast, Slide, ToastOptions } from "react-toastify";

interface ToastMessage {
  showToast: (messageId: string, duration: number, type?: "success" | "error" | "info" | "warning") => void;
}

/**
 * Hook personalizado para mostrar mensajes toast.
 *
 * @returns {ToastMessage} Objeto que contiene la función `showToast` para mostrar un toast.
 */
export function useToastMessage(): ToastMessage {
  const intl = useIntl();

  /**
   * Muestra un toast con el mensaje internacionalizado y la duración especificada.
   *
   * @param {string} messageId - ID del mensaje para la internacionalización.
   * @param {number} duration - Tiempo en milisegundos para que el toast se muestre.
   * @param {"success" | "error" | "info" | "warning"} type - Tipo de toast.
   */
  const showToast = (messageId: string, duration: number, type: "success" | "error" | "info" | "warning" = "info") => {
    const message = intl.formatMessage({ id: messageId });

    const toastOptions: ToastOptions = {
      position: "top-center",
      autoClose: duration,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    };

    switch (type) {
      case "success":
        toast.success(message, toastOptions);
        break;
      case "error":
        toast.error(message, toastOptions);
        break;
      case "info":
        toast.info(message, toastOptions);
        break;
      case "warning":
        toast.warn(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
        break;
    }
  };

  return { showToast };
}
