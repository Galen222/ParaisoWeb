// config/next-seo.config.ts

import { DefaultSeoProps } from "next-seo";

const DEFAULT_LOCALE = "es";
const SUPPORTED_LOCALES = new Set(["es", "en", "de"]);

/** Normaliza la ruta actual eliminando query, hash y un posible prefijo de idioma. */
const normalizeRoutePath = (currentPath: string): string => {
  const pathWithoutQueryOrHash = currentPath.split(/[?#]/, 1)[0] || "/";
  const normalizedPath = `/${pathWithoutQueryOrHash}`.replace(/\/{2,}/g, "/");
  const segments = normalizedPath.split("/").filter(Boolean);

  if (segments[0] && SUPPORTED_LOCALES.has(segments[0])) {
    segments.shift();
  }

  return segments.length > 0 ? `/${segments.join("/")}` : "/";
};

/** Construye una URL localizada sin añadir `/es` al idioma predeterminado. */
const buildLocalizedUrl = (siteUrl: string, locale: string, routePath: string): string => {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, "");

  if (routePath === "/") {
    return locale === DEFAULT_LOCALE ? `${normalizedSiteUrl}/` : `${normalizedSiteUrl}/${locale}`;
  }

  return `${normalizedSiteUrl}${locale === DEFAULT_LOCALE ? "" : `/${locale}`}${routePath}`;
};

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
 * @param {Record<string, string>} messages - Mensajes localizados.
 * @param {string} [currentPath] - Ruta actual para generar canonical y hreflang correctos.
 * @param {boolean} [includeLanguageAlternates=true] - Permite omitir alternates cuando las rutas traducidas usan slugs diferentes.
 * @returns {DefaultSeoProps} Configuración de SEO personalizada.
 */
const getSEOConfig = (
  locale: string,
  messages: Record<string, string>,
  currentPath?: string,
  includeLanguageAlternates = true
): DefaultSeoProps => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";
  const routePath = currentPath ? normalizeRoutePath(currentPath) : null;
  const currentUrl = routePath ? buildLocalizedUrl(siteUrl, locale, routePath) : siteUrl;

  /**
   * Formatea el locale al formato requerido por Open Graph.
   *
   * @param {string} locale - Locale corto (e.g., 'es', 'en', 'de').
   * @returns {string} Locale formateado para Open Graph (e.g., 'es_ES', 'en_US', 'de_DE').
   */
  const formatLocale = (locale: string): string => {
    switch (locale) {
      case "en":
        return "en_US";
      case "de":
        return "de_DE";
      case "es":
      default:
        return "es_ES";
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
      url: currentUrl,
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
    canonical: routePath ? currentUrl : undefined,
    languageAlternates:
      routePath && includeLanguageAlternates
        ? [
            // Etiquetas hreflang con códigos completos para la misma ruta estática.
            ...[
              { lng: "es", region: "ES" },
              { lng: "en", region: "US" },
              { lng: "de", region: "DE" },
            ].map(({ lng, region }) => ({
              href: buildLocalizedUrl(siteUrl, lng, routePath),
              hrefLang: `${lng}-${region}`,
            })),
            {
              href: buildLocalizedUrl(siteUrl, DEFAULT_LOCALE, routePath),
              hrefLang: "x-default",
            },
          ]
        : undefined,
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
    ],
  };
};

export default getSEOConfig;
