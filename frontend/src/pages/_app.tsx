// pages/_app.tsx

import React, { useEffect } from "react";
import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css"; // Estilos de Bootstrap
import "react-toastify/dist/ReactToastify.css"; // Estilos de React-Toastify
import "@/styles/toastify.css"; // Estilos personalizados de React-Toastify
import "slick-carousel/slick/slick.css"; // Estilos de Slick (Carousel)
import "slick-carousel/slick/slick-theme.css"; // Estilos de Slick (Carousel)
import "@/styles/carousel.css"; // Estilos personalizados de Slick (Carousel)
import "animate.css"; // Estilos de la libreria de animación
import "@/styles/fonts.css"; // Estilos de fuentes añadidas
import "@/styles/animateButton.css"; // Estilos de animación de botones
import "@/styles/scrollbar.css"; // Estilos de la barra de scroll del navegador
import "@/styles/globals.css"; // Estilos globales

import type { AppProps as NextAppProps } from "next/app";
import { IntlProvider } from "react-intl";
import { ToastContainer } from "react-toastify";
import { CookieConsentProvider } from "../contexts/CookieContext";
import { MenuProvider } from "../contexts/MenuContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Cookie from "../components/Cookie";
import Loader from "../components/Loader";
import { useCookieLogic } from "../hooks/useCookieLogic";
import { DefaultSeo } from "next-seo"; // Importa DefaultSeo
import SEO from "../next-seo.config"; // Importa la configuración de SEO

import useLocaleFormatted from "../hooks/useLocaleFormatted"; // Importa el hook personalizado

/**
 * Extiende `AppProps` de Next.js e incluye una propiedad opcional `pageTitleText`
 * para definir el título de la página.
 */
export interface CustomAppProps extends NextAppProps {
  Component: NextAppProps["Component"] & { pageTitleText?: string };
}

/**
 * Componente principal para manejar el layout y el contexto global.
 * Incluye proveedores de contexto, gestión de cookies y lógica de idioma.
 *
 * @param {CustomAppProps} props - Propiedades del componente.
 * @returns {JSX.Element} Componente de la aplicación principal.
 */
function MainComponent({ Component, pageProps, router }: CustomAppProps): JSX.Element {
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

  const formattedLocale = useLocaleFormatted(locale); // Pasar el locale directamente

  // Actualiza el atributo `lang` del documento HTML cada vez que cambia el locale
  useEffect(() => {
    document.documentElement.lang = formattedLocale;
  }, [formattedLocale]);

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
      <DefaultSeo {...SEO} />
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
export default function App({ Component, pageProps, router }: CustomAppProps): JSX.Element {
  return (
    <CookieConsentProvider>
      <MainComponent Component={Component} pageProps={pageProps} router={router} />
    </CookieConsentProvider>
  );
}
