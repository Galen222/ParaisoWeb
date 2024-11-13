// hooks/useCookieLogic.ts

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCookieConsent } from "../contexts/CookieContext";
import { createDeviceCookie } from "../utils/cookieUtils";
import { initGA } from "../utils/gaUtils"; // Importa la función desde utils

/**
 * Define la interfaz para las propiedades devueltas por el hook.
 */
export interface CookieLogic {
  /** Indica si se debe mostrar el modal de cookies */
  showCookieModal: boolean;

  /** Indica si el modal de cookies ha sido cerrado */
  cookiesModalClosed: boolean;

  /** Maneja el clic en el enlace de la política de cookies */
  handleCookiesPolicyLinkClick: () => void;

  /** Maneja el clic en el enlace de la política de privacidad */
  handlePrivacyPolicyLinkClick: () => void;

  /** Maneja la aceptación de cookies según los consentimientos seleccionados */
  handleAcceptCookies: () => void;

  /** Declina todas las cookies, cerrando el modal de consentimiento */
  handleDeclineAllCookies: () => void;

  /** Acepta todas las cookies (análisis, personalización y Google), cierra el modal y ejecuta `initGA` */
  handleAcceptAllCookies: () => void;
}

/**
 * Hook personalizado para gestionar la lógica de consentimiento de cookies.
 * Controla la presentación del modal de cookies,
 * además de gestionar los consentimientos para análisis, personalización y cookies de Google.
 *
 * @returns {CookieLogic} Objeto con variables y funciones para la gestión de cookies y consentimiento.
 */
export function useCookieLogic(): CookieLogic {
  // Estado para controlar la visibilidad del modal de cookies
  const [showCookieModal, setShowCookieModal] = useState<boolean>(false);

  // Estado para indicar si el modal de cookies ha sido cerrado
  const [cookiesModalClosed, setCookiesModalClosed] = useState<boolean>(false);

  // Hook de Next.js para acceder al enrutador
  const router = useRouter();

  // Estado y funciones para el consentimiento de cookies desde el contexto
  const {
    setCookieConsentAnalysis,
    setCookieConsentAnalysisGoogle,
    cookieConsentPersonalization,
    setCookieConsentPersonalization,
    setAcceptCookieAnalysis,
    AcceptCookieAnalysis,
    setAcceptCookieAnalysisGoogle,
    AcceptCookieAnalysisGoogle,
    setAcceptCookiePersonalization,
    AcceptCookiePersonalization,
  } = useCookieConsent();

  /**
   * Efecto para verificar las cookies existentes y establecer el estado inicial.
   * - Verifica la existencia de las cookies `_visited` y `_ga`.
   * - Gestiona el consentimiento de análisis y Google Analytics.
   * - Muestra el modal de cookies si no hay consentimiento previo.
   */
  useEffect(() => {
    // Comprueba si existe la cookie _Locale
    const cookieValuePersonalization = document.cookie
      .split("; ")
      .find((row) => row.startsWith("_locale="))
      ?.split("=")[1];
    // Comprueba si existe la cookie _visited
    const cookieNameAnalysis = document.cookie.split("; ").find((row) => row.startsWith("_visited="));

    // Comprueba si existe la cookie _ga de GA4
    const cookieNameAnalysisGoogle = document.cookie.split("; ").find((row) => row.startsWith("_ga="));

    // Gestiona el consentimiento de personalización
    if (cookieValuePersonalization && ["es", "en", "de"].includes(cookieValuePersonalization)) {
      setCookieConsentPersonalization(true);
    }
    // Gestiona el consentimiento de análisis
    if (cookieNameAnalysis) {
      setCookieConsentAnalysis(true);
    }

    // Gestiona el consentimiento de Google Analytics
    if (cookieNameAnalysisGoogle) {
      setCookieConsentAnalysisGoogle(true);
      initGA();
    }

    // Muestra el modal de cookies si no hay consentimiento previo
    if (!cookieNameAnalysis && !cookieNameAnalysisGoogle && !cookieValuePersonalization) {
      setShowCookieModal(true);
    } else {
      setCookiesModalClosed(true);
    }
  }, [setCookieConsentPersonalization, setCookieConsentAnalysis, setCookieConsentAnalysisGoogle]);

  /**
   * Efecto para guardar el idioma en cookies si se ha aceptado la personalización.
   * - Establece la cookie `_locale` con el locale actual si se ha dado consentimiento para la personalización.
   */
  useEffect(() => {
    const currentLocale = router.locale || "es"; // Obtener el locale actual
    if (cookieConsentPersonalization) {
      document.cookie = `_locale=${currentLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [router.locale, cookieConsentPersonalization]);

  /**
   * Reinicia el consentimiento de cookies a su estado inicial (no consentido).
   * - Establece todas las opciones de consentimiento a `false`.
   */
  const resetCookieConsent = () => {
    setAcceptCookieAnalysis(false);
    setCookieConsentAnalysis(false);
    setAcceptCookieAnalysisGoogle(false);
    setCookieConsentAnalysisGoogle(false);
    setAcceptCookiePersonalization(false);
    setCookieConsentPersonalization(false);
  };

  /**
   * Maneja el clic en el enlace de la política de cookies.
   * - Reinicia el consentimiento de cookies.
   * - Cierra el modal de cookies.
   * - Redirige al usuario a la página de política de cookies.
   */
  const handleCookiesPolicyLinkClick = () => {
    resetCookieConsent();
    setShowCookieModal(false);
    setCookiesModalClosed(true);
    router.push("/politica-cookies");
  };

  /**
   * Maneja el clic en el enlace de la política de privacidad.
   * - Reinicia el consentimiento de cookies.
   * - Cierra el modal de cookies.
   * - Redirige al usuario a la página de política de privacidad.
   */
  const handlePrivacyPolicyLinkClick = () => {
    resetCookieConsent();
    setShowCookieModal(false);
    setCookiesModalClosed(true);
    router.push("/politica-privacidad");
  };

  /**
   * Maneja la aceptación de cookies según los consentimientos seleccionados.
   * - Actualiza los estados de consentimiento según las preferencias del usuario.
   * - Crea la cookie de dispositivo si se acepta el análisis.
   * - Inicializa Google Analytics si se acepta.
   * - Cierra el modal de cookies.
   */
  const handleAcceptCookies = () => {
    if (AcceptCookieAnalysis) {
      setCookieConsentAnalysis(true);
      createDeviceCookie();
    } else {
      setCookieConsentAnalysis(false);
    }

    if (AcceptCookieAnalysisGoogle) {
      setCookieConsentAnalysisGoogle(true);
      initGA();
    } else {
      setCookieConsentAnalysisGoogle(false);
    }

    if (AcceptCookiePersonalization) {
      setCookieConsentPersonalization(true);
    } else {
      setCookieConsentPersonalization(false);
    }

    setShowCookieModal(false);
    setCookiesModalClosed(true);
  };

  /**
   * Declina todas las cookies, cerrando el modal de consentimiento.
   * - Reinicia el consentimiento de cookies.
   * - Cierra el modal de cookies.
   */
  const handleDeclineAllCookies = () => {
    resetCookieConsent();
    setShowCookieModal(false);
    setCookiesModalClosed(true);
  };

  /**
   * Acepta todas las cookies (análisis, personalización y Google), cierra el modal y ejecuta `initGA`.
   * - Establece todos los consentimientos a `true`.
   * - Crea la cookie de dispositivo.
   * - Inicializa Google Analytics.
   * - Cierra el modal de cookies.
   */
  const handleAcceptAllCookies = () => {
    setAcceptCookieAnalysis(true);
    setCookieConsentAnalysis(true);
    createDeviceCookie();

    setAcceptCookieAnalysisGoogle(true);
    setCookieConsentAnalysisGoogle(true);
    initGA();

    setAcceptCookiePersonalization(true);
    setCookieConsentPersonalization(true);

    setShowCookieModal(false);
    setCookiesModalClosed(true);
  };

  return {
    showCookieModal, // Indica si se debe mostrar el modal de cookies
    cookiesModalClosed, // Indica si el modal de cookies ha sido cerrado
    handleCookiesPolicyLinkClick, // Maneja el clic en el enlace de la política de cookies
    handlePrivacyPolicyLinkClick, // Maneja el clic en el enlace de la política de privacidad
    handleAcceptCookies, // Maneja la aceptación de cookies según los consentimientos seleccionados
    handleDeclineAllCookies, // Declina todas las cookies, cerrando el modal de consentimiento
    handleAcceptAllCookies, // Acepta todas las cookies, cierra el modal y ejecuta `initGA`
  };
}
