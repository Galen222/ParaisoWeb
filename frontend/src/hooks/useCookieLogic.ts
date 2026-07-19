// hooks/useCookieLogic.ts

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useCookieConsent } from "../contexts/CookieContext";
import {
  COOKIE_CONSENT_CLEARED_EVENT,
  COOKIE_CONSENT_NAME,
  COOKIE_CONSENT_SYNC_STORAGE_KEY,
  createDeviceCookie,
  getCookieValue,
  revokeCookieCategories,
  saveLocalePreference,
  saveCookieConsentPreference,
} from "../utils/cookieUtils";
import { initGA } from "../utils/gaUtils"; // Importa la función desde utils
import { shouldReopenConsentModal } from "../utils/cookieConsentState";
import { shouldPersistLocalePreference } from "../utils/localePreferenceSync";
import { clientLogger } from "../logging/clientLogger";

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

  // Recuerda que el modal se cerró solo para consultar una política, no por una decisión.
  const [isReviewingConsentPolicy, setIsReviewingConsentPolicy] = useState(false);
  const isReviewingConsentPolicyRef = useRef(false);

  // Hook de Next.js para acceder al enrutador
  const router = useRouter();

  // Conserva el estado anterior para distinguir un cambio real de idioma de una
  // restauración de consentimiento recibida desde otra pestaña.
  const localePreferenceSnapshotRef = useRef({
    locale: router.locale || "es",
    personalizationEnabled: false,
  });

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
   * Restaura la preferencia persistida y sincroniza tanto los estados de selección
   * como los consentimientos efectivos usados por el resto de la aplicación.
   */
  const restoreSavedConsent = useCallback(() => {
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

    // Una cookie opcional aislada no demuestra que el usuario aceptara la versión actual
    // de la política. Se retira cualquier resto anterior y se solicita una decisión explícita.
    revokeCookieCategories({ analysis: true, googleAnalytics: true, personalization: true });
    setAcceptCookieAnalysis(false);
    setCookieConsentAnalysis(false);
    setAcceptCookieAnalysisGoogle(false);
    setCookieConsentAnalysisGoogle(false);
    setAcceptCookiePersonalization(false);
    setCookieConsentPersonalization(false);
    setShowCookieModal(true);
    setCookiesModalClosed(false);
  }, [
    setAcceptCookieAnalysis,
    setAcceptCookieAnalysisGoogle,
    setAcceptCookiePersonalization,
    setCookieConsentAnalysis,
    setCookieConsentAnalysisGoogle,
    setCookieConsentPersonalization,
  ]);

  /**
   * Efecto para restaurar la elección guardada y establecer el estado inicial.
   * - Respeta la aceptación, el rechazo o la selección personalizada persistida.
   * - No interpreta cookies antiguas o aisladas como una aceptación explícita de la política actual.
   * - Muestra el modal de cookies si no hay una elección previa.
   */
  useEffect(() => {
    // Restaura la preferencia fuera del cuerpo síncrono del efecto y cancela la tarea al desmontar.
    const restoreConsentTimeout = window.setTimeout(restoreSavedConsent, 0);
    return () => window.clearTimeout(restoreConsentTimeout);
  }, [restoreSavedConsent]);

  /**
   * Sincroniza cambios realizados en otra pestaña o mientras esta permanecía en segundo
   * plano. Las cookies no generan eventos por sí mismas, por lo que se combina una señal
   * efímera de storage con una comprobación al recuperar foco o visibilidad.
   */
  useEffect(() => {
    const synchronizeConsent = () => {
      // Mientras se consulta una política desde el modal, una ausencia de preferencia
      // debe seguir esperando a que el usuario abandone la página legal.
      if (isReviewingConsentPolicyRef.current && !getCookieValue(COOKIE_CONSENT_NAME)) {
        return;
      }
      restoreSavedConsent();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_SYNC_STORAGE_KEY && event.newValue !== null) {
        synchronizeConsent();
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        synchronizeConsent();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", synchronizeConsent);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", synchronizeConsent);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [restoreSavedConsent]);

  /**
   * Efecto para guardar cambios reales de idioma si ya se había aceptado la personalización.
   * - No sobrescribe `_locale` cuando el consentimiento se restaura desde otra pestaña.
   * - Los botones de aceptación guardan explícitamente el locale de la pestaña que toma la decisión.
   */
  useEffect(() => {
    const currentSnapshot = {
      locale: router.locale || "es",
      personalizationEnabled: cookieConsentPersonalization,
    };

    if (shouldPersistLocalePreference(localePreferenceSnapshotRef.current, currentSnapshot)) {
      saveLocalePreference(currentSnapshot.locale);
    }

    localePreferenceSnapshotRef.current = currentSnapshot;
  }, [router.locale, cookieConsentPersonalization]);

  /**
   * Si el usuario borra las cookies desde la política, vuelve a abrir el diálogo en la misma
   * navegación. Sin este evento la cookie desaparecía, pero la interfaz seguía cerrada hasta recargar.
   */
  useEffect(() => {
    const handleConsentCleared = () => {
      isReviewingConsentPolicyRef.current = false;
      setIsReviewingConsentPolicy(false);
      setShowCookieModal(true);
      setCookiesModalClosed(false);
    };

    window.addEventListener(COOKIE_CONSENT_CLEARED_EVENT, handleConsentCleared);
    return () => window.removeEventListener(COOKIE_CONSENT_CLEARED_EVENT, handleConsentCleared);
  }, []);


  /**
   * Si el usuario abrió una política desde el modal sin aceptar ni rechazar, vuelve a
   * solicitar la elección al abandonar las páginas legales. Mientras navega entre ambas
   * políticas el contenido permanece visible y no se superpone de nuevo el modal.
   */
  useEffect(() => {
    const savedPreference = getCookieValue(COOKIE_CONSENT_NAME);
    if (!shouldReopenConsentModal(isReviewingConsentPolicy, router.pathname, savedPreference)) {
      return;
    }

    // Se difiere la actualización para que el efecto observe la navegación ya completada
    // sin encadenar un render síncrono dentro de su propio cuerpo.
    const reopenModalTimeout = window.setTimeout(() => {
      setShowCookieModal(true);
      setCookiesModalClosed(false);
      isReviewingConsentPolicyRef.current = false;
      setIsReviewingConsentPolicy(false);
    }, 0);

    return () => window.clearTimeout(reopenModalTimeout);
  }, [isReviewingConsentPolicy, router.pathname]);

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
   * - Conserva el consentimiento actual mientras el usuario consulta la política.
   * - Cierra el modal de cookies.
   * - Redirige al usuario a la página de política de cookies.
   */
  const handleCookiesPolicyLinkClick = async () => {
    setShowCookieModal(false);
    setCookiesModalClosed(true);
    // El ref protege la sincronización por foco o visibilidad desde el mismo instante
    // del clic, sin activar todavía el efecto que reabre el modal fuera de páginas legales.
    isReviewingConsentPolicyRef.current = true;

    try {
      const navigationCompleted = await router.push("/politica-cookies");
      if (!navigationCompleted) {
        isReviewingConsentPolicyRef.current = false;
        setIsReviewingConsentPolicy(false);
        setShowCookieModal(true);
        setCookiesModalClosed(false);
      } else {
        setIsReviewingConsentPolicy(true);
      }
    } catch (error: unknown) {
      clientLogger.error(
        "No se pudo abrir la política de cookies:",
        error instanceof Error ? error.message : "Error de navegación desconocido"
      );
      isReviewingConsentPolicyRef.current = false;
      setIsReviewingConsentPolicy(false);
      setShowCookieModal(true);
      setCookiesModalClosed(false);
    }
  };

  /**
   * Maneja el clic en el enlace de la política de privacidad.
   * - Conserva el consentimiento actual mientras el usuario consulta la política.
   * - Cierra el modal de cookies.
   * - Redirige al usuario a la página de política de privacidad.
   */
  const handlePrivacyPolicyLinkClick = async () => {
    setShowCookieModal(false);
    setCookiesModalClosed(true);
    // Evita que un evento de foco o visibilidad restaure el modal mientras se resuelve la ruta.
    isReviewingConsentPolicyRef.current = true;

    try {
      const navigationCompleted = await router.push("/politica-privacidad");
      if (!navigationCompleted) {
        isReviewingConsentPolicyRef.current = false;
        setIsReviewingConsentPolicy(false);
        setShowCookieModal(true);
        setCookiesModalClosed(false);
      } else {
        setIsReviewingConsentPolicy(true);
      }
    } catch (error: unknown) {
      clientLogger.error(
        "No se pudo abrir la política de privacidad:",
        error instanceof Error ? error.message : "Error de navegación desconocido"
      );
      isReviewingConsentPolicyRef.current = false;
      setIsReviewingConsentPolicy(false);
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
    isReviewingConsentPolicyRef.current = false;
    setIsReviewingConsentPolicy(false);
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
      // La pestaña donde se acepta la personalización define la preferencia inicial.
      // Las demás pestañas restaurarán el consentimiento sin sobrescribir este idioma.
      saveLocalePreference(router.locale || "es");
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
    isReviewingConsentPolicyRef.current = false;
    setIsReviewingConsentPolicy(false);
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
    isReviewingConsentPolicyRef.current = false;
    setIsReviewingConsentPolicy(false);
    setAcceptCookieAnalysis(true);
    setCookieConsentAnalysis(true);
    createDeviceCookie();

    setAcceptCookieAnalysisGoogle(true);
    setCookieConsentAnalysisGoogle(true);
    initGA();

    setAcceptCookiePersonalization(true);
    // Guarda el idioma antes de emitir la señal de sincronización a otras pestañas.
    saveLocalePreference(router.locale || "es");
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
