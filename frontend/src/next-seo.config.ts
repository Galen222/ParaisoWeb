// next-seo.config.ts

// Importa los tipos necesarios desde 'next-seo'
import { DefaultSeoProps } from "next-seo";

/**
 * Define la estructura de una meta tag HTML5.
 * Estas meta tags utilizan el atributo 'name'.
 */
interface HTML5MetaTag {
  name: string; // Nombre de la meta tag (e.g., "keywords")
  content: string; // Contenido de la meta tag
}

/**
 * Define la estructura de una meta tag RDFa.
 * Estas meta tags utilizan el atributo 'property'.
 */
interface RDFaMetaTag {
  property: string; // Propiedad de RDFa (e.g., "og:title")
  content: string; // Contenido de la meta tag
}

/**
 * Define la estructura de una meta tag HTTP Equiv.
 * Estas meta tags utilizan el atributo 'httpEquiv'.
 * Los valores permitidos están restringidos a los definidos por 'next-seo'.
 */
interface HTTPEquivMetaTag {
  httpEquiv: "x-ua-compatible" | "content-security-policy" | "content-type" | "default-style" | "refresh"; // Tipo de HTTP Equiv
  content: string; // Contenido de la meta tag
}

/**
 * Define el tipo 'MetaTag' como una unión de los tipos de meta tags anteriores.
 * Esto permite que 'additionalMetaTags' acepte cualquiera de los tres tipos.
 */
type MetaTag = HTML5MetaTag | RDFaMetaTag | HTTPEquivMetaTag;

/**
 * Obtiene la URL del sitio desde las variables de entorno.
 * Asegúrate de que 'NEXT_PUBLIC_SITE_URL' esté definido en tu archivo '.env'.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

/**
 * Configuración global de SEO utilizando 'next-seo'.
 * Este objeto será pasado al componente <DefaultSeo /> en '_app.tsx' para aplicar
 * las configuraciones SEO a todas las páginas de la aplicación.
 */
const SEO: DefaultSeoProps = {
  // Título por defecto del sitio
  title: "El Paraíso Del Jamón",

  // Descripción por defecto del sitio
  description: "Sitio Web de El Paraíso Del Jamón donde podrá ver información de los bares restaurantes, consultar la carta o contactar con nosotros.",

  // Configuración de Open Graph para mejorar la apariencia en redes sociales
  openGraph: {
    type: "website", // Tipo de contenido
    locale: "es_ES", // Idioma y región
    url: siteUrl, // URL canónica del sitio
    siteName: "El Paraíso Del Jamón", // Nombre del sitio
    images: [
      {
        url: `${siteUrl}/images/navbar/imagenLogo.png`, // URL de la imagen
        width: 1200, // Ancho de la imagen
        height: 630, // Alto de la imagen
        alt: "Logo de El Paraíso Del Jamón", // Texto alternativo de la imagen
      },
    ],
  },

  // Configuración para Twitter Cards
  twitter: {
    /* 
    handle: "@tuusuario", // Nombre de usuario de Twitter (opcional)
    site: "@tusitio",      // Nombre del sitio en Twitter (opcional)
    */
    cardType: "summary_large_image", // Tipo de tarjeta de Twitter
  },

  /**
   * Meta tags adicionales para mejorar el SEO.
   * Estas pueden incluir palabras clave, configuraciones de compatibilidad, etc.
   */
  additionalMetaTags: [
    {
      name: "keywords", // Meta tag de palabras clave
      content:
        "bar, restaurante, charcuteria, jamón, jamón ibérico, menu, carta, gastronomía, formulario de contacto, blog, San Bernardo, Bravo Murillo, Reina Victoria, Arenal",
    },
    {
      httpEquiv: "x-ua-compatible", // Meta tag de compatibilidad con navegadores
      content: "IE=edge,chrome=1", // Configuración específica
    },
  ] as MetaTag[], // Asegura que el array cumple con el tipo 'MetaTag[]'

  /**
   * Enlaces adicionales para el sitio.
   * Estos pueden incluir iconos, manifestos para PWA, etc.
   */
  additionalLinkTags: [
    {
      rel: "icon", // Relación del enlace (icono del sitio)
      href: "/images/web/iconoLogo.ico", // Ruta al icono
    },
    {
      rel: "apple-touch-icon", // Relación del enlace para dispositivos Apple
      href: "/images/web/apple-touch-icon.png", // Ruta al icono de Apple
      sizes: "180x180", // Tamaño del icono
    },
    /* 
    Este bloque está comentado porque no se está implementando la funcionalidad PWA actualmente.
    {
      rel: "manifest",
      href: "/manifest.json",
    },
    */
  ],
};

// Exporta la configuración SEO para que pueda ser utilizada en otros archivos
export default SEO;
