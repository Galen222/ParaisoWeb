// pages/_app.tsx
import React from "react";
import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "animate.css";
import "@/styles/fonts.css";
import "../styles/animateButton.css";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { IntlProvider } from "react-intl";
import { ToastContainer } from "react-toastify";
import { CookieConsentProvider } from "../contexts/CookieContext";
import { MobileMenuProvider } from "../contexts/MobileMenuContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Cookie from "../components/Cookie";
import { useCookieLogic } from "../hooks/useCookieLogic";
import Loader from "../components/Loader";

interface MainComponentProps {
  Component: React.ComponentType<AppProps>;
  pageProps: AppProps["pageProps"];
}

function MainComponent({ Component, pageProps }: MainComponentProps) {
  const {
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
  } = useCookieLogic();

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <>
      <Head>
        <title>Paraíso del Jamón</title>
        <meta name="description" content="Paraíso del Jamón" />
      </Head>
      <IntlProvider locale={locale} messages={messages}>
        <MobileMenuProvider>
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
            <Navbar onLocaleChange={handleLocaleChange} currentLocale={locale} loadingMessages={loadingMessages} />
            <Component {...pageProps} cookiesModalClosed={cookiesModalClosed} />
            <Footer loadingMessages={loadingMessages} />
            <ToastContainer />
          </React.StrictMode>
        </MobileMenuProvider>
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
