// hooks/useCookieLogic.ts
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCookieConsent } from "../contexts/CookieContext";
import { deleteCookieGA } from "@/utils/deleteCookies";
import ReactGA from "react-ga4";

export function useCookieLogic() {
  const [locale, setLocale] = useState<string>("es");
  const [messages, setMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true);
  const [showCookieModal, setShowCookieModal] = useState<boolean>(false);
  const [cookiesModalClosed, setCookiesModalClosed] = useState<boolean>(false);
  const router = useRouter();

  const {
    setCookieConsentAnalysis,
    cookieConsentAnalysisGoogle,
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

  useEffect(() => {
    const cookieValuePersonalization = document.cookie
      .split("; ")
      .find((row) => row.startsWith("_locale="))
      ?.split("=")[1];
    const cookieNameAnalysis = document.cookie.split("; ").find((row) => row.startsWith("_visited="));
    const cookieNameAnalysisGoogle = document.cookie.split("; ").find((row) => row.startsWith("_ga="));

    if (cookieValuePersonalization && ["es", "en", "de"].includes(cookieValuePersonalization)) {
      setLocale(cookieValuePersonalization);
      setCookieConsentPersonalization(true);
    } else {
      setLocale(navigator.language.slice(0, 2));
    }
    if (cookieNameAnalysis) {
      setCookieConsentAnalysis(true);
    }
    if (cookieNameAnalysisGoogle) {
      setCookieConsentAnalysisGoogle(true);
      initGA();
    } else {
      deleteCookieGA();
    }
    if (!cookieNameAnalysis && !cookieNameAnalysisGoogle && !cookieValuePersonalization) {
      setShowCookieModal(true);
    } else {
      setCookiesModalClosed(true);
    }
  }, [setCookieConsentPersonalization, setCookieConsentAnalysis, setCookieConsentAnalysisGoogle]);

  useEffect(() => {
    setLoadingMessages(true);
    import(`../locales/${locale}.json`).then((msgs) => {
      setMessages(msgs.default);
      setLoadingMessages(false);
    });
  }, [locale]);

  useEffect(() => {
    if (cookieConsentPersonalization) {
      document.cookie = `_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [locale, cookieConsentPersonalization]);

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    if (cookieConsentPersonalization) {
      document.cookie = `_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  const handleCookiesPolicyLinkClick = () => {
    resetCookieConsent();
    setShowCookieModal(false);
    setCookiesModalClosed(true);
    router.push("/politica-cookies");
  };

  const handlePrivacyPolicyLinkClick = () => {
    resetCookieConsent();
    setShowCookieModal(false);
    setCookiesModalClosed(true);
    router.push("/politica-privacidad");
  };

  const resetCookieConsent = () => {
    setAcceptCookieAnalysis(false);
    setCookieConsentAnalysis(false);
    setAcceptCookieAnalysisGoogle(false);
    setCookieConsentAnalysisGoogle(false);
    setAcceptCookiePersonalization(false);
    setCookieConsentPersonalization(false);
  };

  const createDeviceCookie = () => {
    const deviceInfo = {
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "Tablet-Mobile" : "PC",
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
    };
    document.cookie = `_device=${JSON.stringify(deviceInfo)}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const initGA = () => {
    if (!window.ga) {
      const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
      if (!analyticsId) {
        throw new Error("Google Analytics ID no está definido en las variables de entorno.");
      }
      ReactGA.initialize(analyticsId);
      console.log("ga4 iniciado");
    }
  };

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

  const handleDeclineAllCookies = () => {
    resetCookieConsent();
    setShowCookieModal(false);
    setCookiesModalClosed(true);
  };

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
