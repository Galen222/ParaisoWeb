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

import NextApp, { type AppContext, type AppInitialProps, type AppProps } from "next/app";
import { IntlProvider } from "react-intl";
import { ToastContainer } from "react-toastify";
import { CookieConsentProvider } from "../contexts/CookieContext";
import { MenuProvider } from "../contexts/MenuContext";
import { CspNonceProvider } from "../contexts/CspNonceContext";
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
import frMessages from "../locales/fr/common.json";

// Mapea los locales a sus respectivos mensajes
const messages: Record<string, Record<string, string>> = {
  es: esMessages,
  en: enMessages,
  de: deMessages,
  fr: frMessages,
};

interface CustomPageProps extends Record<string, unknown> {
  nonce?: string;
}

export interface CustomAppProps extends AppProps<CustomPageProps> {
  Component: AppProps["Component"] & { pageTitleText?: string };
}

function MainComponent({ Component, pageProps, router }: CustomAppProps): React.JSX.Element {
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
  const isBlogContentError = router.pathname === "/blog/[slug]" && Boolean(pageProps.error);
  const isErrorPage = router.pathname === "/404" || router.pathname === "/_error" || isBlogContentError;
  // Las páginas de error no representan una URL canónica ni traducciones equivalentes.
  // Publicar `/404` como canonical/hreflang asociaba cualquier URL inexistente a una
  // ruta técnica que tampoco debe indexarse.
  const seoPath = isErrorPage ? undefined : router.asPath;
  const includeLanguageAlternates = !isErrorPage && router.pathname !== "/blog/[slug]";

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
        <title>El Paraíso Del Jamón</title>
        <meta name="description" content="El Paraíso Del Jamón" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <IntlProvider locale={appLocale} messages={currentMessages}>
        <DefaultSeo {...getSEOConfig(appLocale, currentMessages, seoPath, includeLanguageAlternates)} />
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
            <main>
              <Component {...pageProps} cookiesModalClosed={cookiesModalClosed} mapLocale={mapLocale} />
            </main>
            <Footer />
            <ToastContainer />
          </React.StrictMode>
        </MenuProvider>
      </IntlProvider>
    </>
  );
}

function App(props: CustomAppProps): React.JSX.Element {
  return (
    <CspNonceProvider nonce={props.pageProps.nonce}>
      <CookieConsentProvider>
        <MainComponent {...props} />
      </CookieConsentProvider>
    </CspNonceProvider>
  );
}

App.getInitialProps = async (appContext: AppContext): Promise<AppInitialProps> => {
  const appProps = await NextApp.getInitialProps(appContext);
  const nonceHeader = appContext.ctx.req?.headers["x-nonce"];
  const nonce = Array.isArray(nonceHeader) ? nonceHeader[0] : nonceHeader;
  return { ...appProps, pageProps: { ...appProps.pageProps, nonce } };
};

export default App;
