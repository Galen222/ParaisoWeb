// _app.tsx
import Head from "next/head";
import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import type { AppProps } from "next/app";
import React from "react";
import { IntlProvider } from "react-intl";
import { useRouter } from "next/router";
import { CookieConsentProvider, useCookieConsent } from "../context/CookieConsentContext";
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
  const { cookieConsent, setCookieConsent } = useCookieConsent();
  const [showCookieModal, setShowCookieModal] = React.useState<boolean>(true);
  const router = useRouter();

  React.useEffect(() => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("locale="))
      ?.split("=")[1];

    if (cookieValue && ["es", "en", "de"].includes(cookieValue)) {
      setLocale(cookieValue);
      setCookieConsent(true);
      setShowCookieModal(false);
    } else {
      setLocale(navigator.language.slice(0, 2));
    }
  }, [setCookieConsent]);

  React.useEffect(() => {
    import(`../locales/${locale}.json`).then((msgs) => setMessages(msgs.default));
  }, [locale]);

  React.useEffect(() => {
    if (cookieConsent) {
      document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [locale, cookieConsent]);

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    if (cookieConsent) {
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  const handlePolicyLinkClick = () => {
    setShowCookieModal(false);
    setCookieConsent(false);
    router.push("/politica-cookies");
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
                setCookieConsent(true);
                setShowCookieModal(false);
              }}
              onDecline={() => {
                setCookieConsent(false);
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
