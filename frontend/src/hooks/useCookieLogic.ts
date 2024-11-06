import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCookieConsent } from "../contexts/CookieContext";
import { createDeviceCookie } from "@/utils/cookieUtils";
import { initGA } from "@/utils/gaUtils"; // Importa la función desde utils

// Define la interfaz para las propiedades devueltas por el hook
interface CookieLogic {
  locale: string;
  mapLocale: string;
  messages: Record<string, any>;
  loadingMessages: boolean;
  showCookieModal: boolean;
  cookiesModalClosed: boolean;
  handleLocaleChange: (newLocale: string) => void;
  handleCookiesPolicyLinkClick: () => void;
  handlePrivacyPolicyLinkClick: () => void;
  handleAcceptCookies: () => void;
  handleDeclineAllCookies: () => void;
  handleAcceptAllCookies: () => void;
}

/**
 * Hook personalizado para gestionar la lógica de consentimiento de cookies.
 * Controla la configuración del idioma, carga de mensajes, y la presentación del modal de cookies,
 * además de gestionar los consentimientos para análisis, personalización y cookies de Google.
 *
 * @returns {CookieLogic} Objeto con variables y funciones para la gestión de cookies y consentimiento.
 */
export function useCookieLogic(): CookieLogic {
  const [locale, setLocale] = useState<string>("es"); // Estado del idioma actual
  const [mapLocale, setMapLocale] = useState<string>(""); // Estado del idioma del mapa
  const [messages, setMessages] = useState({}); // Estado para los mensajes de localización
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true); // Indica si los mensajes están cargando
  const [showCookieModal, setShowCookieModal] = useState<boolean>(false); // Estado para mostrar el modal de cookies
  const [cookiesModalClosed, setCookiesModalClosed] = useState<boolean>(false); // Indica si el modal de cookies está cerrado
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

  // Efecto para verificar cookies y establecer idioma inicial
  useEffect(() => {
    let initialLocale = "es";

    const cookieValuePersonalization = document.cookie
      .split("; ")
      .find((row) => row.startsWith("_locale="))
      ?.split("=")[1];
    const cookieNameAnalysis = document.cookie.split("; ").find((row) => row.startsWith("_visited="));
    const cookieNameAnalysisGoogle = document.cookie.split("; ").find((row) => row.startsWith("_ga="));

    if (cookieValuePersonalization && ["es", "en", "de"].includes(cookieValuePersonalization)) {
      initialLocale = cookieValuePersonalization;
      setCookieConsentPersonalization(true);
    } else {
      const browserLocale = navigator.language.slice(0, 2);
      if (["es", "en", "de"].includes(browserLocale)) {
        initialLocale = browserLocale;
      }
    }
    setLocale(initialLocale);
    if (mapLocale === "") {
      setMapLocale(initialLocale);
    }
    if (cookieNameAnalysis) {
      setCookieConsentAnalysis(true);
    }
    if (cookieNameAnalysisGoogle) {
      setCookieConsentAnalysisGoogle(true);
      initGA();
    }
    if (!cookieNameAnalysis && !cookieNameAnalysisGoogle && !cookieValuePersonalization) {
      setShowCookieModal(true);
    } else {
      setCookiesModalClosed(true);
    }
  }, [setCookieConsentPersonalization, setCookieConsentAnalysis, setCookieConsentAnalysisGoogle]);

  // Efecto para cargar los mensajes de localización en base al idioma seleccionado
  useEffect(() => {
    setLoadingMessages(true);
    import(`../locales/${locale}.json`).then((msgs) => {
      setMessages(msgs.default);
      setLoadingMessages(false);
    });
  }, [locale]);

  // Efecto para guardar el idioma en cookies si se ha aceptado la personalización
  useEffect(() => {
    if (cookieConsentPersonalization) {
      document.cookie = `_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [locale, cookieConsentPersonalization]);

  /**
   * Cambia el idioma de la aplicación y guarda en cookies si se permite la personalización.
   * @param {string} newLocale - Nuevo idioma a establecer.
   */
  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    if (cookieConsentPersonalization) {
      document.cookie = `_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  /**
   * Maneja el clic en el enlace de la política de cookies, reinicia el consentimiento y redirige.
   */
  const handleCookiesPolicyLinkClick = () => {
    resetCookieConsent();
    setShowCookieModal(false);
    setCookiesModalClosed(true);
    router.push("/politica-cookies");
  };

  /**
   * Maneja el clic en el enlace de la política de privacidad, reinicia el consentimiento y redirige.
   */
  const handlePrivacyPolicyLinkClick = () => {
    resetCookieConsent();
    setShowCookieModal(false);
    setCookiesModalClosed(true);
    router.push("/politica-privacidad");
  };

  /**
   * Reinicia el consentimiento de cookies a su estado inicial (no consentido).
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
   * Maneja la aceptación de cookies según los consentimientos seleccionados.
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
   */
  const handleDeclineAllCookies = () => {
    resetCookieConsent();
    setShowCookieModal(false);
    setCookiesModalClosed(true);
  };

  /**
   * Acepta todas las cookies (análisis, personalización y Google), cierra el modal y ejecuta `initGA`.
   */
  const handleAcceptAllCookies = () => {
    setAcceptCookieAnalysis(true);
    setCookieConsentAnalysis(true);
    createDeviceCookie();
    setAcceptCookieAnalysisGoogle(true);
    setCookieConsentAnalysisGoogle(true);
    setAcceptCookiePersonalization(true);
    setCookieConsentPersonalization(true);
    setShowCookieModal(false);
    setCookiesModalClosed(true);
    initGA();
  };

  return {
    locale,
    mapLocale,
    messages,
    loadingMessages,
    showCookieModal,
    cookiesModalClosed,
    handleLocaleChange,
    handleCookiesPolicyLinkClick,
    handlePrivacyPolicyLinkClick,
    handleAcceptCookies,
    handleDeclineAllCookies,
    handleAcceptAllCookies,
  };
}
