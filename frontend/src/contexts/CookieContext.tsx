import { createContext, useContext, useState, ReactNode } from "react";

interface CookieConsentContextType {
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

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
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

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
}
