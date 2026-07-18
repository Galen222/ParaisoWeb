/**
 * Construye una URL absoluta canónica para SEO y contenido compartido.
 * Elimina query y fragmento, y añade el prefijo de locale únicamente cuando Next.js
 * todavía no lo ha incluido en la ruta recibida.
 */
export const buildCanonicalPageUrl = (
  siteUrl: string,
  path: string,
  locale?: string,
  defaultLocale?: string,
  locales?: readonly string[]
): string => {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const pathWithoutHash = normalizedPath.split("#", 1)[0];
  const pathWithoutQuery = pathWithoutHash.split("?", 1)[0];
  const firstSegment = pathWithoutQuery.split("/").filter(Boolean)[0];
  const pathAlreadyHasLocale = Boolean(firstSegment && locales?.includes(firstSegment));
  const hasDefaultLocalePrefix = Boolean(
    defaultLocale && firstSegment === defaultLocale && locales?.includes(defaultLocale)
  );
  // El locale predeterminado no forma parte de la URL canónica aunque el visitante
  // haya escrito explícitamente `/es` o `/es/...` en la barra del navegador.
  const canonicalPath = hasDefaultLocalePrefix
    ? pathWithoutQuery.slice(`/${defaultLocale}`.length) || "/"
    : pathWithoutQuery;
  const shouldPrefixLocale = Boolean(locale && locale !== defaultLocale && !pathAlreadyHasLocale);
  const localePrefix = shouldPrefixLocale ? `/${locale}` : "";

  // Evita que la portada de un locale no predeterminado cambie entre `/en/` en SSR
  // y `/en` al hidratar en el navegador. Las demás rutas conservan su barra inicial.
  const localizedPath = localePrefix && canonicalPath === "/"
    ? localePrefix
    : `${localePrefix}${canonicalPath}`;

  return `${normalizedSiteUrl}${localizedPath}`;
};
