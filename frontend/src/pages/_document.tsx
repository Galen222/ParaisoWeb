// pages/_document.tsx

import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

/**
 * Clase personalizada de documento para Next.js.
 * Configura el atributo `lang` en `<html>` dinámicamente.
 */
class MyDocument extends Document {
  /**
   * Método estático para obtener las propiedades iniciales del documento.
   *
   * @param {DocumentContext} ctx - Contexto del documento de Next.js.
   * @returns {Promise} Propiedades iniciales del documento.
   */
  static async getInitialProps(ctx: DocumentContext): Promise<any> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  /**
   * Renderiza el documento HTML.
   * El atributo `lang` se maneja en `_app.tsx`, por lo que se puede establecer en un valor predeterminado aquí.
   *
   * @returns {JSX.Element} Estructura HTML con el atributo `lang`.
   */
  render(): JSX.Element {
    return (
      <Html lang="es-ES">
        {" "}
        {/* Valor predeterminado, se sobrescribe en _app.tsx */}
        <Head>
          {/* Meta Tags y Enlaces Globales */}
          <link rel="icon" href="/images/web/iconoLogo.ico" />
          <meta name="theme-color" content="#4a403a" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
