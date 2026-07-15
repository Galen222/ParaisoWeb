const DEFAULT_LOCALE = "es";

/**
 * Construye la ruta canónica de un artículo y codifica únicamente el segmento dinámico.
 * El sufijo puede contener query y fragmento ya formados, que deben conservarse sin cambios.
 */
export const buildBlogPath = (slug: string, suffix = ""): string =>
  `/blog/${encodeURIComponent(slug.normalize("NFC"))}${suffix}`;

/** Construye la ruta pública localizada; español continúa sin prefijo. */
export const buildLocalizedBlogPath = (
  locale: string,
  slug: string,
  suffix = ""
): string => `${locale === DEFAULT_LOCALE ? "" : `/${locale}`}${buildBlogPath(slug, suffix)}`;
