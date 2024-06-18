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

// Definir los tipos para las props de MainComponent
interface MainComponentProps {
  Component: React.ComponentType<AppProps>; // Define el tipo de Component como un componente React que acepta AppProps
  pageProps: AppProps["pageProps"]; // Define el tipo de pageProps como pageProps de AppProps
}

function MainComponent({ Component, pageProps }: MainComponentProps) {
  const [locale, setLocale] = React.useState<string>("es");
  const [messages, setMessages] = React.useState({});
  const { setCookieConsentAnalysis, cookieConsentPersonalization, setCookieConsentPersonalization, AcceptCookieAnalysis, AcceptCookiePersonalization } =
    useCookieConsent();
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
      // Aqui crea la cookie _info
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

  const handlePolicyLinkClick = () => {
    setShowCookieModal(false);
    setCookieConsentPersonalization(false);
    setCookieConsentAnalysis(false);
    router.push("/politica-cookies");
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
                setShowCookieModal(false);
                if (AcceptCookieAnalysis) {
                  setCookieConsentAnalysis(true);
                  createDeviceCookie();
                  console.log("entra en true paginas");
                } else {
                  setCookieConsentAnalysis(false);
                  console.log("entra en false paginas");
                }
                if (AcceptCookiePersonalization) {
                  setCookieConsentPersonalization(true);
                  console.log("entra en true idioma");
                } else {
                  setCookieConsentPersonalization(false);
                  console.log("entra en false idioma");
                }
              }}
              onDecline={() => {
                setShowCookieModal(false);
              }}
              onPolicyLinkClick={handlePolicyLinkClick}
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

// Componente App que envuelve todo con CookieConsentProvider
export default function App({ Component, pageProps }: AppProps) {
  return (
    <CookieConsentProvider>
      <MainComponent Component={Component} pageProps={pageProps} />
    </CookieConsentProvider>
  );
}
