// _app.tsx
import Head from "next/head";
import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import type { AppProps } from "next/app";
import React from "react";
import { IntlProvider } from "react-intl";
import { useRouter } from "next/router";
import { CookieConsentProvider, useCookieConsent } from "../context/CookieContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Cookie from "../components/Cookie";

interface MainComponentProps {
  Component: React.ComponentType<AppProps>;
  pageProps: AppProps["pageProps"];
}

function MainComponent({ Component, pageProps }: MainComponentProps) {
  const [locale, setLocale] = React.useState<string>("es");
  const [messages, setMessages] = React.useState({});
  const {
    setCookieConsentAnalysis,
    cookieConsentPersonalization,
    setCookieConsentPersonalization,
    setAcceptCookieAnalysis,
    AcceptCookieAnalysis,
    setAcceptCookiePersonalization,
    AcceptCookiePersonalization,
  } = useCookieConsent();
  const [showCookieModal, setShowCookieModal] = React.useState<boolean>(false);
  const router = useRouter();

  React.useEffect(() => {
    const cookieValuePersonalization = document.cookie
      .split("; ")
      .find((row) => row.startsWith("_locale="))
      ?.split("=")[1];
    const cookieNameAnalysis = document.cookie.split("; ").find((row) => row.startsWith("_visited="));

    if (cookieValuePersonalization && ["es", "en", "de"].includes(cookieValuePersonalization)) {
      setLocale(cookieValuePersonalization);
      setCookieConsentPersonalization(true);
    } else {
      setLocale(navigator.language.slice(0, 2));
    }
    if (cookieNameAnalysis) {
      setCookieConsentAnalysis(true);
    }
    if (!cookieNameAnalysis && !cookieValuePersonalization) {
      setShowCookieModal(true);
    }
  }, [setCookieConsentPersonalization, setCookieConsentAnalysis]);

  React.useEffect(() => {
    import(`../locales/${locale}.json`).then((msgs) => setMessages(msgs.default));
  }, [locale]);

  React.useEffect(() => {
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
    setShowCookieModal(false);
    setCookieConsentPersonalization(false);
    setCookieConsentAnalysis(false);
    router.push("/politica-cookies");
  };

  const handlePrivacyPolicyLinkClick = () => {
    setShowCookieModal(false);
    setCookieConsentPersonalization(false);
    setCookieConsentAnalysis(false);
    router.push("/politica-privacidad");
  };

  const createDeviceCookie = () => {
    const deviceInfo = {
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "PC",
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
    };

    document.cookie = `_device=${JSON.stringify(deviceInfo)}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <>
      <Head>
        <title>Paraíso del Jamón</title>
        <meta name="description" content="Paraíso del Jamón" />
      </Head>
      <IntlProvider locale={locale} messages={messages}>
        <React.StrictMode>
          {showCookieModal && (
            <Cookie
              onAccept={() => {
                if (AcceptCookieAnalysis) {
                  setCookieConsentAnalysis(true);
                  createDeviceCookie();
                } else {
                  setCookieConsentAnalysis(false);
                }
                if (AcceptCookiePersonalization) {
                  setCookieConsentPersonalization(true);
                } else {
                  setCookieConsentPersonalization(false);
                }
                setShowCookieModal(false);
              }}
              onDeclineAll={() => {
                setAcceptCookieAnalysis(false);
                setCookieConsentAnalysis(false);
                setAcceptCookiePersonalization(false);
                setCookieConsentPersonalization(false);
                setShowCookieModal(false);
              }}
              onAcceptAll={() => {
                setAcceptCookieAnalysis(true);
                setCookieConsentAnalysis(true);
                setAcceptCookiePersonalization(true);
                setCookieConsentPersonalization(true);
                setShowCookieModal(false);
              }}
              onCookiesPolicyLinkClick={handleCookiesPolicyLinkClick}
              onPrivacyPolicyLinkClick={handlePrivacyPolicyLinkClick}
            />
          )}
          <Navbar onLocaleChange={handleLocaleChange} currentLocale={locale} />
          <Component {...pageProps} />
          <Footer />
        </React.StrictMode>
      </IntlProvider>
    </>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CookieConsentProvider>
      <MainComponent Component={Component} pageProps={pageProps} />
    </CookieConsentProvider>
  );
}
