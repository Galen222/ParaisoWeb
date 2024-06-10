import Head from "next/head";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import { IntlProvider } from "react-intl";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function App({ Component, pageProps }: AppProps) {
  const [locale, setLocale] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("Idioma="))
          ?.split("=")[1] || "es"
      );
    }
    return "es";
  });

  const messages = require(`../locales/${locale}.json`);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `Idioma=${locale}; path=/; max-age=31536000`;
  }, [locale]);

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    document.cookie = `Idioma=${newLocale}; path=/; max-age=31536000`;
  };

  return (
    <>
      <Head>
        <title>El Paraiso del Jamón</title>
        <meta name="description" content="El Paraiso del Jamón" />
      </Head>
      <IntlProvider locale={locale} messages={messages}>
        <Navbar onLocaleChange={handleLocaleChange} currentLocale={locale} />
        <Component {...pageProps} />
        <Footer />
      </IntlProvider>
    </>
  );
}
