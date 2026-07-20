import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import {
  getServerSideSitemapLegacy,
  type IAlternateRef,
  type ISitemapField,
} from "next-sitemap";

import {
  getSitemapBlogEntries,
  type SitemapBlogEntry,
  type SitemapLocale,
} from "../services/sitemapService";
import { requireConfiguredPublicSiteUrl } from "../utils/publicSiteUrl";

const DEFAULT_LOCALE: SitemapLocale = "es";
const SUPPORTED_LOCALES: readonly SitemapLocale[] = ["es", "en", "de", "fr"];
const STATIC_ROUTES = [
  "/",
  "/san-bernardo",
  // Restaurante cerrado: "/bravo-murillo",
  "/reina-victoria",
  "/arenal",
  "/nosotros",
  "/gastronomia",
  "/charcuteria",
  "/blog",
  "/reservas",
  "/contacto",
  "/politica-cookies",
  "/politica-privacidad",
  "/aviso-legal",
] as const;

const getSiteUrl = (): string => requireConfiguredPublicSiteUrl();

const localizedPath = (locale: SitemapLocale, route: string): string => {
  if (locale === DEFAULT_LOCALE) {
    return route;
  }
  return route === "/" ? `/${locale}` : `/${locale}${route}`;
};

const absoluteUrl = (siteUrl: string, path: string): string =>
  path === "/" ? `${siteUrl}/` : `${siteUrl}${path}`;

const buildStaticAlternateRefs = (siteUrl: string, route: string): IAlternateRef[] => {
  const refs: IAlternateRef[] = SUPPORTED_LOCALES.map((locale) => ({
    href: absoluteUrl(siteUrl, localizedPath(locale, route)),
    hreflang: locale,
    hrefIsAbsolute: true,
  }));

  refs.push({
    href: absoluteUrl(siteUrl, localizedPath(DEFAULT_LOCALE, route)),
    hreflang: "x-default",
    hrefIsAbsolute: true,
  });
  return refs;
};

const buildStaticFields = (siteUrl: string): ISitemapField[] =>
  STATIC_ROUTES.flatMap((route) => {
    const alternateRefs = buildStaticAlternateRefs(siteUrl, route);
    return SUPPORTED_LOCALES.map((locale) => ({
      loc: absoluteUrl(siteUrl, localizedPath(locale, route)),
      alternateRefs,
    }));
  });

const blogPath = (entry: SitemapBlogEntry): string => {
  const encodedSlug = encodeURIComponent(entry.slug.normalize("NFC"));
  return localizedPath(entry.idioma, `/blog/${encodedSlug}`);
};

const buildBlogFields = (
  siteUrl: string,
  entries: SitemapBlogEntry[]
): ISitemapField[] => {
  const entriesByArticle = new Map<number, SitemapBlogEntry[]>();
  for (const entry of entries) {
    const translations = entriesByArticle.get(entry.id_noticia) ?? [];
    translations.push(entry);
    entriesByArticle.set(entry.id_noticia, translations);
  }

  return entries.flatMap((entry) => {
    const translations = entriesByArticle.get(entry.id_noticia) ?? [entry];
    const alternateRefs: IAlternateRef[] = translations.map((translation) => ({
      href: absoluteUrl(siteUrl, blogPath(translation)),
      hreflang: translation.idioma,
      hrefIsAbsolute: true,
    }));
    const defaultTranslation =
      translations.find((translation) => translation.idioma === DEFAULT_LOCALE) ??
      translations[0];

    if (defaultTranslation) {
      alternateRefs.push({
        href: absoluteUrl(siteUrl, blogPath(defaultTranslation)),
        hreflang: "x-default",
        hrefIsAbsolute: true,
      });
    }

    return [
      {
        loc: absoluteUrl(siteUrl, blogPath(entry)),
        lastmod: entry.lastmod,
        alternateRefs,
      },
    ];
  });
};

export const getServerSideProps: GetServerSideProps<Record<string, never>> = async (
  context: GetServerSidePropsContext
) => {
  const { frontendLogger } = await import("../server/frontendLogger");

  try {
    const siteUrl = getSiteUrl();
    let blogEntries: SitemapBlogEntry[] = [];
    let blogEntriesAvailable = true;

    try {
      blogEntries = await getSitemapBlogEntries(frontendLogger);
    } catch (error: unknown) {
      blogEntriesAvailable = false;
      frontendLogger.error(
        "No se han podido añadir los artículos al sitemap; se publicarán las rutas estáticas:",
        error instanceof Error ? error.message : "error desconocido"
      );
    }

    const fields = [...buildStaticFields(siteUrl), ...buildBlogFields(siteUrl, blogEntries)];
    const uniqueFields = Array.from(
      new Map(fields.map((field) => [field.loc, field])).values()
    );

    context.res.setHeader(
      "Cache-Control",
      blogEntriesAvailable
        ? "public, s-maxage=300, stale-while-revalidate=600"
        : "public, s-maxage=60, stale-while-revalidate=300"
    );
    return getServerSideSitemapLegacy(context, uniqueFields);
  } catch (error) {
    frontendLogger.error(
      "No se ha podido generar el sitemap dinámico:",
      error instanceof Error ? error.message : "error desconocido"
    );
    context.res.statusCode = 503;
    context.res.setHeader("Cache-Control", "no-store");
    context.res.setHeader("Content-Type", "text/plain; charset=utf-8");
    context.res.end("Sitemap temporalmente no disponible");
    return { props: {} };
  }
};

export default function SitemapPage(): null {
  return null;
}
