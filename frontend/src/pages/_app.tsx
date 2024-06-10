import Head from "next/head";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import { IntlProvider } from "react-intl";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function App({ Component, pageProps, router }: AppProps) {
  const [locale, setLocale] = useState("es");
  const messages = require(`../locales/${locale}.json`);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/`;
  };

  return (
    <>
      <Head>
        <title>El Paraiso del Jamón</title>
        <meta name="description" content="El Paraiso del Jamón" />
      </Head>
      <IntlProvider locale={locale} messages={messages}>
        <Navbar onLocaleChange={handleLocaleChange} />
        <Component {...pageProps} />
        <Footer />
      </IntlProvider>
    </>
  );
}
