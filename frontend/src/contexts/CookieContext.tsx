// contexts/CookieContext.tsx

import { createContext, useContext, useState, ReactNode } from "react";

/**
 * Interfaz para el contexto de consentimiento de cookies.
 * @property {boolean} cookieConsentAnalysis - Indica si se ha dado consentimiento para cookies de análisis.
 * @property {(consent: boolean) => void} setCookieConsentAnalysis - Función para actualizar el consentimiento de cookies de análisis.
 * @property {boolean} cookieConsentAnalysisGoogle - Indica si se ha dado consentimiento para cookies de análisis de Google.
 * @property {(consent: boolean) => void} setCookieConsentAnalysisGoogle - Función para actualizar el consentimiento de cookies de análisis de Google.
 * @property {boolean} cookieConsentPersonalization - Indica si se ha dado consentimiento para cookies de personalización.
 * @property {(consent: boolean) => void} setCookieConsentPersonalization - Función para actualizar el consentimiento de cookies de personalización.
 * @property {boolean} AcceptCookieAnalysis - Indica si se ha aceptado el uso de cookies de análisis.
 * @property {(value: boolean) => void} setAcceptCookieAnalysis - Función para aceptar o rechazar el uso de cookies de análisis.
 * @property {boolean} AcceptCookieAnalysisGoogle - Indica si se ha aceptado el uso de cookies de análisis de Google.
 * @property {(value: boolean) => void} setAcceptCookieAnalysisGoogle - Función para aceptar o rechazar el uso de cookies de análisis de Google.
 * @property {boolean} AcceptCookiePersonalization - Indica si se ha aceptado el uso de cookies de personalización.
 * @property {(value: boolean) => void} setAcceptCookiePersonalization - Función para aceptar o rechazar el uso de cookies de personalización.
 */
export interface CookieConsentContextType {
  cookieConsentAnalysis: boolean;
  setCookieConsentAnalysis: (consent: boolean) => void;
  cookieConsentAnalysisGoogle: boolean;
  setCookieConsentAnalysisGoogle: (consent: boolean) => void;
  cookieConsentPersonalization: boolean;
  setCookieConsentPersonalization: (consent: boolean) => void;
  AcceptCookieAnalysis: boolean;
  setAcceptCookieAnalysis: (value: boolean) => void;
  AcceptCookieAnalysisGoogle: boolean;
  setAcceptCookieAnalysisGoogle: (value: boolean) => void;
  AcceptCookiePersonalization: boolean;
  setAcceptCookiePersonalization: (value: boolean) => void;
}

// Crear el contexto para el consentimiento de cookies
const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

/**
 * Proveedor de consentimiento de cookies
 *
 * Proporciona un contexto para gestionar el estado del consentimiento de cookies,
 * incluyendo análisis, personalización y cookies específicas de Google.
 *
 * @param {ReactNode} children - Componentes hijos que estarán dentro del proveedor.
 * @returns {JSX.Element} Proveedor del contexto de consentimiento de cookies.
 */
export function CookieConsentProvider({ children }: { children: ReactNode }) {
  // Estados para el consentimiento y aceptación de diferentes tipos de cookies
  const [cookieConsentAnalysis, setCookieConsentAnalysis] = useState<boolean>(false);
  const [cookieConsentAnalysisGoogle, setCookieConsentAnalysisGoogle] = useState<boolean>(false);
  const [cookieConsentPersonalization, setCookieConsentPersonalization] = useState<boolean>(false);
  const [AcceptCookieAnalysis, setAcceptCookieAnalysis] = useState<boolean>(false);
  const [AcceptCookieAnalysisGoogle, setAcceptCookieAnalysisGoogle] = useState<boolean>(false);
  const [AcceptCookiePersonalization, setAcceptCookiePersonalization] = useState<boolean>(false);

  return (
    <CookieConsentContext.Provider
      value={{
        cookieConsentAnalysis,
        setCookieConsentAnalysis,
        cookieConsentAnalysisGoogle,
        setCookieConsentAnalysisGoogle,
        cookieConsentPersonalization,
        setCookieConsentPersonalization,
        AcceptCookieAnalysis,
        setAcceptCookieAnalysis,
        AcceptCookieAnalysisGoogle,
        setAcceptCookieAnalysisGoogle,
        AcceptCookiePersonalization,
        setAcceptCookiePersonalization,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

/**
 * Hook personalizado para acceder al contexto de consentimiento de cookies.
 *
 * @throws Error si se usa fuera de un `CookieConsentProvider`.
 * @returns {CookieConsentContextType} El contexto de consentimiento de cookies.
 */
export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent debe ser usado con CookieConsentProvider");
  }
  return context;
}
