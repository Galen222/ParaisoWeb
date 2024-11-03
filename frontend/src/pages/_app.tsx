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
import "../styles/scrollbar.css";
import "@/styles/globals.css";
import type { AppProps as NextAppProps } from "next/app";
import { IntlProvider } from "react-intl";
import { ToastContainer } from "react-toastify";
import { CookieConsentProvider } from "../contexts/CookieContext";
import { MenuProvider } from "../contexts/MenuContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Cookie from "../components/Cookie";
import { useCookieLogic } from "../hooks/useCookieLogic";
import Loader from "../components/Loader";

/**
 * Extiende `AppProps` de Next.js e incluye una propiedad opcional `pageTitleText`
 * para definir el título de la página.
 */
interface CustomAppProps extends NextAppProps {
  Component: NextAppProps["Component"] & { pageTitleText?: string };
}

/**
 * Componente principal para manejar el layout y el contexto global.
 * Incluye proveedores de contexto, gestión de cookies y lógica de idioma.
 *
 * @param {CustomAppProps} props - Propiedades del componente.
 * @returns {JSX.Element} Componente de la aplicación principal.
 */
function MainComponent({ Component, pageProps, router }: CustomAppProps) {
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
    mapLocale,
  } = useCookieLogic(); // Lógica personalizada para manejo de cookies e internacionalización

  if (loadingMessages) {
    return <Loader />; // Muestra un loader mientras los mensajes están cargando
  }

  const pageTitleText = Component.pageTitleText || "default"; // Define el título de la página si está disponible

  return (
    <>
      <Head>
        <title>Paraíso del Jamón</title>
        <meta name="description" content="Paraíso del Jamón" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <IntlProvider locale={locale} messages={messages}>
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
            <Navbar
              onLocaleChange={handleLocaleChange}
              loadingMessages={loadingMessages}
              cookiesModalClosed={cookiesModalClosed}
              pageTitleText={pageTitleText}
            />
            <Component {...pageProps} cookiesModalClosed={cookiesModalClosed} mapLocale={mapLocale} />
            <Footer loadingMessages={loadingMessages} />
            <ToastContainer />
          </React.StrictMode>
        </MenuProvider>
      </IntlProvider>
    </>
  );
}

/**
 * Componente de entrada principal de Next.js.
 * Incluye el proveedor de consentimiento de cookies y renderiza `MainComponent`.
 *
 * @param {CustomAppProps} props - Propiedades del componente de la aplicación.
 * @returns {JSX.Element} Componente principal de la aplicación con proveedor de cookies.
 */
export default function App({ Component, pageProps, router }: CustomAppProps) {
  return (
    <CookieConsentProvider>
      <MainComponent Component={Component} pageProps={pageProps} router={router} />
    </CookieConsentProvider>
  );
}
