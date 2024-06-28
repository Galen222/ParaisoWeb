// src/utils.ts

// Importaciones necesarias para las funciones
import { toast, Slide } from "react-toastify";
import { IntlShape } from "react-intl";

// Función para borrar las cookies
export const deleteCookies = (
  intl: IntlShape,
  cookieConsentAnalysis: boolean,
  setCookieConsentAnalysis: (value: boolean) => void,
  cookieConsentPersonalization: boolean,
  setCookieConsentPersonalization: (value: boolean) => void
) => {
  try {
    if (cookieConsentAnalysis) {
      setCookieConsentAnalysis(false);
      document.cookie = "_device=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "_visited=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    if (cookieConsentPersonalization) {
      setCookieConsentPersonalization(false);
      document.cookie = "_locale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    toast.success(intl.formatMessage({ id: "cookie_Borrado_Ok" }), {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    });
  } catch (error) {
    console.error("Error deleting cookies:", error);
    toast.error(intl.formatMessage({ id: "cookie_Borrado_Error" }), {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    });
  }
};

// Función para obtener el valor de la cookie visited
export const getCookieValue = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";")[0];
  }
  return undefined;
};
