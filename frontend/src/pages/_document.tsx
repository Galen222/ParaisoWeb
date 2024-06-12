import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

// Define una clase personalizada para el documento de Next.js
class MyDocument extends Document {
  // Método estático para obtener las propiedades iniciales del documento
  static async getInitialProps(ctx: DocumentContext) {
    // Obtiene las propiedades iniciales del documento utilizando el método de Document
    const initialProps = await Document.getInitialProps(ctx);
    let locale = "es"; // Establece el idioma predeterminado a español

    // Intenta obtener el idioma de la cookie "Idioma"
    const cookieLocale = ctx.req?.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("Idioma="))
      ?.split("=")[1];

    // Si existe la cookie, usa su valor como el idioma
    if (cookieLocale) {
      locale = cookieLocale;
    } else if (ctx.req?.headers["accept-language"]) {
      // Si no existe la cookie, intenta obtener el idioma del navegador
      const browserLang = ctx.req.headers["accept-language"].split(",")[0].slice(0, 2);
      // Establece el idioma en español o inglés si está disponible, de lo contrario, usa español
      locale = ["es", "en"].includes(browserLang) ? browserLang : "es";
    }

    // Retorna las propiedades iniciales junto con el idioma seleccionado
    return { ...initialProps, locale };
  }

  // Método render para definir la estructura del documento HTML
  render() {
    const { locale } = this.props; // Obtiene el idioma de las propiedades del componente

    return (
      // Establece el atributo lang del elemento Html según el idioma seleccionado
      <Html lang={locale}>
        <Head>
          {/* Meta etiqueta para configurar la vista en dispositivos móviles */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {/* Enlace al icono de la página*/}
          <link rel="icon" href="/images/iconoLogo.ico" />
        </Head>
        <body>
          <Main /> {/* Renderiza la aplicación principal de Next.js */}
          <NextScript /> {/* Incluye los scripts necesarios para Next.js */}
        </body>
      </Html>
    );
  }
}

// Exporta la clase MyDocument como el componente por defecto del módulo
export default MyDocument;
