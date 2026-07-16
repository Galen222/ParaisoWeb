export const SUPPORTED_BLOG_LOCALES = ["es", "en", "de"] as const;

/** Comprueba que el locale exista tanto en las rutas como en la API del blog. */
export const isSupportedBlogLocale = (locale: string): boolean =>
  SUPPORTED_BLOG_LOCALES.some((supportedLocale) => supportedLocale === locale);

/** Devuelve los otros idiomas en un orden estable para localizar un slug compartido. */
export const getBlogFallbackLocales = (locale: string): string[] =>
  SUPPORTED_BLOG_LOCALES.filter((supportedLocale) => supportedLocale !== locale);
