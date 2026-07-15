// hooks/useCookieLogic.ts

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCookieConsent } from "../contexts/CookieContext";
import {
  COOKIE_CONSENT_NAME,
  createDeviceCookie,
  getCookieValue,
  isGoogleAnalyticsCookie,
  revokeCookieCategories,
  saveLocalePreference,
  saveCookieConsentPreference,
} from "../utils/cookieUtils";
import { initGA } from "../utils/gaUtils"; // Importa la función desde utils

const COOKIE_CONSENT_VERSION = "v1";
const COOKIE_CONSENT_ACCEPTED = `${COOKIE_CONSENT_VERSION}.accepted`;
const COOKIE_CONSENT_REJECTED = `${COOKIE_CONSENT_VERSION}.rejected`;
const COOKIE_CONSENT_CUSTOM_PREFIX = `${COOKIE_CONSENT_VERSION}.custom.`;

interface CustomCookieConsent {
  analysis: boolean;
  googleAnalytics: boolean;
  personalization: boolean;
}

/** Convierte una preferencia personalizada guardada, por ejemplo `v1.custom.101`, en consentimientos. */
const parseCustomCookieConsent = (preference: string): CustomCookieConsent | null => {
  if (!preference.startsWith(COOKIE_CONSENT_CUSTOM_PREFIX)) {
    return null;
  }

  const values = preference.slice(COOKIE_CONSENT_CUSTOM_PREFIX.length);
  if (!/^[01]{3}$/.test(values)) {
    return null;
  }

  return {
    analysis: values[0] === "1",
    googleAnalytics: values[1] === "1",
    personalization: values[2] === "1",
  };
};

/**
 * Define la interfaz para las propiedades devueltas por el hook.
 */
export interface CookieLogic {
  /** Indica si se debe mostrar el modal de cookies */
  showCookieModal: boolean;

  /** Indica si el modal de cookies ha sido cerrado */
  cookiesModalClosed: boolean;

  /** Maneja el clic en el enlace de la política de cookies */
  handleCookiesPolicyLinkClick: () => Promise<void>;

  /** Maneja el clic en el enlace de la política de privacidad */
  handlePrivacyPolicyLinkClick: () => Promise<void>;

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
   * Efecto para restaurar la elección guardada y establecer el estado inicial.
   * - Respeta la aceptación, el rechazo o la selección personalizada persistida.
   * - Mantiene la detección de cookies existentes para elecciones anteriores.
   * - Muestra el modal de cookies si no hay una elección previa.
   */
  useEffect(() => {
    const restoreSavedConsent = () => {
      const savedPreference = getCookieValue(COOKIE_CONSENT_NAME);
      const customPreference = savedPreference ? parseCustomCookieConsent(savedPreference) : null;

      // Restaura primero la elección explícita, incluso cuando se rechazaron todas las cookies opcionales.
      if (savedPreference === COOKIE_CONSENT_REJECTED) {
        // El rechazo persistido también debe retirar cookies antiguas que pudieran seguir en el navegador.
        revokeCookieCategories({ analysis: true, googleAnalytics: true, personalization: true });
        setAcceptCookieAnalysis(false);
        setCookieConsentAnalysis(false);
        setAcceptCookieAnalysisGoogle(false);
        setCookieConsentAnalysisGoogle(false);
        setAcceptCookiePersonalization(false);
        setCookieConsentPersonalization(false);
        setShowCookieModal(false);
        setCookiesModalClosed(true);
        return;
      }

      if (savedPreference === COOKIE_CONSENT_ACCEPTED || customPreference) {
        const analysis = savedPreference === COOKIE_CONSENT_ACCEPTED || customPreference?.analysis === true;
        const googleAnalytics = savedPreference === COOKIE_CONSENT_ACCEPTED || customPreference?.googleAnalytics === true;
        const personalization = savedPreference === COOKIE_CONSENT_ACCEPTED || customPreference?.personalization === true;

        // Una selección personalizada puede revocar categorías que se aceptaron anteriormente.
        revokeCookieCategories({
          analysis: !analysis,
          googleAnalytics: !googleAnalytics,
          personalization: !personalization,
        });

        setAcceptCookieAnalysis(analysis);
        setCookieConsentAnalysis(analysis);
        setAcceptCookieAnalysisGoogle(googleAnalytics);
        setCookieConsentAnalysisGoogle(googleAnalytics);
        setAcceptCookiePersonalization(personalization);
        setCookieConsentPersonalization(personalization);

        if (analysis) {
          createDeviceCookie();
        }
        if (googleAnalytics) {
          initGA();
        }

        setShowCookieModal(false);
        setCookiesModalClosed(true);
        return;
      }

      // Compatibilidad con elecciones anteriores: comprueba las cookies opcionales ya existentes.
      const cookieValuePersonalization = getCookieValue("_locale");
      const hasValidPersonalizationCookie =
        cookieValuePersonalization !== undefined && ["es", "en", "de"].includes(cookieValuePersonalization);
      const hasAnalysisCookie = Boolean(getCookieValue("_visited") || getCookieValue("_device"));
      const hasGoogleAnalyticsCookie = document.cookie
        .split(";")
        .map((cookie) => cookie.trim().split("=", 1)[0])
        .some(isGoogleAnalyticsCookie);

      if (hasValidPersonalizationCookie) {
        setAcceptCookiePersonalization(true);
        setCookieConsentPersonalization(true);
      }
      if (hasAnalysisCookie) {
        setAcceptCookieAnalysis(true);
        setCookieConsentAnalysis(true);
      }
      if (hasGoogleAnalyticsCookie) {
        setAcceptCookieAnalysisGoogle(true);
        setCookieConsentAnalysisGoogle(true);
        initGA();
      }

      // Muestra el modal únicamente cuando no existe una elección ni cookies opcionales válidas previas.
      if (!hasAnalysisCookie && !hasGoogleAnalyticsCookie && !hasValidPersonalizationCookie) {
        setShowCookieModal(true);
      } else {
        setCookiesModalClosed(true);
      }
    };

    // Restaura la preferencia fuera del cuerpo síncrono del efecto y cancela la tarea al desmontar.
    const restoreConsentTimeout = window.setTimeout(restoreSavedConsent, 0);
    return () => window.clearTimeout(restoreConsentTimeout);
  }, [
    setAcceptCookieAnalysis,
    setAcceptCookieAnalysisGoogle,
    setAcceptCookiePersonalization,
    setCookieConsentAnalysis,
    setCookieConsentAnalysisGoogle,
    setCookieConsentPersonalization,
  ]);

  /**
   * Efecto para guardar el idioma en cookies si se ha aceptado la personalización.
   * - Establece la cookie `_locale` con el locale actual si se ha dado consentimiento para la personalización.
   */
  useEffect(() => {
    const currentLocale = router.locale || "es"; // Obtener el locale actual
    if (cookieConsentPersonalization) {
      saveLocalePreference(currentLocale);
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
  const handleCookiesPolicyLinkClick = async () => {
    resetCookieConsent();
    setShowCookieModal(false);
    setCookiesModalClosed(true);

    try {
      const navigationCompleted = await router.push("/politica-cookies");
      if (!navigationCompleted) {
        setShowCookieModal(true);
        setCookiesModalClosed(false);
      }
    } catch (error: unknown) {
      console.error(
        "No se pudo abrir la política de cookies:",
        error instanceof Error ? error.message : "Error de navegación desconocido"
      );
      setShowCookieModal(true);
      setCookiesModalClosed(false);
    }
  };

  /**
   * Maneja el clic en el enlace de la política de privacidad.
   * - Reinicia el consentimiento de cookies.
   * - Cierra el modal de cookies.
   * - Redirige al usuario a la página de política de privacidad.
   */
  const handlePrivacyPolicyLinkClick = async () => {
    resetCookieConsent();
    setShowCookieModal(false);
    setCookiesModalClosed(true);

    try {
      const navigationCompleted = await router.push("/politica-privacidad");
      if (!navigationCompleted) {
        setShowCookieModal(true);
        setCookiesModalClosed(false);
      }
    } catch (error: unknown) {
      console.error(
        "No se pudo abrir la política de privacidad:",
        error instanceof Error ? error.message : "Error de navegación desconocido"
      );
      setShowCookieModal(true);
      setCookiesModalClosed(false);
    }
  };

  /**
   * Maneja la aceptación de cookies según los consentimientos seleccionados.
   * - Actualiza y conserva los estados de consentimiento elegidos por el usuario.
   * - Crea la cookie de dispositivo si se acepta el análisis.
   * - Inicializa Google Analytics si se acepta.
   * - Cierra el modal de cookies.
   */
  const handleAcceptCookies = () => {
    // Retira de inmediato las cookies de las categorías que el usuario acaba de desactivar.
    revokeCookieCategories({
      analysis: !AcceptCookieAnalysis,
      googleAnalytics: !AcceptCookieAnalysisGoogle,
      personalization: !AcceptCookiePersonalization,
    });

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

    const customPreference = [AcceptCookieAnalysis, AcceptCookieAnalysisGoogle, AcceptCookiePersonalization]
      .map((value) => (value ? "1" : "0"))
      .join("");
    saveCookieConsentPreference(`${COOKIE_CONSENT_CUSTOM_PREFIX}${customPreference}`);

    setShowCookieModal(false);
    setCookiesModalClosed(true);
  };

  /**
   * Declina todas las cookies, cerrando el modal de consentimiento.
   * - Reinicia el consentimiento de cookies.
   * - Conserva el rechazo para que el modal no reaparezca al recargar.
   * - Cierra el modal de cookies.
   */
  const handleDeclineAllCookies = () => {
    // Rechazar no solo cambia el estado: también retira las cookies opcionales ya creadas.
    revokeCookieCategories({ analysis: true, googleAnalytics: true, personalization: true });
    resetCookieConsent();
    saveCookieConsentPreference(COOKIE_CONSENT_REJECTED);
    setShowCookieModal(false);
    setCookiesModalClosed(true);
  };

  /**
   * Acepta todas las cookies (análisis, personalización y Google), cierra el modal y ejecuta `initGA`.
   * - Establece y conserva todos los consentimientos a `true`.
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

    saveCookieConsentPreference(COOKIE_CONSENT_ACCEPTED);
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
