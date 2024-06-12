import Head from "next/head"; // Importa el componente Head de Next.js para manejar la cabecera del documento
import "@/styles/globals.css"; // Importa los estilos globales
import "bootstrap/dist/css/bootstrap.min.css"; // Importa estilos bootstrap
import type { AppProps } from "next/app"; // Importa el tipo AppProps de Next.js
import { useState, useEffect } from "react"; // Importa useState y useEffect de React
import { IntlProvider } from "react-intl"; // Importa IntlProvider de react-intl para la internacionalización
import Navbar from "../components/Navbar"; // Importa el componente Navbar
import Footer from "../components/Footer"; // Importa el componente Footer

// Función principal de la aplicación que recibe las propiedades del componente y de la página
export default function App({ Component, pageProps }: AppProps) {
  // Estado para manejar el idioma, inicializado a partir de la cookie o por defecto a "es"
  const [locale, setLocale] = useState(() => {
    // Verifica si está en el entorno del navegador
    if (typeof window !== "undefined") {
      // Si está en el navegador, busca la cookie "Idioma" y extrae su valor
      return (
        document.cookie
          .split("; ") // Divide las cookies en un array de cadenas
          .find((row) => row.startsWith("Idioma=")) // Encuentra la cadena que empieza con "Idioma="
          ?.split("=")[1] || "es" // Divide esa cadena en "Idioma=" y el valor del idioma, y retorna el valor o "es" si no se encuentra
      );
    }
    // Si no está en el entorno del navegador (por ejemplo, en el servidor), retorna "es" por defecto
    return "es";
  });

  // Carga los mensajes de localización correspondientes al idioma seleccionado
  const messages = require(`../locales/${locale}.json`);

  // Efecto que se ejecuta cuando cambia el idioma
  useEffect(() => {
    // Establece el atributo lang del documento HTML
    document.documentElement.lang = locale;
    // Actualiza la cookie con el nuevo idioma y establece su duración a 1 año
    document.cookie = `Idioma=${locale}; path=/; max-age=31536000`;
  }, [locale]);

  // Maneja el cambio de idioma
  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale); // Actualiza el estado del idioma
    document.cookie = `Idioma=${newLocale}; path=/; max-age=31536000`; // Actualiza la cookie con el nuevo idioma
  };

  return (
    <>
      <Head>
        <title>El Paraiso del Jamón</title> {/* Título de la página */}
        <meta name="description" content="El Paraiso del Jamón" /> {/* Descripción de la página */}
      </Head>
      {/* Proveedor de internacionalización */}
      <IntlProvider locale={locale} messages={messages}>
        {/* Barra de navegación, se pasa la función de cambio de idioma y el idioma actual como props */}
        <Navbar onLocaleChange={handleLocaleChange} currentLocale={locale} />
        <Component {...pageProps} /> {/* Componente principal de la página */}
        <Footer /> {/* Pie de página */}
      </IntlProvider>
    </>
  );
}
