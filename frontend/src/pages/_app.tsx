// pages/_app.tsx

import React, { useEffect } from "react";
import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastify.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/carousel.css";
import "animate.css";
import "../styles/fonts.css";
import "../styles/animateButton.css";
import "../styles/scrollbar.css";
import "../styles/globals.css";

import type { AppProps } from "next/app";
import { IntlProvider } from "react-intl";
import { ToastContainer } from "react-toastify";
import { CookieConsentProvider } from "../contexts/CookieContext";
import { MenuProvider } from "../contexts/MenuContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Cookie from "../components/Cookie";
import { useCookieLogic } from "../hooks/useCookieLogic";
import { useMapLocale } from "../hooks/useMapLocale";
import { DefaultSeo } from "next-seo";
import getSEOConfig from "../config/next-seo.config";
import useLocaleFormatted from "../hooks/useLocaleFormatted";

// Importa los mensajes de traducción de forma estática
import esMessages from "../locales/es/common.json";
import enMessages from "../locales/en/common.json";
import deMessages from "../locales/de/common.json";

// Mapea los locales a sus respectivos mensajes
const messages: Record<string, Record<string, string>> = {
  es: esMessages,
  en: enMessages,
  de: deMessages,
};

export interface CustomAppProps extends AppProps {
  Component: AppProps["Component"] & { pageTitleText?: string };
}

function MainComponent({ Component, pageProps, router }: CustomAppProps): JSX.Element {
  const {
    showCookieModal,
    cookiesModalClosed,
    handleCookiesPolicyLinkClick,
    handlePrivacyPolicyLinkClick,
    handleAcceptCookies,
    handleDeclineAllCookies,
    handleAcceptAllCookies,
  } = useCookieLogic();

  const mapLocale = useMapLocale();
  const appLocale = router.locale || "es";
  const formattedLocale = useLocaleFormatted(appLocale);

  const currentMessages = messages[appLocale] || messages["es"];

  // Actualiza el atributo `lang` del documento HTML
  useEffect(() => {
    const updateLang = (): void => {
      document.documentElement.lang = formattedLocale;
    };

    // Ejecutar inmediatamente
    updateLang();

    // También ejecutar después de la navegación
    router.events.on("routeChangeComplete", updateLang);

    return () => {
      router.events.off("routeChangeComplete", updateLang);
    };
  }, [formattedLocale, router.events]);

  const pageTitleText = Component.pageTitleText || "default";

  return (
    <>
      <Head>
        <title>Paraíso del Jamón</title>
        <meta name="description" content="Paraíso del Jamón" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <IntlProvider locale={appLocale} messages={currentMessages}>
        <DefaultSeo {...getSEOConfig(appLocale, currentMessages)} />
        <MenuProvider>
          <React.StrictMode>
            {showCookieModal && (
              <Cookie
                onAccept={handleAcceptCookies}
                onDeclineAll={handleDeclineAllCookies}
                onAcceptAll={handleAcceptAllCookies}
                onCookiesPolicyLinkClick={handleCookiesPolicyLinkClick}
                onPrivacyPolicyLinkClick={handlePrivacyPolicyLinkClick}
              />
            )}
            <Navbar cookiesModalClosed={cookiesModalClosed} pageTitleText={pageTitleText} />
            <Component {...pageProps} cookiesModalClosed={cookiesModalClosed} mapLocale={mapLocale} />
            <Footer />
            <ToastContainer />
          </React.StrictMode>
        </MenuProvider>
      </IntlProvider>
    </>
  );
}

export default function App(props: CustomAppProps): JSX.Element {
  return (
    <CookieConsentProvider>
      <MainComponent {...props} />
    </CookieConsentProvider>
  );
}
