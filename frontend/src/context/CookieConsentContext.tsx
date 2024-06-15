import { createContext, useContext, useState, ReactNode } from "react";

interface CookieConsentContextType {
  cookieConsent: boolean;
  setCookieConsent: (consent: boolean) => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [cookieConsent, setCookieConsent] = useState<boolean>(false);

  return <CookieConsentContext.Provider value={{ cookieConsent, setCookieConsent }}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
}
