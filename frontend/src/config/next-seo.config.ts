// config/next-seo.config.ts

import { DefaultSeoProps } from "next-seo";

/**
 * Define la estructura de una meta tag HTML5.
 */
interface HTML5MetaTag {
  name: string;
  content: string;
}

/**
 * Define la estructura de una meta tag RDFa.
 */
interface RDFaMetaTag {
  property: string;
  content: string;
}

/**
 * Define la estructura de una meta tag HTTP Equiv.
 */
interface HTTPEquivMetaTag {
  httpEquiv: "x-ua-compatible" | "content-security-policy" | "content-type" | "default-style" | "refresh";
  content: string;
}

/**
 * Define el tipo 'MetaTag' como una unión de los tipos de meta tags anteriores.
 */
type MetaTag = HTML5MetaTag | RDFaMetaTag | HTTPEquivMetaTag;

/**
 * Función para generar la configuración de SEO basada en el locale y los mensajes.
 *
 * @param {string} locale - Locale actual (e.g., 'es', 'en', 'de').
 * @param {Record<string, any>} messages - Mensajes localizados.
 * @returns {DefaultSeoProps} Configuración de SEO personalizada.
 */
const getSEOConfig = (locale: string, messages: Record<string, any>): DefaultSeoProps => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";

  /**
   * Formatea el locale al formato requerido por Open Graph y HTML lang.
   *
   * @param {string} locale - Locale corto (e.g., 'es', 'en', 'de').
   * @returns {string} Locale formateado (e.g., 'es-ES', 'en-US', 'de-DE').
   */
  const formatLocale = (locale: string): string => {
    switch (locale) {
      case "en":
        return "en-US";
      case "de":
        return "de-DE";
      case "es":
      default:
        return "es-ES";
    }
  };

  const formattedLocale = formatLocale(locale);
  return {
    title: messages["seo_titulo"] || "El Paraíso Del Jamón",
    description:
      messages["seo_descripcion"] ||
      "Sitio Web de El Paraíso Del Jamón donde podrá ver información de los bares restaurantes, consultar la carta o contactar con nosotros.",
    openGraph: {
      type: "website",
      locale: formattedLocale,
      url: siteUrl,
      siteName: "El Paraíso Del Jamón",
      images: [
        {
          url: `${siteUrl}/images/navbar/imagenLogo.png`,
          width: 1200,
          height: 700,
          alt: messages["seo_og_image_alt"] || "Logo El Paraíso Del Jamón",
        },
      ],
    },
    twitter: {
      cardType: "summary_large_image",
      // site: "@TuNombreDeUsuario", // Añadir el nombre de usuario de Twitter
    },
    additionalMetaTags: [
      {
        name: "PACAVA S.A",
        content: "El Paraíso Del Jamón",
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        name: "keywords",
        content: messages["seo_keywords"],
      },
      {
        httpEquiv: "x-ua-compatible",
        content: "IE=edge,chrome=1",
      },
    ] as MetaTag[],
    additionalLinkTags: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
      {
        rel: "icon",
        href: "/images/web/iconoLogo.ico",
      },
      {
        rel: "apple-touch-icon",
        href: "/images/web/apple-touch-icon.png",
        sizes: "180x180",
      },
      {
        rel: "canonical",
        href: `${siteUrl}${locale === "es" ? "" : `/${locale}`}`, // Genera el enlace canónico basado en el locale
      },
      // Etiquetas hreflang con códigos completos
      ...[
        { lng: "es", region: "ES" },
        { lng: "en", region: "US" },
        { lng: "de", region: "DE" },
      ].map(({ lng, region }) => ({
        rel: "alternate",
        href: `${siteUrl}/${lng === "es" ? "" : lng}/`,
        hrefLang: `${lng}-${region}`,
      })),
      {
        rel: "alternate",
        href: `${siteUrl}/`, // La versión por defecto en español
        hrefLang: "x-default",
      },
    ],
  };
};

export default getSEOConfig;
