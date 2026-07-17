// pages/_document.tsx

import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from "next/document";

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
interface MyDocumentProps extends DocumentInitialProps {
  locale: string;
  nonce?: string;
}

class MyDocument extends Document<MyDocumentProps> {
  /**
   * Método estático para obtener las propiedades iniciales del documento.
   * @param {DocumentContext} ctx - Contexto del documento de Next.js.
   * @returns {Promise<DocumentInitialProps & { locale: string }>} Propiedades iniciales del documento, incluyendo el idioma.
   */
  static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentProps> {
    // Obtiene las propiedades iniciales del documento
    const initialProps = await Document.getInitialProps(ctx);

    const currentLocale = ctx.locale || "es";
    // Mapea el prefijo de idioma al código completo o usa 'es-ES' por defecto si no está en el mapa
    const formattedLocale = localeMap[currentLocale] || localeMap.es;

    const nonceHeader = ctx.req?.headers["x-nonce"];
    const nonce = Array.isArray(nonceHeader) ? nonceHeader[0] : nonceHeader;

    // Retorna las propiedades iniciales junto con el idioma y el nonce de la petición.
    return { ...initialProps, locale: formattedLocale, nonce };
  }

  /**
   * Renderiza el documento HTML con el atributo `lang` configurado dinámicamente.
   * @returns {React.JSX.Element} Estructura HTML con el atributo `lang`.
   */
  render(): React.JSX.Element {
    return (
      // Establece el atributo `lang` del elemento `<html>` basado en el idioma detectado
      <Html lang={this.props.locale}>
        <Head nonce={this.props.nonce}>
          {/* Meta Tags y Enlaces Globales */}
          <link rel="icon" href="/images/web/iconoLogo.ico" />
          <meta name="theme-color" content="#4a403a" />
          {/* Google Maps reutiliza el primer nonce presente en un elemento style. */}
          <style nonce={this.props.nonce}>{""}</style>
        </Head>
        <body>
          {/* Renderiza el contenido principal de la aplicación */}
          <Main />
          <NextScript nonce={this.props.nonce} />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
