import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    let locale = "es"; // Default to Spanish
    const cookieLocale = ctx.req?.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("Idioma="))
      ?.split("=")[1];
    if (cookieLocale) {
      locale = cookieLocale;
    } else if (ctx.req?.headers["accept-language"]) {
      const browserLang = ctx.req.headers["accept-language"].split(",")[0].slice(0, 2);
      locale = ["es", "en"].includes(browserLang) ? browserLang : "es";
    }
    return { ...initialProps, locale };
  }

  render() {
    const { locale } = this.props;
    return (
      <Html lang={locale}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/images/favicon.ico" />
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
