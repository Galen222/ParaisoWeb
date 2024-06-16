import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    let locale = "es"; // Default language

    // Attempt to retrieve the locale from the 'locale' cookie
    const cookieLocale = ctx.req?.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("_locale="))
      ?.split("=")[1];

    // Validate and use cookieLocale if it's within the expected values
    if (cookieLocale && ["es", "en", "de"].includes(cookieLocale)) {
      locale = cookieLocale;
    } else if (ctx.req?.headers["accept-language"]) {
      // Fallback to browser language if no valid cookie is found
      const browserLang = ctx.req.headers["accept-language"].split(",")[0].slice(0, 2);
      locale = ["es", "en", "de"].includes(browserLang) ? browserLang : "es";
    }

    return { ...initialProps, locale };
  }

  render() {
    const { locale } = this.props;

    return (
      <Html lang={locale}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/images/iconoLogo.ico" />
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
