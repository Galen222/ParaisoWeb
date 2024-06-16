import { createContext, useContext, useState, ReactNode } from "react";

interface CookieConsentContextType {
  cookieConsentAnalysis: boolean;
  setCookieConsentAnalysis: (consent: boolean) => void;
  cookieConsentPersonalization: boolean;
  setCookieConsentPersonalization: (consent: boolean) => void;
  AcceptCookieAnalysis: boolean;
  setAcceptCookieAnalysis: (value: boolean) => void;
  AcceptCookiePersonalization: boolean;
  setAcceptCookiePersonalization: (value: boolean) => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [cookieConsentAnalysis, setCookieConsentAnalysis] = useState<boolean>(false);
  const [cookieConsentPersonalization, setCookieConsentPersonalization] = useState<boolean>(false);
  const [AcceptCookieAnalysis, setAcceptCookieAnalysis] = useState(true);
  const [AcceptCookiePersonalization, setAcceptCookiePersonalization] = useState(true);

  return (
    <CookieConsentContext.Provider
      value={{
        cookieConsentAnalysis,
        setCookieConsentAnalysis,
        cookieConsentPersonalization,
        setCookieConsentPersonalization,
        AcceptCookieAnalysis,
        setAcceptCookieAnalysis,
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
