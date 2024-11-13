// pages/_document.tsx

import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

// Mapeo de prefijos de idioma a códigos completos (por ejemplo, 'en' a 'en-US')
const localeMap: Record<string, string> = {
  es: "es-ES", // Español
  en: "en-US", // Inglés
  de: "de-DE", // Alemán
};

/**
 * Clase personalizada de documento para Next.js.
 * Configura el atributo `lang` en `<html>` basado en el prefijo de idioma.
 */
class MyDocument extends Document<{ locale: string }> {
  /**
   * Método estático para obtener las propiedades iniciales del documento.
   * @param {DocumentContext} ctx - Contexto del documento de Next.js.
   * @returns {Promise<any>} Propiedades iniciales del documento, incluyendo el idioma.
   */
  static async getInitialProps(ctx: DocumentContext): Promise<any> {
    // Obtiene las propiedades iniciales del documento
    const initialProps = await Document.getInitialProps(ctx);

    const currentLocale = ctx.locale || "es";
    // Mapea el prefijo de idioma al código completo o usa 'es-ES' por defecto si no está en el mapa
    const formattedLocale = localeMap[currentLocale] || localeMap.es;

    // Retorna las propiedades iniciales junto con el idioma
    return { ...initialProps, locale: formattedLocale };
  }

  /**
   * Renderiza el documento HTML con el atributo `lang` configurado dinámicamente.
   * @returns {JSX.Element} Estructura HTML con el atributo `lang`.
   */
  render(): JSX.Element {
    return (
      // Establece el atributo `lang` del elemento `<html>` basado en el idioma detectado
      <Html lang={this.props.locale}>
        <Head>
          {/* Meta Tags y Enlaces Globales */}
          <link rel="icon" href="/images/web/iconoLogo.ico" />
          <meta name="theme-color" content="#4a403a" />
        </Head>
        <body>
          {/* Renderiza el contenido principal de la aplicación */}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
