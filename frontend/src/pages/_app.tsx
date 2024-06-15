// _app.tsx
import Head from "next/head";
import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import type { AppProps } from "next/app";
import React, { useState, useEffect } from "react";
import { IntlProvider } from "react-intl";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Cookie from "../components/Cookie";

export default function App({ Component, pageProps }: AppProps) {
  const [locale, setLocale] = useState<string>("es");
  const [messages, setMessages] = useState({});
  const [cookieConsent, setCookieConsent] = useState<boolean>(false);
  const [showCookieModal, setShowCookieModal] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    import(`../locales/${locale}.json`).then((msgs) => setMessages(msgs.default));
  }, [locale]);

  useEffect(() => {
    if (cookieConsent) {
      document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [locale, cookieConsent]);

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    setCookieConsent(true);
    setShowCookieModal(false);
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
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
