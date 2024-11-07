// pages/_document.tsx

import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

/**
 * Clase personalizada de documento para Next.js.
 * Permite configurar el idioma del atributo `lang` en `<html>` basado en una cookie o en la configuración de idioma del navegador.
 */
class MyDocument extends Document {
  /**
   * Método estático para obtener las propiedades iniciales del documento.
   * Intenta determinar el idioma preferido del usuario a partir de una cookie `_locale` o, en su defecto,
   * mediante el encabezado `accept-language` del navegador.
   *
   * @param {DocumentContext} ctx - Contexto del documento de Next.js.
   * @returns {Promise} Propiedades iniciales del documento, incluyendo el `locale` determinado.
   */
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    let locale = "es"; // Idioma por defecto

    // Intenta obtener el idioma preferido del usuario desde la cookie '_locale'
    const cookieLocale = ctx.req?.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("_locale="))
      ?.split("=")[1];

    // Valida `cookieLocale` y lo usa si coincide con los valores esperados
    if (cookieLocale && ["es", "en", "de"].includes(cookieLocale)) {
      locale = cookieLocale;
    } else if (ctx.req?.headers["accept-language"]) {
      // Alternativa: Obtiene el idioma del navegador si no hay cookie válida
      const browserLang = ctx.req.headers["accept-language"].split(",")[0].slice(0, 2);
      locale = ["es", "en", "de"].includes(browserLang) ? browserLang : "es";
    }

    return { ...initialProps, locale };
  }

  /**
   * Renderiza el documento HTML con el idioma especificado.
   *
   * @returns {JSX.Element} Estructura HTML con el atributo `lang` en la etiqueta `<html>`.
   */
  render() {
    const { locale } = this.props;

    return (
      <Html lang={locale}>
        <Head>
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
