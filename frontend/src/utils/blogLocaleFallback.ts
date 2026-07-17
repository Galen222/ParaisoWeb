export const SUPPORTED_BLOG_LOCALES = ["es", "en", "de"] as const;

/** Comprueba que el locale exista tanto en las rutas como en la API del blog. */
export const isSupportedBlogLocale = (locale: string): boolean =>
  SUPPORTED_BLOG_LOCALES.some((supportedLocale) => supportedLocale === locale);

/** Devuelve los otros idiomas en un orden estable para localizar un slug compartido. */
export const getBlogFallbackLocales = (locale: string): string[] =>
  SUPPORTED_BLOG_LOCALES.filter((supportedLocale) => supportedLocale !== locale);

/**
 * Selecciona un artículo localizado por el mismo slug en otros idiomas únicamente
 * cuando todas las coincidencias pertenecen a la misma noticia. Si dos idiomas usan
 * ese slug para noticias distintas, la ruta es ambigua y no debe redirigirse al azar.
 */
export const selectUniqueBlogFallbackPost = <T extends { id_noticia: number }>(
  posts: readonly T[]
): T | null => {
  const firstPost = posts[0];
  if (!firstPost) {
    return null;
  }

  return posts.every((post) => post.id_noticia === firstPost.id_noticia)
    ? firstPost
    : null;
};
